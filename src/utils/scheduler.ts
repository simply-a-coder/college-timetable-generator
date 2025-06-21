
import { Section, Teacher, Course, GroupClass, Assignment, Rules, TimetableEntry, Classroom } from '@/types';
import { TimetableScheduler } from './scheduler/timetableScheduler';
import { SchedulerData } from './scheduler/types';

export async function generateTimetable(
  sections: Section[],
  teachers: Teacher[],
  courses: Course[],
  groups: GroupClass[],
  assignments: Assignment[],
  rules: Rules,
  classrooms: Classroom[]
): Promise<TimetableEntry[]> {
  const data: SchedulerData = {
    sections,
    teachers,
    courses,
    groups,
    assignments,
    rules,
    classrooms
  };

  const scheduler = new TimetableScheduler(data);
  return await scheduler.generateTimetable();
}
