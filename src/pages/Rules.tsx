
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Rules, TIME_SLOTS, Section } from '@/types';
import { toast } from '@/hooks/use-toast';
import LunchBreakSettings from '@/components/rules/LunchBreakSettings';
import TravelAndLimits from '@/components/rules/TravelAndLimits';
import SectionBreakRules from '@/components/rules/SectionBreakRules';
import TimeSlotManager from '@/components/rules/TimeSlotManager';

const RulesPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [rules, setRules] = useState<Rules>({
    id: '1',
    lunch_start_slot: '12:05-12:55',
    lunch_end_slot: '13:05-13:55',
    travel_gap_minutes: 10,
    max_lectures_per_day: 6,
    max_labs_per_day: 3,
    allowed_slots: TIME_SLOTS,
    section_break_rules: {}
  });

  useEffect(() => {
    const savedSections = localStorage.getItem('sections');
    const savedRules = localStorage.getItem('rules');
    
    if (savedSections) {
      const sectionsData = JSON.parse(savedSections);
      setSections(sectionsData);
      
      if (savedRules) {
        const rulesData = JSON.parse(savedRules);
        const newBreakRules = { ...rulesData.section_break_rules };
        
        sectionsData.forEach((section: Section) => {
          if (!newBreakRules[section.id]) {
            newBreakRules[section.id] = { hasBreak: true, breakSlot: '12:05-12:55' };
          }
        });
        
        setRules({
          id: rulesData.id || '1',
          lunch_start_slot: rulesData.lunch_start_slot || '12:05-12:55',
          lunch_end_slot: rulesData.lunch_end_slot || '13:05-13:55',
          travel_gap_minutes: rulesData.travel_gap_minutes ?? 10,
          max_lectures_per_day: rulesData.max_lectures_per_day ?? 6,
          max_labs_per_day: rulesData.max_labs_per_day ?? 3,
          allowed_slots: rulesData.allowed_slots || TIME_SLOTS,
          section_break_rules: newBreakRules
        });
      }
    }
  }, []);

  const updateRule = (field: keyof Rules, value: any) => {
    setRules(prev => ({ ...prev, [field]: value }));
  };

  const updateSectionBreakRule = (sectionId: string, field: 'hasBreak' | 'breakSlot', value: any) => {
    setRules(prev => ({
      ...prev,
      section_break_rules: {
        ...prev.section_break_rules,
        [sectionId]: {
          ...prev.section_break_rules[sectionId],
          [field]: value
        }
      }
    }));
  };

  const handleSlotToggle = (slot: string, checked: boolean) => {
    setRules(prev => ({
      ...prev,
      allowed_slots: checked 
        ? [...prev.allowed_slots, slot]
        : prev.allowed_slots.filter(s => s !== slot)
    }));
  };

  const handleSave = () => {
    if (rules.allowed_slots.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one time slot must be allowed.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('rules', JSON.stringify(rules));
    toast({
      title: "Success",
      description: "Rules saved successfully!",
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Rules & Constraints</h2>
        <p className="text-slate-600">Configure global scheduling rules and section-specific break times</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LunchBreakSettings rules={rules} onUpdateRule={updateRule} />
        <TravelAndLimits rules={rules} onUpdateRule={updateRule} />
      </div>

      <SectionBreakRules 
        sections={sections} 
        rules={rules} 
        onUpdateSectionBreakRule={updateSectionBreakRule} 
      />

      <TimeSlotManager rules={rules} onSlotToggle={handleSlotToggle} />

      <div className="flex justify-center">
        <Button 
          onClick={handleSave}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Settings className="w-5 h-5 mr-2" />
          Save Rules
        </Button>
      </div>
    </div>
  );
};

export default RulesPage;
