import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen, Users, Calendar, Settings, Sparkles, GraduationCap } from 'lucide-react';
import { Program } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
      toast({
        title: "Error",
        description: "Failed to load programs.",
        variant: "destructive"
      });
    }
  };

  const createProgram = async () => {
    if (!newProgram.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Program name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('programs')
        .insert([newProgram])
        .select()
        .single();

      if (error) throw error;

      setPrograms(prev => [data, ...prev]);
      setNewProgram({ name: '', description: '' });
      setShowCreateForm(false);
      
      // Store selected program and navigate
      localStorage.setItem('selectedProgram', JSON.stringify(data));
      navigate('/sections');

      toast({
        title: "Success",
        description: "Program created successfully!",
      });
    } catch (error) {
      console.error('Error creating program:', error);
      toast({
        title: "Error",
        description: "Failed to create program.",
        variant: "destructive"
      });
    }
  };

  const selectProgram = (program: Program) => {
    localStorage.setItem('selectedProgram', JSON.stringify(program));
    navigate('/sections');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Smart Timetable Generator
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Create optimized academic schedules with advanced constraint satisfaction algorithms. 
            Manage courses, teachers, sections, and generate conflict-free timetables effortlessly.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">Section Management</h3>
                <p className="text-sm text-slate-600">Configure student sections with capacity and timing preferences</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardContent className="pt-6 text-center">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">Course Planning</h3>
                <p className="text-sm text-slate-600">Define courses with room requirements and session frequencies</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <CardContent className="pt-6 text-center">
                <Settings className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">Smart Constraints</h3>
                <p className="text-sm text-slate-600">Set rules for breaks, gaps, and teacher availability</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <CardContent className="pt-6 text-center">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">AI Generation</h3>
                <p className="text-sm text-slate-600">Generate optimized timetables with backtracking algorithms</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Program Selection */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose Your Program</h2>
            <p className="text-slate-600">Select an existing program or create a new one to get started</p>
          </div>

          {/* Create New Program Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowCreateForm(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Program
            </Button>
          </div>

          {/* Create Program Form */}
          {showCreateForm && (
            <Card className="mb-8 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                  Create New Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="program-name">Program Name</Label>
                  <Input
                    id="program-name"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., B.Tech Computer Science, BCA, Nursing"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="program-description">Description (Optional)</Label>
                  <Textarea
                    id="program-description"
                    value={newProgram.description}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the program"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={createProgram} className="flex-1">
                    Create & Start Setup
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Programs */}
          {programs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800 text-center">Existing Programs</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((program, index) => (
                  <Card 
                    key={program.id}
                    className="animate-slide-in-up cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => selectProgram(program)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        {program.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {program.description && (
                        <p className="text-slate-600 text-sm mb-3">{program.description}</p>
                      )}
                      <Button variant="outline" className="w-full">
                        Continue Setup
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {programs.length === 0 && !showCreateForm && (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No Programs Yet</h3>
                <p className="text-slate-500 mb-6">Create your first program to start building timetables</p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
