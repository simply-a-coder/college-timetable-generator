
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BookOpen, MapPin, Play, Download, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateTimetable } from '@/utils/scheduler';
import StatsCards from '@/components/generate/StatsCards';
import ConstraintInfo from '@/components/generate/ConstraintInfo';
import TimetableDisplay from '@/components/generate/TimetableDisplay';
import type { TimetableEntry } from '@/types';

const Generate: React.FC = () => {
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [stats, setStats] = useState({
    sections: 0,
    teachers: 0,
    courses: 0,
    assignments: 0,
    classrooms: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [generationInfo, setGenerationInfo] = useState<string>('');

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
      console.log('Loading stats for program:', programId);
      
      // Load all data with proper error handling
      const [sectionsRes, teachersRes, coursesRes, classroomsRes, assignmentsRes] = await Promise.all([
        supabase.from('sections').select('*').eq('program_id', programId),
        supabase.from('teachers').select('*').eq('program_id', programId),
        supabase.from('courses').select('*').eq('program_id', programId),
        supabase.from('classrooms').select('*').eq('program_id', programId),
        supabase.from('assignments').select('*').eq('program_id', programId)
      ]);

      // Check for errors
      if (sectionsRes.error) throw sectionsRes.error;
      if (teachersRes.error) throw teachersRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (classroomsRes.error) throw classroomsRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      const newStats = {
        sections: sectionsRes.data?.length || 0,
        teachers: teachersRes.data?.length || 0,
        courses: coursesRes.data?.length || 0,
        classrooms: classroomsRes.data?.length || 0,
        assignments: assignmentsRes.data?.length || 0
      };

      console.log('Loaded stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load program statistics.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateTimetable = async () => {
    if (!currentProgram) {
      toast({
        title: "Error",
        description: "Please select a program first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationInfo('Starting timetable generation...');

    try {
      const result = await generateTimetable(currentProgram.id);
      
      if (result.success) {
        setTimetable(result.timetable || []);
        setGenerationInfo(result.info || 'Timetable generated successfully!');
        toast({
          title: "Success",
          description: "Timetable generated successfully!",
        });
      } else {
        setGenerationInfo(result.info || 'Failed to generate timetable');
        toast({
          title: "Generation Failed",
          description: result.info || "Failed to generate timetable. Please check your constraints and data.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      setGenerationInfo('Error during generation: ' + (error as Error).message);
      toast({
        title: "Error",
        description: "An error occurred during timetable generation.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTimetable = () => {
    if (timetable.length === 0) {
      toast({
        title: "No Data",
        description: "No timetable data to download.",
        variant: "destructive"
      });
      return;
    }

    const csv = [
      ['Day', 'Time', 'Section', 'Course', 'Teacher', 'Room'].join(','),
      ...timetable.map(entry => [
        entry.day,
        entry.time,
        entry.section,
        entry.course,
        entry.teacher,
        entry.room
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${currentProgram?.name || 'program'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!currentProgram) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Please select a program first.</p>
      </div>
    );
  }

  const canGenerate = stats.sections > 0 && stats.teachers > 0 && stats.courses > 0 && stats.classrooms > 0 && stats.assignments > 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Generate Timetable</h2>
        <p className="text-slate-600">AI-powered timetable generation for {currentProgram.name}</p>
      </div>

      <StatsCards stats={stats} />

      <ConstraintInfo />

      {!canGenerate && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Setup Required</p>
                <p className="text-sm text-orange-700">
                  Please ensure you have added at least one entry in each category: sections, teachers, courses, classrooms, and assignments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleGenerateTimetable}
          disabled={isGenerating || !canGenerate}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Generate Timetable
            </>
          )}
        </Button>
        
        {timetable.length > 0 && (
          <Button 
            onClick={downloadTimetable}
            variant="outline"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download CSV
          </Button>
        )}
      </div>

      {generationInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{generationInfo}</p>
          </CardContent>
        </Card>
      )}

      {timetable.length > 0 && (
        <TimetableDisplay timetable={timetable} />
      )}
    </div>
  );
};

export default Generate;
