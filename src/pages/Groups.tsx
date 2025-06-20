
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Users, BookOpen } from 'lucide-react';
import { GroupClass, Section, Course } from '@/types';
import { toast } from '@/hooks/use-toast';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<GroupClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState<Omit<GroupClass, 'id'>>({
    name: '',
    sections: [],
    courseId: '',
    sessionsOverride: undefined
  });

  useEffect(() => {
    // Load saved sections and courses
    const savedSections = localStorage.getItem('sections');
    const savedCourses = localStorage.getItem('courses');
    
    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedCourses) setCourses(JSON.parse(savedCourses));
  }, []);

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setNewGroup(prev => ({
      ...prev,
      sections: checked 
        ? [...prev.sections, sectionId]
        : prev.sections.filter(id => id !== sectionId)
    }));
  };

  const createGroup = () => {
    if (!newGroup.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Group name is required.",
        variant: "destructive"
      });
      return;
    }

    if (newGroup.sections.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one section must be selected.",
        variant: "destructive"
      });
      return;
    }

    if (!newGroup.courseId) {
      toast({
        title: "Validation Error",
        description: "A course must be selected.",
        variant: "destructive"
      });
      return;
    }

    const group: GroupClass = {
      ...newGroup,
      id: Date.now().toString()
    };

    setGroups(prev => [...prev, group]);
    setNewGroup({
      name: '',
      sections: [],
      courseId: '',
      sessionsOverride: undefined
    });
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Group created successfully!",
    });
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(group => group.id !== id));
  };

  const handleSave = () => {
    localStorage.setItem('groups', JSON.stringify(groups));
    toast({
      title: "Success",
      description: `${groups.length} groups saved successfully!`,
    });
  };

  const getSectionNames = (sectionIds: string[]) => {
    return sectionIds.map(id => {
      const section = sections.find(s => s.id === id);
      return section ? section.code : id;
    }).join(', ');
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : courseId;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Group Classes</h2>
        <p className="text-slate-600">Create combined classes for multiple sections</p>
      </div>

      <div className="flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="animate-pulse hover:animate-none bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Group Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Combined Programming Class"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" />
                  Select Sections
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 border rounded-lg">
                  {sections.map(section => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`section-${section.id}`}
                        checked={newGroup.sections.includes(section.id)}
                        onCheckedChange={(checked) => handleSectionToggle(section.id, checked as boolean)}
                      />
                      <label htmlFor={`section-${section.id}`} className="text-sm font-medium">
                        {section.code} ({section.studentCount} students)
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Course</Label>
                <Select 
                  value={newGroup.courseId} 
                  onValueChange={(value) => setNewGroup(prev => ({ ...prev, courseId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {course.code} - {course.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sessions Override (Optional)</Label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={newGroup.sessionsOverride || ''}
                  onChange={(e) => setNewGroup(prev => ({ 
                    ...prev, 
                    sessionsOverride: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Leave empty to use course default"
                  className="mt-1"
                />
              </div>

              <Button onClick={createGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, index) => (
          <Card 
            key={group.id} 
            className="animate-scale-in transition-all duration-200 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                  {group.name}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeGroup(group.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-slate-600">Sections</Label>
                <p className="text-sm font-medium">{getSectionNames(group.sections)}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-600">Course</Label>
                <p className="text-sm font-medium">{getCourseName(group.courseId)}</p>
              </div>
              {group.sessionsOverride && (
                <div>
                  <Label className="text-xs text-slate-600">Sessions Override</Label>
                  <p className="text-sm font-medium">{group.sessionsOverride} per week</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            size="lg"
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            Save All Groups
          </Button>
        </div>
      )}
    </div>
  );
};

export default Groups;
