
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BookOpen, Monitor, Building, Save, Trash2 } from 'lucide-react';
import { Course, ROOM_TYPES } from '@/types';

interface CourseCardProps {
  course: Course;
  index: number;
  isUnsaved: boolean;
  onUpdate: (id: string, field: keyof Course, value: any) => void;
  onSave: (id: string) => void;
  onRemove: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  index,
  isUnsaved,
  onUpdate,
  onSave,
  onRemove
}) => {
  return (
    <Card 
      className={`animate-flip-in transition-all duration-200 hover:shadow-lg ${
        isUnsaved ? 'ring-2 ring-orange-300' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Course {index + 1}
            {isUnsaved && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                Unsaved
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {isUnsaved && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSave(course.id)}
                className="text-green-600 hover:text-green-700"
              >
                <Save className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRemove(course.id)}
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
              onChange={(e) => onUpdate(course.id, 'code', e.target.value)}
              placeholder="e.g., CS101"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`name-${course.id}`}>Course Name</Label>
            <Input
              id={`name-${course.id}`}
              value={course.name}
              onChange={(e) => onUpdate(course.id, 'name', e.target.value)}
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
              onChange={(e) => onUpdate(course.id, 'sessions_per_week', parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Number of Hours</Label>
            <Select 
              value={course.number_of_hours.toString()} 
              onValueChange={(value) => onUpdate(course.id, 'number_of_hours', parseInt(value))}
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
              onValueChange={(value) => onUpdate(course.id, 'room_type', value)}
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
  );
};

export default CourseCard;
