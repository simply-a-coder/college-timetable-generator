import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, FileText, Users, BookOpen, Building, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { TimetableEntry, DAYS, TIME_SLOTS, Section, Teacher, Course, GroupClass, Assignment, Rules } from '@/types';
import { toast } from '@/hooks/use-toast';
import { generateTimetable } from '@/utils/scheduler';

const Generate: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState('sections');

  const generateTimetableHandler = async () => {
    setIsGenerating(true);
    
    try {
      // Load all data from localStorage
      const sectionsData = localStorage.getItem('sections');
      const teachersData = localStorage.getItem('teachers');
      const coursesData = localStorage.getItem('courses');
      const groupsData = localStorage.getItem('groups');
      const assignmentsData = localStorage.getItem('assignments');
      const rulesData = localStorage.getItem('rules');

      if (!sectionsData || !teachersData || !coursesData || !assignmentsData) {
        toast({
          title: "Missing Data",
          description: "Please ensure all required data (sections, teachers, courses, assignments) is configured.",
          variant: "destructive"
        });
        return;
      }

      const sections: Section[] = JSON.parse(sectionsData);
      const teachers: Teacher[] = JSON.parse(teachersData);
      const courses: Course[] = JSON.parse(coursesData);
      const groups: GroupClass[] = groupsData ? JSON.parse(groupsData) : [];
      const assignments: Assignment[] = JSON.parse(assignmentsData);
      const rules: Rules = rulesData ? JSON.parse(rulesData) : {
        id: '1',
        lunch_start_slot: '12:05-12:55',
        lunch_end_slot: '13:05-13:55',
        travel_gap_minutes: 10,
        max_lectures_per_day: 6,
        max_labs_per_day: 3,
        allowed_slots: TIME_SLOTS,
        section_break_rules: {}
      };

      console.log('Generating timetable with data:', {
        sections: sections.length,
        teachers: teachers.length,
        courses: courses.length,
        groups: groups.length,
        assignments: assignments.length
      });

      const result = await generateTimetable(sections, teachers, courses, groups, assignments, rules);
      
      setTimetable(result);
      
      // Save the generated timetable
      localStorage.setItem('generatedTimetable', JSON.stringify(result));
      
      toast({
        title: "Success!",
        description: `Timetable generated successfully with ${result.length} scheduled sessions.`,
      });
    } catch (error) {
      console.error('Timetable generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate timetable. Please check your configurations and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Section', 'Teacher', 'Course', 'Day', 'Time', 'Room'],
      ...timetable.map(entry => [
        entry.section,
        entry.teacher,
        entry.course,
        entry.day,
        entry.time,
        entry.room
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timetable.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export functionality would be implemented here.",
    });
  };

  const getTimetableForView = (viewType: string) => {
    if (viewType === 'sections') {
      const sections = [...new Set(timetable.map(entry => entry.section))];
      return sections;
    } else if (viewType === 'teachers') {
      const teachers = [...new Set(timetable.map(entry => entry.teacher))];
      return teachers;
    } else {
      const rooms = [...new Set(timetable.map(entry => entry.room))];
      return rooms;
    }
  };

  const getEntriesForEntity = (entity: string, viewType: string) => {
    return timetable.filter(entry => {
      if (viewType === 'sections') return entry.section === entity;
      if (viewType === 'teachers') return entry.teacher === entity;
      return entry.room === entity;
    });
  };

  const renderCalendarGrid = (entity: string, viewType: string) => {
    const entries = getEntriesForEntity(entity, viewType);
    
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-1 mb-2">
            <div className="p-2 font-semibold text-center bg-slate-100 rounded">Time</div>
            {DAYS.slice(0, 5).map(day => (
              <div key={day} className="p-2 font-semibold text-center bg-slate-100 rounded">
                {day}
              </div>
            ))}
          </div>
          
          {TIME_SLOTS.map(slot => (
            <div key={slot} className="grid grid-cols-6 gap-1 mb-1">
              <div className="p-2 text-sm text-center bg-slate-50 rounded border">
                {slot}
              </div>
              {DAYS.slice(0, 5).map(day => {
                const entry = entries.find(e => e.day === day && e.time === slot);
                return (
                  <div 
                    key={`${day}-${slot}`} 
                    className={`p-2 text-xs rounded border min-h-[60px] ${
                      entry 
                        ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {entry && (
                      <div>
                        <div className="font-semibold text-blue-800">
                          {viewType === 'sections' ? entry.course.split(' - ')[0] : 
                           viewType === 'teachers' ? entry.section : 
                           entry.teacher}
                        </div>
                        <div className="text-blue-600 mt-1">
                          {viewType === 'sections' ? entry.teacher : 
                           viewType === 'teachers' ? entry.course.split(' - ')[0] : 
                           entry.course.split(' - ')[0]}
                        </div>
                        <div className="text-blue-500 text-xs mt-1">
                          {viewType !== 'rooms' ? entry.room : entry.section}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Generate Timetable</h2>
        <p className="text-slate-600">Create optimized schedules using custom constraint solving algorithms</p>
      </div>

      {!timetable.length ? (
        <Card className="max-w-md mx-auto animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Ready to Generate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Your timetable will be generated using advanced constraint satisfaction algorithms 
              to ensure optimal scheduling while respecting all rules and preferences.
            </p>
            <Button 
              onClick={generateTimetableHandler}
              disabled={isGenerating}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Generating Timetable...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Generate Timetable
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            <Button onClick={downloadCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button onClick={exportPDF} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={() => {
                setTimetable([]);
                toast({
                  title: "Cleared",
                  description: "Timetable cleared. You can generate a new one.",
                });
              }}
              variant="outline"
            >
              Generate New
            </Button>
          </div>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Generated Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sections" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Sections
                  </TabsTrigger>
                  <TabsTrigger value="teachers" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Teachers
                  </TabsTrigger>
                  <TabsTrigger value="rooms" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Rooms
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {['sections', 'teachers', 'rooms'].map(viewType => (
                    <TabsContent key={viewType} value={viewType}>
                      <div className="space-y-6">
                        {getTimetableForView(viewType).map(entity => (
                          <Card key={entity}>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {viewType === 'sections' ? `Section ${entity}` :
                                 viewType === 'teachers' ? entity :
                                 entity}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderCalendarGrid(entity, viewType)}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Generate;
