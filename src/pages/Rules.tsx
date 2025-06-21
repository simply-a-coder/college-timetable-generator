
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Clock, MapPin, Calendar, Users } from 'lucide-react';
import { Rules, TIME_SLOTS, Section } from '@/types';
import { toast } from '@/hooks/use-toast';

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
      
      // Initialize break rules for new sections
      if (savedRules) {
        const rulesData = JSON.parse(savedRules);
        const newBreakRules = { ...rulesData.section_break_rules };
        
        sectionsData.forEach((section: Section) => {
          if (!newBreakRules[section.id]) {
            newBreakRules[section.id] = { hasBreak: true, breakSlot: '12:05-12:55' };
          }
        });
        
        // Ensure all required properties have default values
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

  const isSlotInLunchWindow = (slot: string) => {
    const lunchStart = TIME_SLOTS.indexOf(rules.lunch_start_slot);
    const lunchEnd = TIME_SLOTS.indexOf(rules.lunch_end_slot);
    const slotIndex = TIME_SLOTS.indexOf(slot);
    
    return slotIndex >= lunchStart && slotIndex <= lunchEnd;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Rules & Constraints</h2>
        <p className="text-slate-600">Configure global scheduling rules and section-specific break times</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-in-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Default Lunch Break Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Lunch Start Time</Label>
              <Select 
                value={rules.lunch_start_slot} 
                onValueChange={(value) => updateRule('lunch_start_slot', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lunch End Time</Label>
              <Select 
                value={rules.lunch_end_slot} 
                onValueChange={(value) => updateRule('lunch_end_slot', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Travel & Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Travel Gap (Minutes)</Label>
              <Select 
                value={(rules.travel_gap_minutes ?? 10).toString()} 
                onValueChange={(value) => updateRule('travel_gap_minutes', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Gap</SelectItem>
                  <SelectItem value="10">10 Minutes</SelectItem>
                  <SelectItem value="15">15 Minutes</SelectItem>
                  <SelectItem value="20">20 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Lectures/Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={rules.max_lectures_per_day ?? 6}
                  onChange={(e) => updateRule('max_lectures_per_day', parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Labs/Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={rules.max_labs_per_day ?? 3}
                  onChange={(e) => updateRule('max_labs_per_day', parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section-specific break rules */}
      {sections.length > 0 && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Section-Specific Break Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sections.map(section => (
                <div key={section.id} className="p-4 border rounded-lg bg-slate-50">
                  <h4 className="font-medium text-slate-800 mb-3">Section {section.code}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`break-${section.id}`}
                        checked={rules.section_break_rules[section.id]?.hasBreak !== false}
                        onCheckedChange={(checked) => updateSectionBreakRule(section.id, 'hasBreak', checked)}
                      />
                      <label htmlFor={`break-${section.id}`} className="text-sm">
                        Has Break Time
                      </label>
                    </div>
                    
                    {rules.section_break_rules[section.id]?.hasBreak !== false && (
                      <div>
                        <Label className="text-xs">Break Time</Label>
                        <Select 
                          value={rules.section_break_rules[section.id]?.breakSlot || '12:05-12:55'}
                          onValueChange={(value) => updateSectionBreakRule(section.id, 'breakSlot', value)}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map(slot => (
                              <SelectItem key={slot} value={slot} className="text-xs">
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Allowed Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {TIME_SLOTS.map(slot => {
                const isAllowed = rules.allowed_slots.includes(slot);
                const isLunchTime = isSlotInLunchWindow(slot);
                
                return (
                  <div 
                    key={slot} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                      isLunchTime 
                        ? 'bg-orange-50 border-orange-200' 
                        : isAllowed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <Checkbox
                      id={`slot-${slot}`}
                      checked={isAllowed}
                      onCheckedChange={(checked) => handleSlotToggle(slot, checked as boolean)}
                    />
                    <label htmlFor={`slot-${slot}`} className="text-sm font-medium cursor-pointer">
                      {slot}
                    </label>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>Allowed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-200 rounded"></div>
                <span>Lunch Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span>Blocked</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
