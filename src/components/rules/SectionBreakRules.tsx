
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { Rules, Section, TIME_SLOTS } from '@/types';

interface SectionBreakRulesProps {
  sections: Section[];
  rules: Rules;
  onUpdateSectionBreakRule: (sectionId: string, field: 'hasBreak' | 'breakSlot', value: any) => void;
}

const SectionBreakRules: React.FC<SectionBreakRulesProps> = ({ 
  sections, 
  rules, 
  onUpdateSectionBreakRule 
}) => {
  if (sections.length === 0) return null;

  return (
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
                    onCheckedChange={(checked) => onUpdateSectionBreakRule(section.id, 'hasBreak', checked)}
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
                      onValueChange={(value) => onUpdateSectionBreakRule(section.id, 'breakSlot', value)}
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
  );
};

export default SectionBreakRules;
