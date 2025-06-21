
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, RefreshCw } from 'lucide-react';
import { generateTimetable } from '@/utils/scheduler';
import { Section, Teacher, Course, GroupClass, Assignment, Rules, TimetableEntry, Classroom } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StatsCards from '@/components/generate/StatsCards';
import ConstraintInfo from '@/components/generate/ConstraintInfo';
import TimetableDisplay from '@/components/generate/TimetableDisplay';

const Generate: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
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
      loadExistingTimetable(program.id);
    }
  }, []);

  const loadStats = async (programId: string) => {
    setIsLoadingStats(true);
    try {
      console.log('Loading fresh stats for program:', programId);
      
      const [sectionsRes, teachersRes, coursesRes, groupsRes, assignmentsRes, rulesRes, classroomsRes] = await Promise.all([
        supabase.from('sections').select('*').eq('program_id', programId),
        supabase.from('teachers').select('*').eq('program_id', programId),
        supabase.from('courses').select('*').eq('program_id', programId),
        supabase.from('groups').select('*').eq('program_id', programId),
        supabase.from('assignments').select('*').eq('program_id', programId),
        supabase.from('rules').select('*').eq('program_id', programId),
        supabase.from('classrooms').select('*').eq('program_id', programId)
      ]);

      const newStats = {
        sections: sectionsRes.data?.length || 0,
        teachers: teachersRes.data?.length || 0,
        courses: coursesRes.data?.length || 0,
        assignments: assignmentsRes.data?.length || 0,
        classrooms: classroomsRes.data?.length || 0
      };

      console.log('Updated stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load statistics.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadExistingTimetable = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('program_id', programId);

      if (error) throw error;
      setTimetable(data || []);
    } catch (error) {
      console.error('Error loading existing timetable:', error);
    }
  };

  const refreshStats = () => {
    if (currentProgram) {
      loadStats(currentProgram.id);
    }
  };

  const handleGenerate = async () => {
    if (!currentProgram) return;

    setIsGenerating(true);
    try {
      console.log('Starting timetable generation...');
      
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

      console.log('Loaded data:', {
        sections: sections.length,
        teachers: teachers.length,
        courses: courses.length,
        assignments: assignments.length,
        classrooms: classrooms.length,
        rules: !!rulesData
      });

      if (!rulesData) {
        toast({
          title: "Error",
          description: "Please configure rules before generating timetable.",
          variant: "destructive"
        });
        return;
      }

      if (sections.length === 0 || teachers.length === 0 || courses.length === 0 || classrooms.length === 0) {
        toast({
          title: "Error",
          description: "Please add sections, teachers, courses, and classrooms before generating timetable.",
          variant: "destructive"
        });
        return;
      }

      console.log('Clearing existing timetable entries...');
      await supabase.from('timetable_entries').delete().eq('program_id', currentProgram.id);

      const result = await generateTimetable(
        sections as Section[],
        teachers as Teacher[],
        courses as Course[],
        groups as GroupClass[],
        assignments as Assignment[],
        rulesData as Rules,
        classrooms as Classroom[]
      );

      console.log(`Generated ${result.length} timetable entries`);
      setTimetable(result);

      if (result.length > 0) {
        const entries = result.map(entry => ({
          ...entry,
          program_id: currentProgram.id
        }));
        
        const { error: insertError } = await supabase
          .from('timetable_entries')
          .insert(entries);

        if (insertError) {
          console.error('Error saving timetable:', insertError);
          throw insertError;
        }
      }

      toast({
        title: "Success", 
        description: `Generated timetable with ${result.length} scheduled sessions following all constraints!`,
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

      <StatsCards stats={stats} />

      <div className="text-center space-y-4">
        <div className="flex justify-center gap-4">
          <Button 
            onClick={refreshStats}
            disabled={isLoadingStats}
            variant="outline"
            size="lg"
          >
            {isLoadingStats ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 mr-2" />
            )}
            Refresh Stats
          </Button>
          
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

        {(stats.sections === 0 || stats.teachers === 0 || stats.courses === 0 || stats.classrooms === 0) && (
          <p className="text-sm text-orange-600">
            Please add sections, teachers, courses, and classrooms before generating the timetable.
          </p>
        )}
      </div>

      <ConstraintInfo />
      <TimetableDisplay timetable={timetable} />
    </div>
  );
};

export default Generate;
