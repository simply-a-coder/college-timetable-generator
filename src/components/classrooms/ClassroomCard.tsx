
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building, Users, Save, Trash2 } from 'lucide-react';
import { Classroom, ROOM_TYPES } from '@/types';

interface ClassroomCardProps {
  classroom: Classroom;
  index: number;
  isUnsaved: boolean;
  onUpdate: (id: string, field: keyof Classroom, value: any) => void;
  onSave: (id: string) => void;
  onRemove: (id: string) => void;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
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
            <Building className="w-5 h-5 text-emerald-600" />
            Classroom {index + 1}
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
                onClick={() => onSave(classroom.id)}
                className="text-green-600 hover:text-green-700"
              >
                <Save className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRemove(classroom.id)}
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
            <Label htmlFor={`name-${classroom.id}`}>Room Name</Label>
            <Input
              id={`name-${classroom.id}`}
              value={classroom.name}
              onChange={(e) => onUpdate(classroom.id, 'name', e.target.value)}
              placeholder="e.g., Room 101, Physics Lab"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`capacity-${classroom.id}`}>Capacity</Label>
            <div className="relative">
              <Input
                id={`capacity-${classroom.id}`}
                type="number"
                min="1"
                value={classroom.capacity}
                onChange={(e) => onUpdate(classroom.id, 'capacity', parseInt(e.target.value) || 0)}
                className="mt-1 pr-10"
              />
              <Users className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 mt-0.5" />
            </div>
          </div>
        </div>

        <div>
          <Label>Room Type</Label>
          <Select 
            value={classroom.type} 
            onValueChange={(value) => onUpdate(classroom.id, 'type', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassroomCard;
