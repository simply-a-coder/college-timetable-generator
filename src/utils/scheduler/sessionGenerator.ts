
import { ScheduleSession, SchedulerData } from './types';

export class SessionGenerator {
  private data: SchedulerData;

  constructor(data: SchedulerData) {
    this.data = data;
  }

  generateSessions(): ScheduleSession[] {
    const sessions: ScheduleSession[] = [];

    for (const assignment of this.data.assignments) {
      const course = this.data.courses.find(c => c.id === assignment.course_id);
      const teacher = this.data.teachers.find(t => t.id === assignment.teacher_id);
      
      if (!course || !teacher || !assignment.section_or_group_ids?.length) continue;

      for (const sectionOrGroupId of assignment.section_or_group_ids) {
        if (assignment.type === 'group') {
          const group = this.data.groups.find(g => g.id === sectionOrGroupId);
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
      
      const sectionA = this.data.sections.find(s => s.id === a.sectionId);
      const sectionB = this.data.sections.find(s => s.id === b.sectionId);
      
      return (sectionB?.student_count || 0) - (sectionA?.student_count || 0);
    });
  }
}
