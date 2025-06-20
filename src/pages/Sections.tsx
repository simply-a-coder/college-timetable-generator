
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Users } from 'lucide-react';
import { Section } from '@/types';
import { toast } from '@/hooks/use-toast';

const Sections: React.FC = () => {
  const [numberOfSections, setNumberOfSections] = useState<number>(1);
  const [sections, setSections] = useState<Section[]>([
    { id: '1', code: 'A1', studentCount: 30 }
  ]);

  const handleNumberChange = (value: number) => {
    if (value < 1) return;
    
    setNumberOfSections(value);
    
    if (value > sections.length) {
      const newSections = [...sections];
      for (let i = sections.length; i < value; i++) {
        newSections.push({
          id: String(i + 1),
          code: `A${i + 1}`,
          studentCount: 30
        });
      }
      setSections(newSections);
    } else {
      setSections(sections.slice(0, value));
    }
  };

  const updateSection = (id: string, field: keyof Section, value: string | number) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const validateSections = () => {
    const codes = sections.map(s => s.code.trim().toLowerCase());
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
    
    if (duplicates.length > 0) {
      toast({
        title: "Validation Error",
        description: "Duplicate section codes found. Please ensure all codes are unique.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (validateSections()) {
      localStorage.setItem('sections', JSON.stringify(sections));
      toast({
        title: "Success",
        description: `${sections.length} sections saved successfully!`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Section Configuration</h2>
        <p className="text-slate-600">Define your academic sections and student counts</p>
      </div>

      <Card className="mx-auto max-w-md animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Number of Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            min="1"
            value={numberOfSections}
            onChange={(e) => handleNumberChange(parseInt(e.target.value) || 1)}
            className="text-center text-lg font-semibold"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
          <Card 
            key={section.id} 
            className="animate-slide-in-right transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Section {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`code-${section.id}`}>Section Code</Label>
                <Input
                  id={`code-${section.id}`}
                  value={section.code}
                  onChange={(e) => updateSection(section.id, 'code', e.target.value)}
                  placeholder="e.g., A1, B2"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`count-${section.id}`}>Student Count</Label>
                <Input
                  id={`count-${section.id}`}
                  type="number"
                  min="1"
                  value={section.studentCount}
                  onChange={(e) => updateSection(section.id, 'studentCount', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleSave}
          size="lg"
          className="animate-pulse hover:animate-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Save Sections
        </Button>
      </div>
    </div>
  );
};

export default Sections;
