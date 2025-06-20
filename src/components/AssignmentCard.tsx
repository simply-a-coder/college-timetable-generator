
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, X } from 'lucide-react';
import { Assignment, Teacher, Course, Section, GroupClass } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  index: number;
  teachers: Teacher[];
  courses: Course[];
  sections: Section[];
  groups: GroupClass[];
  onUpdate: (id: string, field: keyof Assignment, value: any) => void;
  onRemove: (id: string) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  index,
  teachers,
  courses,
  sections,
  groups,
  onUpdate,
  onRemove
}) => {
  const handleSectionToggle = (id: string, checked: boolean) => {
    const currentIds = assignment.section_or_group_ids || [];
    const newIds = checked 
      ? [...currentIds, id]
      : currentIds.filter(sid => sid !== id);
    onUpdate(assignment.id, 'section_or_group_ids', newIds);
  };

  const removeSectionOrGroup = (id: string) => {
    const newIds = (assignment.section_or_group_ids || []).filter(sid => sid !== id);
    onUpdate(assignment.id, 'section_or_group_ids', newIds);
  };

  const getEntityName = (id: string) => {
    if (assignment.type === 'section') {
      const section = sections.find(s => s.id === id);
      return section ? section.code : 'Unknown';
    } else {
      const group = groups.find(g => g.id === id);
      return group ? group.name : 'Unknown';
    }
  };

  return (
    <Card className="animate-slide-in-right transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <GripVertical className="w-5 h-5" />
            <span className="text-sm font-medium">#{index + 1}</span>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Teacher</label>
                <Select 
                  value={assignment.teacher_id} 
                  onValueChange={(value) => onUpdate(assignment.id, 'teacher_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Course</label>
                <Select 
                  value={assignment.course_id} 
                  onValueChange={(value) => onUpdate(assignment.id, 'course_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
                <Select 
                  value={assignment.type} 
                  onValueChange={(value: 'section' | 'group') => onUpdate(assignment.id, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">Section</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Selected {assignment.type === 'section' ? 'Sections' : 'Groups'}
              </label>
              
              {/* Selected items display */}
              {assignment.section_or_group_ids && assignment.section_or_group_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {assignment.section_or_group_ids.map(id => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {getEntityName(id)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => removeSectionOrGroup(id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Selection checkboxes */}
              <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {assignment.type === 'section' 
                    ? sections.map(section => (
                        <div key={section.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`section-${section.id}`}
                            checked={assignment.section_or_group_ids?.includes(section.id) || false}
                            onCheckedChange={(checked) => handleSectionToggle(section.id, checked as boolean)}
                          />
                          <label htmlFor={`section-${section.id}`} className="text-sm cursor-pointer">
                            {section.code}
                          </label>
                        </div>
                      ))
                    : groups.map(group => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={assignment.section_or_group_ids?.includes(group.id) || false}
                            onCheckedChange={(checked) => handleSectionToggle(group.id, checked as boolean)}
                          />
                          <label htmlFor={`group-${group.id}`} className="text-sm cursor-pointer">
                            {group.name}
                          </label>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRemove(assignment.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
