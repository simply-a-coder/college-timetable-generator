
export interface Program {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Classroom {
  id: string;
  program_id?: string;
  name: string;
  type: string; // physics_lab, computer_lab, ubuntu_lab, lecture_hall, etc.
  capacity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Section {
  id: string;
  program_id?: string;
  code: string;
  student_count: number;
  lecture_timings?: string; // '8-1', '10-4', '1-4'
  created_at?: string;
  updated_at?: string;
}

export interface Teacher {
  id: string;
  program_id?: string;
  name: string;
  available_days: string[];
  available_slots: string[];
  days_off: string[];
  max_hours_per_day: number;
  max_hours_per_week: number;
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  program_id?: string;
  code: string;
  name: string;
  sessions_per_week: number;
  number_of_hours: number; // Changed from durationSlots
  room_type: string;
  no_back_to_back: string[];
  created_at?: string;
  updated_at?: string;
}

export interface GroupClass {
  id: string;
  program_id?: string;
  name: string;
  sections: string[];
  course_id?: string;
  sessions_override?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Assignment {
  id: string;
  program_id?: string;
  teacher_id?: string;
  course_id?: string;
  section_or_group_ids: string[];
  type: 'section' | 'group';
  created_at?: string;
  updated_at?: string;
}

export interface Rules {
  id: string;
  program_id?: string;
  lunch_start_slot: string;
  lunch_end_slot: string;
  travel_gap_minutes: number;
  max_lectures_per_day: number;
  max_labs_per_day: number;
  allowed_slots: string[];
  section_break_rules: { [sectionId: string]: { hasBreak: boolean; breakSlot?: string } };
  created_at?: string;
  updated_at?: string;
}

export interface TimetableEntry {
  id?: string;
  program_id?: string;
  section: string;
  teacher: string;
  course: string;
  slot: string;
  room: string;
  day: string;
  time: string;
  created_at?: string;
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

export const ROOM_TYPES = [
  'lecture_hall',
  'computer_lab',
  'physics_lab',
  'chemistry_lab',
  'biology_lab',
  'ubuntu_lab',
  'networking_lab',
  'electronics_lab',
  'mechanical_lab',
  'civil_lab'
];

export const LECTURE_TIMINGS = [
  { value: '8-1', label: '8:00 AM - 1:00 PM' },
  { value: '10-4', label: '10:00 AM - 4:00 PM' },
  { value: '1-4', label: '1:00 PM - 4:00 PM' }
];
