import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Users, BookOpen, Clock, MapPin, Play } from 'lucide-react';
import { generateTimetable } from '@/utils/scheduler';
import { Section, Teacher, Course, GroupClass, Assignment, Rules, TimetableEntry, TIME_SLOTS, DAYS, Classroom } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Generate: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [stats, setStats] = useState({
    sections: 0,
    teachers: 0,
    courses: 0,
    assignments: 0,
    classrooms: 0
  });

  useEffect(() => {
    const savedProgram = localStorage.getItem('selectedProgram');
    if (savedProgram) {
      const program = JSON.parse(savedProgram);
      setCurrentProgram(program);
      loadStats(program.id);
    }
  }, []);

  const loadStats = async (programId: string) => {
    try {
      const [sectionsRes, teachersRes, coursesRes, groupsRes, assignmentsRes, rulesRes, classroomsRes] = await Promise.all([
        supabase.from('sections').select('*').eq('program_id', programId),
        supabase.from('teachers').select('*').eq('program_id', programId),
        supabase.from('courses').select('*').eq('program_id', programId),
        supabase.from('groups').select('*').eq('program_id', programId),
        supabase.from('assignments').select('*').eq('program_id', programId),
        supabase.from('rules').select('*').eq('program_id', programId),
        supabase.from('classrooms').select('*').eq('program_id', programId)
      ]);

      setStats({
        sections: sectionsRes.data?.length || 0,
        teachers: teachersRes.data?.length || 0,
        courses: coursesRes.data?.length || 0,
        assignments: assignmentsRes.data?.length || 0,
        classrooms: classroomsRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleGenerate = async () => {
    if (!currentProgram) return;

    setIsGenerating(true);
    try {
      // Load all data from database
      const [sectionsRes, teachersRes, coursesRes, groupsRes, assignmentsRes, rulesRes, classroomsRes] = await Promise.all([
        supabase.from('sections').select('*').eq('program_id', currentProgram.id),
        supabase.from('teachers').select('*').eq('program_id', currentProgram.id),
        supabase.from('courses').select('*').eq('program_id', currentProgram.id),
        supabase.from('groups').select('*').eq('program_id', currentProgram.id),
        supabase.from('assignments').select('*').eq('program_id', currentProgram.id),
        supabase.from('rules').select('*').eq('program_id', currentProgram.id),
        supabase.from('classrooms').select('*').eq('program_id', currentProgram.id)
      ]);

      const sections = sectionsRes.data || [];
      const teachers = teachersRes.data || [];
      const courses = coursesRes.data || [];
      const groups = groupsRes.data || [];
      const assignments = assignmentsRes.data || [];
      const classrooms = classroomsRes.data || [];
      const rulesData = rulesRes.data?.[0];

      if (!rulesData) {
        toast({
          title: "Error",
          description: "Please configure rules before generating timetable.",
          variant: "destructive"
        });
        return;
      }

      // Generate timetable
      const result = await generateTimetable(
        sections as Section[],
        teachers as Teacher[],
        courses as Course[],
        groups as GroupClass[],
        assignments as Assignment[],
        rulesData as Rules,
        classrooms as Classroom[]
      );

      setTimetable(result);

      // Save to database
      await supabase.from('timetable_entries').delete().eq('program_id', currentProgram.id);
      
      if (result.length > 0) {
        const entries = result.map(entry => ({
          ...entry,
          program_id: currentProgram.id
        }));
        await supabase.from('timetable_entries').insert(entries);
      }

      toast({
        title: "Success",
        description: `Generated timetable with ${result.length} scheduled sessions!`,
      });
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Error",
        description: "Failed to generate timetable.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
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
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Generate Timetable</h2>
        <p className="text-slate-600">Create an optimized schedule for {currentProgram.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.sections}</div>
            <p className="text-sm text-slate-600">Sections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.teachers}</div>
            <p className="text-sm text-slate-600">Teachers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-sm text-slate-600">Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.classrooms}</div>
            <p className="text-sm text-slate-600">Classrooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.assignments}</div>
            <p className="text-sm text-slate-600">Assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || stats.sections === 0 || stats.teachers === 0 || stats.courses === 0 || stats.classrooms === 0}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Generate Timetable
            </>
          )}
        </Button>
      </div>

      {/* Timetable Display */}
      {timetable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Generated Timetable ({timetable.length} sessions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-slate-100">Time</th>
                    {DAYS.slice(0, 5).map(day => (
                      <th key={day} className="border p-2 bg-slate-100">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(timeSlot => (
                    <tr key={timeSlot}>
                      <td className="border p-2 font-medium bg-slate-50">{timeSlot}</td>
                      {DAYS.slice(0, 5).map(day => {
                        const entry = timetable.find(t => t.day === day && t.time === timeSlot);
                        return (
                          <td key={`${day}-${timeSlot}`} className="border p-2">
                            {entry && (
                              <div className="text-xs space-y-1">
                                <div className="font-medium">{entry.course}</div>
                                <div className="text-slate-600">{entry.section}</div>
                                <div className="text-slate-600">{entry.teacher}</div>
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {entry.room}
                                </Badge>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Generate;
