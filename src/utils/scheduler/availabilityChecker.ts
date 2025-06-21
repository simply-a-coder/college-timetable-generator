
import { TIME_SLOTS } from '@/types';
import { Slot, ScheduleSession, AvailabilityResult, SchedulerData } from './types';
import { TimetableEntry, Section, Teacher, Classroom } from '@/types';

export class AvailabilityChecker {
  private data: SchedulerData;
  private schedule: Map<string, TimetableEntry>;
  private slots: Slot[];

  constructor(data: SchedulerData, schedule: Map<string, TimetableEntry>, slots: Slot[]) {
    this.data = data;
    this.schedule = schedule;
    this.slots = slots;
  }

  private getSlotKey(sectionId: string, day: string, time: string): string {
    return `${sectionId}-${day}-${time}`;
  }

  private getRoomKey(roomId: string, day: string, time: string): string {
    return `${roomId}-${day}-${time}`;
  }

  private getTeacherKey(teacherId: string, day: string, time: string): string {
    return `${teacherId}-${day}-${time}`;
  }

  private isWithinLectureTimings(timeSlot: string, lecture_timings: string, roomType: 'lecture_hall' | 'computer_lab'): boolean {
    // Labs can be scheduled outside lecture timings
    if (roomType === 'computer_lab') return true;

    const timeIndex = TIME_SLOTS.indexOf(timeSlot);
    
    switch (lecture_timings) {
      case '8-1': // 8:00 AM - 1:00 PM
        return timeIndex >= 0 && timeIndex <= 4; // Up to 12:55
      case '10-4': // 10:00 AM - 4:00 PM  
        return timeIndex >= 2 && timeIndex <= 7; // 10:05 to 15:55
      case '1-4': // 1:00 PM - 4:00 PM
        return timeIndex >= 5 && timeIndex <= 7; // 13:05 to 15:55
      default:
        return true;
    }
  }

  checkSlotAvailability(sectionId: string, teacherId: string, slot: Slot, duration: number, roomType: 'lecture_hall' | 'computer_lab'): AvailabilityResult {
    // Check if slot conflicts with section's lecture timing restrictions
    const section = this.data.sections.find(s => s.id === sectionId);
    if (section && section.lecture_timings) {
      if (!this.isWithinLectureTimings(slot.time, section.lecture_timings, roomType)) {
        return { available: false };
      }
    }

    // Check section-specific break rules
    const sectionBreakRule = this.data.rules.section_break_rules[sectionId];
    if (sectionBreakRule?.hasBreak && sectionBreakRule.breakSlot === slot.time) {
      return { available: false };
    }

    // Check if teacher is available
    const teacher = this.data.teachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.available_days.includes(slot.day) || !teacher.available_slots.includes(slot.time)) {
      return { available: false };
    }

    // Check for conflicts in consecutive slots for duration
    for (let i = 0; i < duration; i++) {
      const currentSlotIndex = slot.index + i;
      const currentSlot = this.slots.find(s => s.index === currentSlotIndex);
      
      if (!currentSlot) return { available: false };

      // Check section conflict
      const sectionKey = this.getSlotKey(sectionId, currentSlot.day, currentSlot.time);
      if (this.schedule.has(sectionKey)) {
        return { available: false };
      }

      // Check teacher conflict
      const teacherKey = this.getTeacherKey(teacherId, currentSlot.day, currentSlot.time);
      const teacherConflict = Array.from(this.schedule.values()).find(entry => 
        this.getTeacherKey(entry.teacher, entry.day, entry.time) === teacherKey
      );
      if (teacherConflict) {
        return { available: false };
      }
    }

    // Find available classroom
    const availableClassroom = this.data.classrooms.find(classroom => {
      if (classroom.type !== roomType) return false;
      
      // Check capacity for section
      if (section && classroom.capacity < section.student_count) return false;
      
      for (let i = 0; i < duration; i++) {
        const currentSlotIndex = slot.index + i;
        const currentSlot = this.slots.find(s => s.index === currentSlotIndex);
        
        if (!currentSlot) return false;
        
        const roomKey = this.getRoomKey(classroom.id, currentSlot.day, currentSlot.time);
        const roomConflict = Array.from(this.schedule.values()).find(entry => 
          this.getRoomKey(entry.room, entry.day, entry.time) === roomKey
        );
        
        if (roomConflict) return false;
      }
      
      return true;
    });

    return { available: !!availableClassroom, classroom: availableClassroom };
  }
}
