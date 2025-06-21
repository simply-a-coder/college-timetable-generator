
import { TIME_SLOTS, DAYS } from '@/types';
import { Slot } from './types';

export class SlotManager {
  private slots: Slot[] = [];

  constructor(allowedSlots: string[]) {
    this.initializeSlots(allowedSlots);
  }

  private initializeSlots(allowedSlots: string[]) {
    this.slots = [];
    DAYS.slice(0, 5).forEach((day, dayIndex) => {
      TIME_SLOTS.forEach((time, timeIndex) => {
        if (allowedSlots.includes(time)) {
          this.slots.push({
            day,
            time,
            index: dayIndex * TIME_SLOTS.length + timeIndex
          });
        }
      });
    });
  }

  getSlots(): Slot[] {
    return this.slots;
  }

  getSlotByIndex(index: number): Slot | undefined {
    return this.slots.find(s => s.index === index);
  }
}
