import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, UserCheck, GripVertical } from 'lucide-react';
import { Assignment, Teacher, Course, Section, GroupClass } from '@/types';
import { toast } from '@/hooks/use-toast';

const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [groups, setGroups] = useState<GroupClass[]>([]);

  useEffect(() => {
    // Load all saved data
    const savedTeachers = localStorage.getItem('teachers');
    const savedCourses = localStorage.getItem('courses');
    const savedSections = localStorage.getItem('sections');
    const savedGroups = localStorage.getItem('groups');
    
    if (savedTeachers) setTeachers(JSON.parse(savedTeachers));
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
  }, []);

  const addAssignment = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      teacherId: '',
      courseId: '',
      sectionOrGroupId: '',
      type: 'section'
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const removeAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  const updateAssignment = (id: string, field: keyof Assignment, value: any) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === id ? { ...assignment, [field]: value } : assignment
    ));
  };

  const handleSave = () => {
    // Validate assignments
    const incomplete = assignments.filter(a => !a.teacherId || !a.courseId || !a.sectionOrGroupId);
    if (incomplete.length > 0) {
      toast({
        title: "Validation Error",
        description: "All assignments must have a teacher, course, and section/group selected.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate assignments
    const duplicates = assignments.filter((assignment, index) => {
      return assignments.findIndex(a => 
        a.teacherId === assignment.teacherId && 
        a.courseId === assignment.courseId && 
        a.sectionOrGroupId === assignment.sectionOrGroupId
      ) !== index;
    });

    if (duplicates.length > 0) {
      toast({
        title: "Validation Error",
        description: "Duplicate assignments found. Each teacher-course-section combination must be unique.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('assignments', JSON.stringify(assignments));
    toast({
      title: "Success",
      description: `${assignments.length} assignments saved successfully!`,
    });
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown Course';
  };

  const getSectionOrGroupName = (id: string, type: 'section' | 'group') => {
    if (type === 'section') {
      const section = sections.find(s => s.id === id);
      return section ? section.code : 'Unknown Section';
    } else {
      const group = groups.find(g => g.id === id);
      return group ? group.name : 'Unknown Group';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Teacher Assignments</h2>
        <p className="text-slate-600">Assign teachers to courses and sections/groups</p>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={addAssignment}
          size="lg"
          className="animate-pulse hover:animate-none bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Assignment
        </Button>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <Card 
            key={assignment.id} 
            className="animate-slide-in-right transition-all duration-200 hover:shadow-lg"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <GripVertical className="w-5 h-5" />
                  <span className="text-sm font-medium">#{index + 1}</span>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Select 
                      value={assignment.teacherId} 
                      onValueChange={(value) => updateAssignment(assignment.id, 'teacherId', value)}
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
                    <Select 
                      value={assignment.courseId} 
                      onValueChange={(value) => updateAssignment(assignment.id, 'courseId', value)}
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
                    <Select 
                      value={assignment.type} 
                      onValueChange={(value: 'section' | 'group') => updateAssignment(assignment.id, 'type', value)}
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

                  <div>
                    <Select 
                      value={assignment.sectionOrGroupId} 
                      onValueChange={(value) => updateAssignment(assignment.id, 'sectionOrGroupId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${assignment.type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {assignment.type === 'section' 
                          ? sections.map(section => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.code} ({section.studentCount} students)
                              </SelectItem>
                            ))
                          : groups.map(group => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeAssignment(assignment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Assignments Yet</h3>
            <p className="text-slate-500">Add your first teacher assignment to get started.</p>
          </CardContent>
        </Card>
      )}

      {assignments.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            Save All Assignments
          </Button>
        </div>
      )}
    </div>
  );
};

export default Assignments;
