
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, User, Clock, Calendar } from 'lucide-react';
import { Teacher, TIME_SLOTS, DAYS } from '@/types';
import { toast } from '@/hooks/use-toast';

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const addTeacher = () => {
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: '',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableSlots: [],
      daysOff: [],
      maxHoursPerDay: 6,
      maxHoursPerWeek: 30
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const removeTeacher = (id: string) => {
    setTeachers(prev => prev.filter(teacher => teacher.id !== id));
  };

  const updateTeacher = (id: string, field: keyof Teacher, value: any) => {
    setTeachers(prev => prev.map(teacher => 
      teacher.id === id ? { ...teacher, [field]: value } : teacher
    ));
  };

  const handleDayToggle = (teacherId: string, day: string, checked: boolean) => {
    setTeachers(prev => prev.map(teacher => {
      if (teacher.id === teacherId) {
        const availableDays = checked 
          ? [...teacher.availableDays, day]
          : teacher.availableDays.filter(d => d !== day);
        return { ...teacher, availableDays };
      }
      return teacher;
    }));
  };

  const handleSlotToggle = (teacherId: string, slot: string, checked: boolean) => {
    setTeachers(prev => prev.map(teacher => {
      if (teacher.id === teacherId) {
        const availableSlots = checked 
          ? [...teacher.availableSlots, slot]
          : teacher.availableSlots.filter(s => s !== slot);
        return { ...teacher, availableSlots };
      }
      return teacher;
    }));
  };

  const handleSave = () => {
    if (teachers.some(t => !t.name.trim())) {
      toast({
        title: "Validation Error",
        description: "All teachers must have a name.",
        variant: "destructive"
      });
      return;
    }

    if (teachers.some(t => t.availableDays.length === 0)) {
      toast({
        title: "Validation Error",
        description: "All teachers must have at least one working day.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('teachers', JSON.stringify(teachers));
    toast({
      title: "Success",
      description: `${teachers.length} teachers saved successfully!`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Teacher Management</h2>
        <p className="text-slate-600">Configure teacher availability and constraints</p>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={addTeacher}
          size="lg"
          className="animate-pulse hover:animate-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Teacher
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {teachers.map((teacher, index) => (
          <Card 
            key={teacher.id} 
            className="animate-slide-in-left transition-all duration-200 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Teacher {index + 1}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeTeacher(teacher.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor={`name-${teacher.id}`}>Teacher Name</Label>
                <Input
                  id={`name-${teacher.id}`}
                  value={teacher.name}
                  onChange={(e) => updateTeacher(teacher.id, 'name', e.target.value)}
                  placeholder="Enter teacher name"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Hours/Day</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={teacher.maxHoursPerDay}
                    onChange={(e) => updateTeacher(teacher.id, 'maxHoursPerDay', parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Hours/Week</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={teacher.maxHoursPerWeek}
                    onChange={(e) => updateTeacher(teacher.id, 'maxHoursPerWeek', parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" />
                  Available Days
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${teacher.id}-${day}`}
                        checked={teacher.availableDays.includes(day)}
                        onCheckedChange={(checked) => handleDayToggle(teacher.id, day, checked as boolean)}
                      />
                      <label htmlFor={`${teacher.id}-${day}`} className="text-sm font-medium">
                        {day.slice(0, 3)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" />
                  Available Time Slots
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {TIME_SLOTS.map(slot => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${teacher.id}-${slot}`}
                        checked={teacher.availableSlots.includes(slot)}
                        onCheckedChange={(checked) => handleSlotToggle(teacher.id, slot, checked as boolean)}
                      />
                      <label htmlFor={`${teacher.id}-${slot}`} className="text-xs font-medium">
                        {slot}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teachers.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            Save All Teachers
          </Button>
        </div>
      )}
    </div>
  );
};

export default Teachers;
