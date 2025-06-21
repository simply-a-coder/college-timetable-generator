
import { TimetableEntry } from '@/types';
import { ScheduleSession, SchedulerData, Slot } from './types';
import { SlotManager } from './slotManager';
import { AvailabilityChecker } from './availabilityChecker';
import { SessionGenerator } from './sessionGenerator';

export class TimetableScheduler {
  private data: SchedulerData;
  private slotManager: SlotManager;
  private availabilityChecker: AvailabilityChecker;
  private sessionGenerator: SessionGenerator;
  private schedule: Map<string, TimetableEntry> = new Map();

  constructor(data: SchedulerData) {
    this.data = data;
    this.slotManager = new SlotManager(data.rules.allowed_slots);
    this.availabilityChecker = new AvailabilityChecker(data, this.schedule, this.slotManager.getSlots());
    this.sessionGenerator = new SessionGenerator(data);
  }

  private getSlotKey(sectionId: string, day: string, time: string): string {
    return `${sectionId}-${day}-${time}`;
  }

  private scheduleSession(session: ScheduleSession): boolean {
    // Try to schedule in all available slots
    for (const slot of this.slotManager.getSlots()) {
      const availability = this.availabilityChecker.checkSlotAvailability(
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
          const currentSlot = this.slotManager.getSlotByIndex(currentSlotIndex);
          
          if (currentSlot) {
            const teacher = this.data.teachers.find(t => t.id === session.teacherId);
            const course = this.data.courses.find(c => c.id === session.courseId);
            
            const entry: TimetableEntry = {
              section: session.isGroupClass ? 
                this.data.groups.find(g => g.id === session.sectionId)?.name || 'Unknown Group' :
                this.data.sections.find(s => s.id === session.sectionId)?.code || 'Unknown Section',
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
                memberEntry.section = this.data.sections.find(s => s.id === memberSectionId)?.code || 'Unknown Section';
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
    const sessions = this.sessionGenerator.generateSessions();
    
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
