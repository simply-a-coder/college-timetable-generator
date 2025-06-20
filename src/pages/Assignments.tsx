
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, UserCheck } from 'lucide-react';
import { Assignment, Teacher, Course, Section, GroupClass } from '@/types';
import { toast } from '@/hooks/use-toast';
import AssignmentCard from '@/components/AssignmentCard';

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
    const savedAssignments = localStorage.getItem('assignments');
    
    if (savedTeachers) setTeachers(JSON.parse(savedTeachers));
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
  }, []);

  const addAssignment = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      teacherId: '',
      courseId: '',
      sectionOrGroupIds: [],
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
    const incomplete = assignments.filter(a => !a.teacherId || !a.courseId || !a.sectionOrGroupIds?.length);
    if (incomplete.length > 0) {
      toast({
        title: "Validation Error",
        description: "All assignments must have a teacher, course, and at least one section/group selected.",
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Teacher Assignments</h2>
        <p className="text-slate-600">Assign teachers to courses and multiple sections/groups efficiently</p>
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
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            index={index}
            teachers={teachers}
            courses={courses}
            sections={sections}
            groups={groups}
            onUpdate={updateAssignment}
            onRemove={removeAssignment}
          />
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
