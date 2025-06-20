
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Building, Users } from 'lucide-react';
import { Classroom, ROOM_TYPES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Classrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [currentProgram, setCurrentProgram] = useState<any>(null);

  useEffect(() => {
    const savedProgram = localStorage.getItem('selectedProgram');
    if (savedProgram) {
      const program = JSON.parse(savedProgram);
      setCurrentProgram(program);
      loadClassrooms(program.id);
    }
  }, []);

  const loadClassrooms = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClassrooms(data || []);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      toast({
        title: "Error",
        description: "Failed to load classrooms.",
        variant: "destructive"
      });
    }
  };

  const addClassroom = async () => {
    if (!currentProgram) return;

    const newClassroom = {
      program_id: currentProgram.id,
      name: '',
      type: 'lecture_hall',
      capacity: 30
    };

    try {
      const { data, error } = await supabase
        .from('classrooms')
        .insert([newClassroom])
        .select()
        .single();

      if (error) throw error;
      setClassrooms(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding classroom:', error);
      toast({
        title: "Error",
        description: "Failed to add classroom.",
        variant: "destructive"
      });
    }
  };

  const removeClassroom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setClassrooms(prev => prev.filter(classroom => classroom.id !== id));
      
      toast({
        title: "Success",
        description: "Classroom removed successfully!",
      });
    } catch (error) {
      console.error('Error removing classroom:', error);
      toast({
        title: "Error",
        description: "Failed to remove classroom.",
        variant: "destructive"
      });
    }
  };

  const updateClassroom = async (id: string, field: keyof Classroom, value: any) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setClassrooms(prev => prev.map(classroom => 
        classroom.id === id ? { ...classroom, [field]: value } : classroom
      ));
    } catch (error) {
      console.error('Error updating classroom:', error);
      toast({
        title: "Error",
        description: "Failed to update classroom.",
        variant: "destructive"
      });
    }
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
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Classroom Management</h2>
        <p className="text-slate-600">Define your classrooms, labs, and their capacities for {currentProgram.name}</p>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={addClassroom}
          size="lg"
          className="animate-pulse hover:animate-none bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Classroom
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {classrooms.map((classroom, index) => (
          <Card 
            key={classroom.id} 
            className="animate-flip-in transition-all duration-200 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  Classroom {index + 1}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeClassroom(classroom.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${classroom.id}`}>Room Name</Label>
                  <Input
                    id={`name-${classroom.id}`}
                    value={classroom.name}
                    onChange={(e) => updateClassroom(classroom.id, 'name', e.target.value)}
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
                      onChange={(e) => updateClassroom(classroom.id, 'capacity', parseInt(e.target.value) || 0)}
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
                  onValueChange={(value) => updateClassroom(classroom.id, 'type', value)}
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
        ))}
      </div>

      {classrooms.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Classrooms Yet</h3>
            <p className="text-slate-500">Add your first classroom to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Classrooms;
