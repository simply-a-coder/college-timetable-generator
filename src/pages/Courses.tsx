
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, BookOpen, Monitor, Building, Save } from 'lucide-react';
import { Course, ROOM_TYPES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedProgram = localStorage.getItem('selectedProgram');
    if (savedProgram) {
      const program = JSON.parse(savedProgram);
      setCurrentProgram(program);
      loadCourses(program.id);
    }
  }, []);

  const loadCourses = async (programId: string) => {
    try {
      // Clear any existing data first
      setCourses([]);
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
      setUnsavedChanges(new Set());
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses.",
        variant: "destructive"
      });
    }
  };

  const addCourse = async () => {
    if (!currentProgram) return;

    const newCourse = {
      program_id: currentProgram.id,
      code: '',
      name: '',
      sessions_per_week: 3,
      number_of_hours: 1,
      room_type: 'lecture_hall',
      no_back_to_back: []
    };

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([newCourse])
        .select()
        .single();

      if (error) throw error;
      setCourses(prev => [data, ...prev]);
      setUnsavedChanges(new Set());
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: "Error",
        description: "Failed to add course.",
        variant: "destructive"
      });
    }
  };

  const removeCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCourses(prev => prev.filter(course => course.id !== id));
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      toast({
        title: "Success",
        description: "Course removed successfully!",
      });
    } catch (error) {
      console.error('Error removing course:', error);
      toast({
        title: "Error",
        description: "Failed to remove course.",
        variant: "destructive"
      });
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
    setUnsavedChanges(prev => new Set(prev).add(id));
  };

  const saveCourse = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          code: course.code,
          name: course.name,
          sessions_per_week: course.sessions_per_week,
          number_of_hours: course.number_of_hours,
          room_type: course.room_type,
          no_back_to_back: course.no_back_to_back
        })
        .eq('id', courseId);

      if (error) throw error;

      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });

      toast({
        title: "Success",
        description: "Course saved successfully!",
      });
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive"
      });
    }
  };

  const saveAllCourses = async () => {
    const promises = Array.from(unsavedChanges).map(courseId => saveCourse(courseId));
    await Promise.all(promises);
  };

  if (!currentProgram) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Please select a program first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Course & Lab Management</h2>
        <p className="text-slate-600">Define your courses, sessions, and room requirements for {currentProgram.name}</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={addCourse}
          size="lg"
          className="animate-pulse hover:animate-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Course
        </Button>
        {unsavedChanges.size > 0 && (
          <Button 
            onClick={saveAllCourses}
            size="lg"
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Save className="w-5 h-5 mr-2" />
            Save All Changes ({unsavedChanges.size})
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {courses.map((course, index) => (
          <Card 
            key={course.id} 
            className={`animate-flip-in transition-all duration-200 hover:shadow-lg ${
              unsavedChanges.has(course.id) ? 'ring-2 ring-orange-300' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Course {index + 1}
                  {unsavedChanges.has(course.id) && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      Unsaved
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  {unsavedChanges.has(course.id) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => saveCourse(course.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeCourse(course.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`code-${course.id}`}>Course Code</Label>
                  <Input
                    id={`code-${course.id}`}
                    value={course.code}
                    onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                    placeholder="e.g., CS101"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`name-${course.id}`}>Course Name</Label>
                  <Input
                    id={`name-${course.id}`}
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    placeholder="e.g., Computer Science"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Sessions/Week</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={course.sessions_per_week}
                    onChange={(e) => updateCourse(course.id, 'sessions_per_week', parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Number of Hours</Label>
                  <Select 
                    value={course.number_of_hours.toString()} 
                    onValueChange={(value) => updateCourse(course.id, 'number_of_hours', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="2">2 Hours</SelectItem>
                      <SelectItem value="3">3 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Select 
                    value={course.room_type} 
                    onValueChange={(value) => updateCourse(course.id, 'room_type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {type.includes('lab') ? (
                              <Monitor className="w-4 h-4" />
                            ) : (
                              <Building className="w-4 h-4" />
                            )}
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Courses Yet</h3>
            <p className="text-slate-500">Add your first course to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Courses;
