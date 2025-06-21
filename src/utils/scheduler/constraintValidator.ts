
import { ScheduleSession, SchedulerData, Slot } from './types';
import { TimetableEntry } from '@/types';

export class ConstraintValidator {
  private data: SchedulerData;
  private schedule: Map<string, TimetableEntry[]>;

  constructor(data: SchedulerData) {
    this.data = data;
    this.schedule = new Map();
  }

  setSchedule(schedule: Map<string, TimetableEntry[]>) {
    this.schedule = schedule;
  }

  canSchedule(session: ScheduleSession, slot: Slot, classroom: any): boolean {
    console.log(`🔍 CONSTRAINT VALIDATION for ${session.courseId} at ${slot.day} ${slot.time}`);

    // 1. Check teacher availability and conflicts
    if (!this.isTeacherAvailable(session, slot)) {
      console.log(`❌ Teacher ${session.teacherId} not available at ${slot.day} ${slot.time}`);
      return false;
    }

    // 2. Check section conflicts
    if (!this.isSectionAvailable(session, slot)) {
      console.log(`❌ Section ${session.sectionId} has conflict at ${slot.day} ${slot.time}`);
      return false;
    }

    // 3. Check classroom capacity and availability
    if (!this.isClassroomSuitable(session, classroom)) {
      console.log(`❌ Classroom ${classroom.name} not suitable for session`);
      return false;
    }

    // 4. Check lunch break constraints
    if (!this.respectsLunchBreak(slot)) {
      console.log(`❌ Slot ${slot.time} conflicts with lunch break`);
      return false;
    }

    // 5. Check section-specific break rules
    if (!this.respectsSectionBreakRules(session, slot)) {
      console.log(`❌ Section break rule violated for ${session.sectionId}`);
      return false;
    }

    // 6. Check back-to-back constraints
    if (!this.respectsBackToBackRules(session, slot)) {
      console.log(`❌ Back-to-back constraint violated for course ${session.courseId}`);
      return false;
    }

    // 7. Check daily limits
    if (!this.respectsDailyLimits(session, slot)) {
      console.log(`❌ Daily limits exceeded for ${slot.day}`);
      return false;
    }

    // 8. Check travel gap
    if (!this.respectsTravelGap(session, slot)) {
      console.log(`❌ Travel gap constraint violated`);
      return false;
    }

    // 9. Check allowed time slots
    if (!this.isSlotAllowed(slot)) {
      console.log(`❌ Time slot ${slot.time} not in allowed slots`);
      return false;
    }

    console.log(`✅ All constraints satisfied for ${session.courseId} at ${slot.day} ${slot.time}`);
    return true;
  }

  private isTeacherAvailable(session: ScheduleSession, slot: Slot): boolean {
    const teacher = this.data.teachers.find(t => t.id === session.teacherId);
    if (!teacher) {
      console.log(`Teacher ${session.teacherId} not found`);
      return false;
    }

    // Check if teacher is available on this day
    if (!teacher.available_days.includes(slot.day)) {
      console.log(`Teacher ${teacher.name} not available on ${slot.day}`);
      return false;
    }

    // Check if teacher is available at this time
    if (!teacher.available_slots.includes(slot.time)) {
      console.log(`Teacher ${teacher.name} not available at ${slot.time}`);
      return false;
    }

    // Check if teacher has days off
    if (teacher.days_off.includes(slot.day)) {
      console.log(`Teacher ${teacher.name} has day off on ${slot.day}`);
      return false;
    }

    // Check if teacher already has a class at this time
    const teacherSchedule = this.schedule.get(`teacher-${session.teacherId}`) || [];
    const conflict = teacherSchedule.find(entry => 
      entry.day === slot.day && entry.time === slot.time
    );
    
    if (conflict) {
      console.log(`Teacher ${teacher.name} already has ${conflict.course} at ${slot.day} ${slot.time}`);
      return false;
    }

    return true;
  }

  private isSectionAvailable(session: ScheduleSession, slot: Slot): boolean {
    if (session.isGroupClass && session.groupSections) {
      // Check all sections in the group
      for (const sectionId of session.groupSections) {
        const sectionSchedule = this.schedule.get(`section-${sectionId}`) || [];
        const conflict = sectionSchedule.find(entry => 
          entry.day === slot.day && entry.time === slot.time
        );
        if (conflict) {
          console.log(`Section ${sectionId} in group has conflict: ${conflict.course}`);
          return false;
        }
      }
    } else {
      const sectionSchedule = this.schedule.get(`section-${session.sectionId}`) || [];
      const conflict = sectionSchedule.find(entry => 
        entry.day === slot.day && entry.time === slot.time
      );
      if (conflict) {
        console.log(`Section ${session.sectionId} has conflict: ${conflict.course}`);
        return false;
      }
    }

    return true;
  }

  private isClassroomSuitable(session: ScheduleSession, classroom: any): boolean {
    const course = this.data.courses.find(c => c.id === session.courseId);
    if (!course) {
      console.log(`Course ${session.courseId} not found`);
      return false;
    }

    // Check room type compatibility
    if (course.room_type !== classroom.type) {
      console.log(`Room type mismatch: need ${course.room_type}, got ${classroom.type}`);
      return false;
    }

    // Check capacity
    let requiredCapacity = 0;
    if (session.isGroupClass && session.groupSections) {
      for (const sectionId of session.groupSections) {
        const section = this.data.sections.find(s => s.id === sectionId);
        if (section) requiredCapacity += section.student_count;
      }
    } else {
      const section = this.data.sections.find(s => s.id === session.sectionId);
      if (section) requiredCapacity = section.student_count;
    }

    if (classroom.capacity < requiredCapacity) {
      console.log(`Capacity insufficient: need ${requiredCapacity}, got ${classroom.capacity}`);
      return false;
    }

    return true;
  }

  private respectsLunchBreak(slot: Slot): boolean {
    const rules = this.data.rules;
    const lunchSlots = this.getLunchSlots();
    
    // Don't schedule during lunch break window
    if (lunchSlots.includes(slot.time)) {
      console.log(`Slot ${slot.time} is in lunch window: ${rules.lunch_start_slot} to ${rules.lunch_end_slot}`);
      return false;
    }

    return true;
  }

  private respectsSectionBreakRules(session: ScheduleSession, slot: Slot): boolean {
    const rules = this.data.rules;
    
    if (session.isGroupClass && session.groupSections) {
      // Check break rules for all sections in group
      for (const sectionId of session.groupSections) {
        const sectionBreakRule = rules.section_break_rules[sectionId];
        if (sectionBreakRule && sectionBreakRule.hasBreak && sectionBreakRule.breakSlot === slot.time) {
          console.log(`Section ${sectionId} has break at ${slot.time}`);
          return false;
        }
      }
    } else {
      const sectionBreakRule = rules.section_break_rules[session.sectionId];
      if (sectionBreakRule && sectionBreakRule.hasBreak && sectionBreakRule.breakSlot === slot.time) {
        console.log(`Section ${session.sectionId} has break at ${slot.time}`);
        return false;
      }
    }

    return true;
  }

  private respectsBackToBackRules(session: ScheduleSession, slot: Slot): boolean {
    const course = this.data.courses.find(c => c.id === session.courseId);
    if (!course || !course.no_back_to_back.length) return true;

    const sectionSchedule = this.schedule.get(`section-${session.sectionId}`) || [];
    
    // Get time slot index for adjacency checking
    const currentSlotIndex = this.data.rules.allowed_slots.indexOf(slot.time);
    if (currentSlotIndex === -1) return false;

    // Check if any no-back-to-back courses are scheduled adjacent to this slot
    for (const noBBCourseId of course.no_back_to_back) {
      const noBBCourse = this.data.courses.find(c => c.id === noBBCourseId);
      if (!noBBCourse) continue;

      const adjacentEntries = sectionSchedule.filter(entry => 
        entry.day === slot.day && entry.course === noBBCourse.code
      );
      
      for (const entry of adjacentEntries) {
        const entrySlotIndex = this.data.rules.allowed_slots.indexOf(entry.time);
        if (entrySlotIndex !== -1 && Math.abs(currentSlotIndex - entrySlotIndex) === 1) {
          console.log(`Back-to-back violation: ${course.code} and ${noBBCourse.code}`);
          return false;
        }
      }
    }

    return true;
  }

  private respectsDailyLimits(session: ScheduleSession, slot: Slot): boolean {
    const rules = this.data.rules;
    const course = this.data.courses.find(c => c.id === session.courseId);
    if (!course) return false;

    const sectionSchedule = this.schedule.get(`section-${session.sectionId}`) || [];
    const dayEntries = sectionSchedule.filter(entry => entry.day === slot.day);

    if (course.room_type === 'lecture_hall') {
      const lectureEntries = dayEntries.filter(entry => {
        const entryCourse = this.data.courses.find(c => c.code === entry.course);
        return entryCourse && entryCourse.room_type === 'lecture_hall';
      });
      
      if (lectureEntries.length >= rules.max_lectures_per_day) {
        console.log(`Max lectures per day (${rules.max_lectures_per_day}) exceeded`);
        return false;
      }
    } else {
      const labEntries = dayEntries.filter(entry => {
        const entryCourse = this.data.courses.find(c => c.code === entry.course);
        return entryCourse && entryCourse.room_type !== 'lecture_hall';
      });
      
      if (labEntries.length >= rules.max_labs_per_day) {
        console.log(`Max labs per day (${rules.max_labs_per_day}) exceeded`);
        return false;
      }
    }

    return true;
  }

  private respectsTravelGap(session: ScheduleSession, slot: Slot): boolean {
    const rules = this.data.rules;
    if (rules.travel_gap_minutes <= 0) return true;

    // This is a simplified implementation
    // In a real scenario, you'd check building locations and calculate travel time
    const sectionSchedule = this.schedule.get(`section-${session.sectionId}`) || [];
    const dayEntries = sectionSchedule.filter(entry => entry.day === slot.day);
    
    // For now, assume travel gap is satisfied if there's at least one slot gap
    const currentSlotIndex = this.data.rules.allowed_slots.indexOf(slot.time);
    
    for (const entry of dayEntries) {
      const entrySlotIndex = this.data.rules.allowed_slots.indexOf(entry.time);
      if (Math.abs(currentSlotIndex - entrySlotIndex) === 1) {
        // Adjacent slots - check if different room types (assuming different buildings)
        const course = this.data.courses.find(c => c.id === session.courseId);
        const entryCourse = this.data.courses.find(c => c.code === entry.course);
        
        if (course && entryCourse && course.room_type !== entryCourse.room_type) {
          console.log(`Travel gap needed between ${course.room_type} and ${entryCourse.room_type}`);
          return false;
        }
      }
    }

    return true;
  }

  private isSlotAllowed(slot: Slot): boolean {
    return this.data.rules.allowed_slots.includes(slot.time);
  }

  private getLunchSlots(): string[] {
    const rules = this.data.rules;
    const lunchStartIndex = this.data.rules.allowed_slots.indexOf(rules.lunch_start_slot);
    const lunchEndIndex = this.data.rules.allowed_slots.indexOf(rules.lunch_end_slot);
    
    if (lunchStartIndex === -1 || lunchEndIndex === -1) return [];
    
    return this.data.rules.allowed_slots.slice(lunchStartIndex, lunchEndIndex + 1);
  }
}
