
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Building, Save } from 'lucide-react';
import { Classroom } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ClassroomCard from '@/components/classrooms/ClassroomCard';

const Classrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());

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
      setClassrooms([]);
      
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClassrooms(data || []);
      setUnsavedChanges(new Set());
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
      setUnsavedChanges(new Set());
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
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
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

  const updateClassroom = (id: string, field: keyof Classroom, value: any) => {
    setClassrooms(prev => prev.map(classroom => 
      classroom.id === id ? { ...classroom, [field]: value } : classroom
    ));
    setUnsavedChanges(prev => new Set(prev).add(id));
  };

  const saveClassroom = async (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    if (!classroom) return;

    try {
      const { error } = await supabase
        .from('classrooms')
        .update({
          name: classroom.name,
          type: classroom.type,
          capacity: classroom.capacity
        })
        .eq('id', classroomId);

      if (error) throw error;

      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(classroomId);
        return newSet;
      });

      toast({
        title: "Success",
        description: "Classroom saved successfully!",
      });
    } catch (error) {
      console.error('Error saving classroom:', error);
      toast({
        title: "Error",
        description: "Failed to save classroom.",
        variant: "destructive"
      });
    }
  };

  const saveAllClassrooms = async () => {
    const promises = Array.from(unsavedChanges).map(classroomId => saveClassroom(classroomId));
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
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Classroom Management</h2>
        <p className="text-slate-600">Define your classrooms, labs, and their capacities for {currentProgram.name}</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={addClassroom}
          size="lg"
          className="animate-pulse hover:animate-none bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Classroom
        </Button>
        {unsavedChanges.size > 0 && (
          <Button 
            onClick={saveAllClassrooms}
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
        {classrooms.map((classroom, index) => (
          <ClassroomCard
            key={classroom.id}
            classroom={classroom}
            index={index}
            isUnsaved={unsavedChanges.has(classroom.id)}
            onUpdate={updateClassroom}
            onSave={saveClassroom}
            onRemove={removeClassroom}
          />
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
