
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, BookOpen, Monitor, Building } from 'lucide-react';
import { Course } from '@/types';
import { toast } from '@/hooks/use-toast';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      code: '',
      name: '',
      sessionsPerWeek: 3,
      durationSlots: 1,
      roomType: 'lecture_hall',
      noBackToBack: []
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const handleSave = () => {
    if (courses.some(c => !c.code.trim() || !c.name.trim())) {
      toast({
        title: "Validation Error",
        description: "All courses must have a code and name.",
        variant: "destructive"
      });
      return;
    }

    const codes = courses.map(c => c.code.trim().toLowerCase());
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
    
    if (duplicates.length > 0) {
      toast({
        title: "Validation Error",
        description: "Duplicate course codes found.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('courses', JSON.stringify(courses));
    toast({
      title: "Success",
      description: `${courses.length} courses saved successfully!`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Course & Lab Management</h2>
        <p className="text-slate-600">Define your courses, sessions, and room requirements</p>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={addCourse}
          size="lg"
          className="animate-pulse hover:animate-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {courses.map((course, index) => (
          <Card 
            key={course.id} 
            className="animate-flip-in transition-all duration-200 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Course {index + 1}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeCourse(course.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
                    value={course.sessionsPerWeek}
                    onChange={(e) => updateCourse(course.id, 'sessionsPerWeek', parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Duration (Slots)</Label>
                  <Select 
                    value={course.durationSlots.toString()} 
                    onValueChange={(value) => updateCourse(course.id, 'durationSlots', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Slot</SelectItem>
                      <SelectItem value="2">2 Slots</SelectItem>
                      <SelectItem value="3">3 Slots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Select 
                    value={course.roomType} 
                    onValueChange={(value: 'lecture_hall' | 'computer_lab') => updateCourse(course.id, 'roomType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture_hall">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Lecture Hall
                        </div>
                      </SelectItem>
                      <SelectItem value="computer_lab">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Computer Lab
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Save All Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default Courses;
