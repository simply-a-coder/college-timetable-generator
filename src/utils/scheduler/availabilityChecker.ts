
import { ScheduleSession, SchedulerData, Slot, AvailabilityResult } from './types';
import { TimetableEntry, Classroom } from '@/types';

export class AvailabilityChecker {
  private data: SchedulerData;

  constructor(data: SchedulerData) {
    this.data = data;
  }

  checkAvailability(
    session: ScheduleSession, 
    slot: Slot, 
    schedule: Map<string, TimetableEntry[]>
  ): AvailabilityResult {
    console.log(`Checking availability for session ${session.courseId} at ${slot.day} ${slot.time}`);

    const course = this.data.courses.find(c => c.id === session.courseId);
    if (!course) {
      console.log('Course not found');
      return { available: false };
    }

    // Find suitable classrooms
    const suitableClassrooms = this.data.classrooms.filter(classroom => {
      // Check room type compatibility
      if (classroom.type !== course.room_type) return false;

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
        console.log(`Classroom ${classroom.name} capacity ${classroom.capacity} < required ${requiredCapacity}`);
        return false;
      }

      // Check if classroom is available at this time
      const roomKey = `room-${classroom.id}`;
      const roomSchedule = schedule.get(roomKey) || [];
      const roomConflict = roomSchedule.find(entry => 
        entry.day === slot.day && entry.time === slot.time
      );

      return !roomConflict;
    });

    if (suitableClassrooms.length === 0) {
      console.log('No suitable classrooms available');
      return { available: false };
    }

    // Sort by capacity (prefer smaller suitable rooms)
    suitableClassrooms.sort((a, b) => a.capacity - b.capacity);

    console.log(`Found ${suitableClassrooms.length} suitable classrooms, using ${suitableClassrooms[0].name}`);
    return { 
      available: true, 
      classroom: suitableClassrooms[0] 
    };
  }
}
