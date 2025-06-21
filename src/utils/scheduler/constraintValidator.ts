
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
    console.log(`Validating constraints for session ${session.courseId} at ${slot.day} ${slot.time}`);

    // Check teacher availability
    if (!this.isTeacherAvailable(session, slot)) {
      console.log(`Teacher ${session.teacherId} not available at ${slot.day} ${slot.time}`);
      return false;
    }

    // Check section conflicts
    if (!this.isSectionAvailable(session, slot)) {
      console.log(`Section ${session.sectionId} has conflict at ${slot.day} ${slot.time}`);
      return false;
    }

    // Check classroom capacity
    if (!this.isClassroomSuitable(session, classroom)) {
      console.log(`Classroom ${classroom.name} not suitable for session`);
      return false;
    }

    // Check lunch break constraints
    if (!this.respectsLunchBreak(slot)) {
      console.log(`Slot ${slot.time} conflicts with lunch break`);
      return false;
    }

    // Check back-to-back constraints
    if (!this.respectsBackToBackRules(session, slot)) {
      console.log(`Back-to-back constraint violated for course ${session.courseId}`);
      return false;
    }

    // Check daily limits
    if (!this.respectsDailyLimits(session, slot)) {
      console.log(`Daily limits exceeded for ${slot.day}`);
      return false;
    }

    // Check travel gap
    if (!this.respectsTravelGap(session, slot)) {
      console.log(`Travel gap constraint violated`);
      return false;
    }

    return true;
  }

  private isTeacherAvailable(session: ScheduleSession, slot: Slot): boolean {
    const teacher = this.data.teachers.find(t => t.id === session.teacherId);
    if (!teacher) return false;

    // Check if teacher is available on this day
    if (!teacher.available_days.includes(slot.day)) return false;

    // Check if teacher is available at this time
    if (!teacher.available_slots.includes(slot.time)) return false;

    // Check if teacher has days off
    if (teacher.days_off.includes(slot.day)) return false;

    // Check if teacher already has a class at this time
    const teacherSchedule = this.schedule.get(`teacher-${session.teacherId}`) || [];
    const conflict = teacherSchedule.find(entry => 
      entry.day === slot.day && entry.time === slot.time
    );
    
    return !conflict;
  }

  private isSectionAvailable(session: ScheduleSession, slot: Slot): boolean {
    if (session.isGroupClass && session.groupSections) {
      // Check all sections in the group
      for (const sectionId of session.groupSections) {
        const sectionSchedule = this.schedule.get(`section-${sectionId}`) || [];
        const conflict = sectionSchedule.find(entry => 
          entry.day === slot.day && entry.time === slot.time
        );
        if (conflict) return false;
      }
    } else {
      const sectionSchedule = this.schedule.get(`section-${session.sectionId}`) || [];
      const conflict = sectionSchedule.find(entry => 
        entry.day === slot.day && entry.time === slot.time
      );
      if (conflict) return false;
    }

    return true;
  }

  private isClassroomSuitable(session: ScheduleSession, classroom: any): boolean {
    const course = this.data.courses.find(c => c.id === session.courseId);
    if (!course) return false;

    // Check room type compatibility
    if (course.room_type !== classroom.type) return false;

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

    return classroom.capacity >= requiredCapacity;
  }

  private respectsLunchBreak(slot: Slot): boolean {
    const rules = this.data.rules;
    const lunchSlots = [rules.lunch_start_slot, rules.lunch_end_slot];
    
    // Don't schedule during lunch break
    return !lunchSlots.includes(slot.time);
  }

  private respectsBackToBackRules(session: ScheduleSession, slot: Slot): boolean {
    const course = this.data.courses.find(c => c.id === session.courseId);
    if (!course || !course.no_back_to_back.length) return true;

    const sectionSchedule = this.schedule.get(`section-${session.sectionId}`) || [];
    
    // Check if any no-back-to-back courses are scheduled adjacent to this slot
    for (const noBBCourseId of course.no_back_to_back) {
      const adjacentEntries = sectionSchedule.filter(entry => 
        entry.day === slot.day && entry.course === noBBCourseId
      );
      
      // Check time adjacency (this is simplified - you might need more sophisticated time checking)
      for (const entry of adjacentEntries) {
        if (this.areTimeSlotsAdjacent(slot.time, entry.time)) {
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
      return dayEntries.length < rules.max_lectures_per_day;
    } else {
      const labEntries = dayEntries.filter(entry => {
        const entryCourse = this.data.courses.find(c => c.code === entry.course);
        return entryCourse && entryCourse.room_type !== 'lecture_hall';
      });
      return labEntries.length < rules.max_labs_per_day;
    }
  }

  private respectsTravelGap(session: ScheduleSession, slot: Slot): boolean {
    // This is a simplified implementation
    // In a real scenario, you'd check if there's enough time between classes in different buildings
    return true;
  }

  private areTimeSlotsAdjacent(time1: string, time2: string): boolean {
    // Simplified adjacency check - you might need more sophisticated time parsing
    const timeSlots = this.data.rules.allowed_slots;
    const index1 = timeSlots.indexOf(time1);
    const index2 = timeSlots.indexOf(time2);
    
    return Math.abs(index1 - index2) === 1;
  }
}
