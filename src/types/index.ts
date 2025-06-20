
export interface Section {
  id: string;
  code: string;
  studentCount: number;
}

export interface Teacher {
  id: string;
  name: string;
  availableDays: string[];
  availableSlots: string[];
  daysOff: string[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  sessionsPerWeek: number;
  durationSlots: number;
  roomType: 'lecture_hall' | 'computer_lab';
  noBackToBack: string[];
}

export interface GroupClass {
  id: string;
  name: string;
  sections: string[];
  courseId: string;
  sessionsOverride?: number;
}

export interface Assignment {
  id: string;
  teacherId: string;
  courseId: string;
  sectionOrGroupId: string;
  type: 'section' | 'group';
}

export interface Rules {
  id: string;
  lunchStartSlot: string;
  lunchEndSlot: string;
  travelGapMinutes: number;
  maxLecturesPerDay: number;
  maxLabsPerDay: number;
  allowedSlots: string[];
}

export interface TimetableEntry {
  section: string;
  teacher: string;
  course: string;
  slot: string;
  room: string;
  day: string;
  time: string;
}

export const TIME_SLOTS = [
  '8:00-8:55',
  '9:05-9:55',
  '10:05-10:55',
  '11:05-11:55',
  '12:05-12:55',
  '13:05-13:55',
  '14:05-14:55',
  '15:05-15:55',
  '16:05-16:55',
  '17:05-17:55'
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
