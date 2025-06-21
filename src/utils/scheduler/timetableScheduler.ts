
import { TimetableEntry } from '@/types';
import { SchedulerData, ScheduleSession } from './types';
import { SlotManager } from './slotManager';
import { SessionGenerator } from './sessionGenerator';
import { AvailabilityChecker } from './availabilityChecker';
import { ConstraintValidator } from './constraintValidator';

export class TimetableScheduler {
  private data: SchedulerData;
  private slotManager: SlotManager;
  private sessionGenerator: SessionGenerator;
  private availabilityChecker: AvailabilityChecker;
  private constraintValidator: ConstraintValidator;
  private schedule: Map<string, TimetableEntry[]>;

  constructor(data: SchedulerData) {
    this.data = data;
    this.slotManager = new SlotManager(data.rules.allowed_slots);
    this.sessionGenerator = new SessionGenerator(data);
    this.availabilityChecker = new AvailabilityChecker(data);
    this.constraintValidator = new ConstraintValidator(data);
    this.schedule = new Map();
  }

  async generateTimetable(): Promise<TimetableEntry[]> {
    console.log('Starting timetable generation with enhanced CSP solver...');
    
    const sessions = this.sessionGenerator.generateSessions();
    console.log(`Generated ${sessions.length} sessions to schedule`);

    const slots = this.slotManager.getSlots();
    console.log(`Available slots: ${slots.length}`);

    this.schedule.clear();
    this.constraintValidator.setSchedule(this.schedule);
    
    const result = await this.backtrackSchedule(sessions, 0);
    
    if (result) {
      console.log('Timetable generation successful!');
      return this.convertScheduleToEntries();
    } else {
      console.log('Failed to generate complete timetable');
      return this.convertScheduleToEntries(); // Return partial solution
    }
  }

  private async backtrackSchedule(sessions: ScheduleSession[], sessionIndex: number): Promise<boolean> {
    if (sessionIndex >= sessions.length) {
      return true; // All sessions scheduled
    }

    const session = sessions[sessionIndex];
    const slots = this.slotManager.getSlots();

    // Try each slot for this session
    for (const slot of slots) {
      const { available, classroom } = this.availabilityChecker.checkAvailability(
        session, 
        slot, 
        this.schedule
      );

      if (available && classroom && this.constraintValidator.canSchedule(session, slot, classroom)) {
        // Schedule this session
        this.addToSchedule(session, slot, classroom);
        
        // Recursively try to schedule remaining sessions
        if (await this.backtrackSchedule(sessions, sessionIndex + 1)) {
          return true;
        }
        
        // Backtrack - remove this session from schedule
        this.removeFromSchedule(session, slot);
      }
    }

    return false; // Could not schedule this session
  }

  private addToSchedule(session: ScheduleSession, slot: any, classroom: any) {
    const teacher = this.data.teachers.find(t => t.id === session.teacherId);
    const course = this.data.courses.find(c => c.id === session.courseId);
    
    if (!teacher || !course) return;

    const entry: TimetableEntry = {
      section: session.isGroupClass ? `Group-${session.sectionId}` : this.getSectionCode(session.sectionId),
      teacher: teacher.name,
      course: course.code,
      slot: slot.time,
      room: classroom.name,
      day: slot.day,
      time: slot.time
    };

    // Add to teacher schedule
    const teacherKey = `teacher-${session.teacherId}`;
    if (!this.schedule.has(teacherKey)) {
      this.schedule.set(teacherKey, []);
    }
    this.schedule.get(teacherKey)!.push(entry);

    // Add to section/group schedule
    if (session.isGroupClass && session.groupSections) {
      for (const sectionId of session.groupSections) {
        const sectionKey = `section-${sectionId}`;
        if (!this.schedule.has(sectionKey)) {
          this.schedule.set(sectionKey, []);
        }
        this.schedule.get(sectionKey)!.push(entry);
      }
    } else {
      const sectionKey = `section-${session.sectionId}`;
      if (!this.schedule.has(sectionKey)) {
        this.schedule.set(sectionKey, []);
      }
      this.schedule.get(sectionKey)!.push(entry);
    }

    // Add to classroom schedule
    const roomKey = `room-${classroom.id}`;
    if (!this.schedule.has(roomKey)) {
      this.schedule.set(roomKey, []);
    }
    this.schedule.get(roomKey)!.push(entry);
  }

  private removeFromSchedule(session: ScheduleSession, slot: any) {
    const teacher = this.data.teachers.find(t => t.id === session.teacherId);
    const course = this.data.courses.find(c => c.id === session.courseId);
    
    if (!teacher || !course) return;

    // Remove from all relevant schedules
    const teacherKey = `teacher-${session.teacherId}`;
    this.removeEntryFromScheduleKey(teacherKey, slot, course.code);

    if (session.isGroupClass && session.groupSections) {
      for (const sectionId of session.groupSections) {
        const sectionKey = `section-${sectionId}`;
        this.removeEntryFromScheduleKey(sectionKey, slot, course.code);
      }
    } else {
      const sectionKey = `section-${session.sectionId}`;
      this.removeEntryFromScheduleKey(sectionKey, slot, course.code);
    }
  }

  private removeEntryFromScheduleKey(key: string, slot: any, courseCode: string) {
    const entries = this.schedule.get(key) || [];
    const filtered = entries.filter(entry => 
      !(entry.day === slot.day && entry.time === slot.time && entry.course === courseCode)
    );
    this.schedule.set(key, filtered);
  }

  private getSectionCode(sectionId: string): string {
    const section = this.data.sections.find(s => s.id === sectionId);
    return section ? section.code : sectionId;
  }

  private convertScheduleToEntries(): TimetableEntry[] {
    const allEntries: TimetableEntry[] = [];
    
    for (const [key, entries] of this.schedule.entries()) {
      if (key.startsWith('section-')) {
        allEntries.push(...entries);
      }
    }

    // Remove duplicates (since group classes appear in multiple section schedules)
    const uniqueEntries = allEntries.filter((entry, index, self) => 
      index === self.findIndex(e => 
        e.day === entry.day && 
        e.time === entry.time && 
        e.teacher === entry.teacher && 
        e.course === entry.course
      )
    );

    return uniqueEntries;
  }
}
