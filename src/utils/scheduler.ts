
import { Section, Teacher, Course, GroupClass, Assignment, Rules, TimetableEntry, TIME_SLOTS, DAYS, Classroom } from '@/types';

interface Slot {
  day: string;
  time: string;
  index: number;
}

interface ScheduleSession {
  sectionId: string;
  teacherId: string;
  courseId: string;
  duration: number;
  roomType: 'lecture_hall' | 'computer_lab';
  isGroupClass?: boolean;
  groupSections?: string[];
}

export class TimetableScheduler {
  private sections: Section[] = [];
  private teachers: Teacher[] = [];
  private courses: Course[] = [];
  private groups: GroupClass[] = [];
  private assignments: Assignment[] = [];
  private rules: Rules;
  private slots: Slot[] = [];
  private classrooms: Classroom[] = [];
  private schedule: Map<string, TimetableEntry> = new Map();

  constructor(
    sections: Section[],
    teachers: Teacher[],
    courses: Course[],
    groups: GroupClass[],
    assignments: Assignment[],
    rules: Rules,
    classrooms: Classroom[]
  ) {
    this.sections = sections;
    this.teachers = teachers;
    this.courses = courses;
    this.groups = groups;
    this.assignments = assignments;
    this.rules = rules;
    this.classrooms = classrooms;
    
    this.initializeSlots();
  }

  private initializeSlots() {
    this.slots = [];
    DAYS.slice(0, 5).forEach((day, dayIndex) => {
      TIME_SLOTS.forEach((time, timeIndex) => {
        if (this.rules.allowed_slots.includes(time)) {
          this.slots.push({
            day,
            time,
            index: dayIndex * TIME_SLOTS.length + timeIndex
          });
        }
      });
    });
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

  private isSlotAvailable(sectionId: string, teacherId: string, slot: Slot, duration: number, roomType: 'lecture_hall' | 'computer_lab'): { available: boolean; classroom?: Classroom } {
    // Check if slot conflicts with section's lecture timing restrictions
    const section = this.sections.find(s => s.id === sectionId);
    if (section && section.lecture_timings) {
      if (!this.isWithinLectureTimings(slot.time, section.lecture_timings, roomType)) {
        return { available: false };
      }
    }

    // Check section-specific break rules
    const sectionBreakRule = this.rules.section_break_rules[sectionId];
    if (sectionBreakRule?.hasBreak && sectionBreakRule.breakSlot === slot.time) {
      return { available: false };
    }

    // Check if teacher is available
    const teacher = this.teachers.find(t => t.id === teacherId);
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
    const availableClassroom = this.classrooms.find(classroom => {
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

  private generateSessions(): ScheduleSession[] {
    const sessions: ScheduleSession[] = [];

    for (const assignment of this.assignments) {
      const course = this.courses.find(c => c.id === assignment.course_id);
      const teacher = this.teachers.find(t => t.id === assignment.teacher_id);
      
      if (!course || !teacher || !assignment.section_or_group_ids?.length) continue;

      for (const sectionOrGroupId of assignment.section_or_group_ids) {
        if (assignment.type === 'group') {
          const group = this.groups.find(g => g.id === sectionOrGroupId);
          if (!group) continue;

          const sessionsCount = group.sessions_override || course.sessions_per_week;
          
          for (let i = 0; i < sessionsCount; i++) {
            sessions.push({
              sectionId: group.id,
              teacherId: assignment.teacher_id,
              courseId: assignment.course_id,
              duration: course.number_of_hours,
              roomType: course.room_type as 'lecture_hall' | 'computer_lab',
              isGroupClass: true,
              groupSections: group.sections
            });
          }
        } else {
          for (let i = 0; i < course.sessions_per_week; i++) {
            sessions.push({
              sectionId: sectionOrGroupId,
              teacherId: assignment.teacher_id,
              courseId: assignment.course_id,
              duration: course.number_of_hours,
              roomType: course.room_type as 'lecture_hall' | 'computer_lab'
            });
          }
        }
      }
    }

    // Sort by priority: longer duration first, then by section size
    return sessions.sort((a, b) => {
      const durationDiff = b.duration - a.duration;
      if (durationDiff !== 0) return durationDiff;
      
      const sectionA = this.sections.find(s => s.id === a.sectionId);
      const sectionB = this.sections.find(s => s.id === b.sectionId);
      
      return (sectionB?.student_count || 0) - (sectionA?.student_count || 0);
    });
  }

  private scheduleSession(session: ScheduleSession): boolean {
    // Try to schedule in all available slots
    for (const slot of this.slots) {
      const availability = this.isSlotAvailable(
        session.sectionId,
        session.teacherId,
        slot,
        session.duration,
        session.roomType
      );

      if (availability.available && availability.classroom) {
        // Schedule the session
        for (let i = 0; i < session.duration; i++) {
          const currentSlotIndex = slot.index + i;
          const currentSlot = this.slots.find(s => s.index === currentSlotIndex);
          
          if (currentSlot) {
            const teacher = this.teachers.find(t => t.id === session.teacherId);
            const course = this.courses.find(c => c.id === session.courseId);
            
            const entry: TimetableEntry = {
              section: session.isGroupClass ? 
                this.groups.find(g => g.id === session.sectionId)?.name || 'Unknown Group' :
                this.sections.find(s => s.id === session.sectionId)?.code || 'Unknown Section',
              teacher: teacher?.name || 'Unknown Teacher',
              course: course ? `${course.code} - ${course.name}` : 'Unknown Course',
              slot: currentSlot.time,
              room: availability.classroom.name,
              day: currentSlot.day,
              time: currentSlot.time
            };

            const key = this.getSlotKey(session.sectionId, currentSlot.day, currentSlot.time);
            this.schedule.set(key, entry);

            // If it's a group class, block the slot for all member sections
            if (session.isGroupClass && session.groupSections) {
              for (const memberSectionId of session.groupSections) {
                const memberKey = this.getSlotKey(memberSectionId, currentSlot.day, currentSlot.time);
                const memberEntry = { ...entry };
                memberEntry.section = this.sections.find(s => s.id === memberSectionId)?.code || 'Unknown Section';
                this.schedule.set(memberKey, memberEntry);
              }
            }
          }
        }
        return true;
      }
    }
    
    return false;
  }

  public async generateTimetable(): Promise<TimetableEntry[]> {
    console.log('Starting timetable generation...');
    
    this.schedule.clear();
    const sessions = this.generateSessions();
    
    console.log(`Generated ${sessions.length} sessions to schedule`);

    let scheduledCount = 0;
    for (const session of sessions) {
      if (this.scheduleSession(session)) {
        scheduledCount++;
      } else {
        console.warn(`Failed to schedule session for section ${session.sectionId}, course ${session.courseId}`);
      }
    }

    console.log(`Successfully scheduled ${scheduledCount}/${sessions.length} sessions`);

    return Array.from(this.schedule.values());
  }
}

export async function generateTimetable(
  sections: Section[],
  teachers: Teacher[],
  courses: Course[],
  groups: GroupClass[],
  assignments: Assignment[],
  rules: Rules,
  classrooms: Classroom[]
): Promise<TimetableEntry[]> {
  const scheduler = new TimetableScheduler(sections, teachers, courses, groups, assignments, rules, classrooms);
  return await scheduler.generateTimetable();
}
