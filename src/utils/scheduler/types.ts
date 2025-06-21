
import { Section, Teacher, Course, GroupClass, Assignment, Rules, TimetableEntry, Classroom } from '@/types';

export interface Slot {
  day: string;
  time: string;
  index: number;
}

export interface ScheduleSession {
  sectionId: string;
  teacherId: string;
  courseId: string;
  duration: number;
  roomType: 'lecture_hall' | 'computer_lab';
  isGroupClass?: boolean;
  groupSections?: string[];
}

export interface AvailabilityResult {
  available: boolean;
  classroom?: Classroom;
}

export interface SchedulerData {
  sections: Section[];
  teachers: Teacher[];
  courses: Course[];
  groups: GroupClass[];
  assignments: Assignment[];
  rules: Rules;
  classrooms: Classroom[];
}
