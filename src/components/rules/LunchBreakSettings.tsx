
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { Rules, TIME_SLOTS } from '@/types';

interface LunchBreakSettingsProps {
  rules: Rules;
  onUpdateRule: (field: keyof Rules, value: any) => void;
}

const LunchBreakSettings: React.FC<LunchBreakSettingsProps> = ({ rules, onUpdateRule }) => {
  return (
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
            onValueChange={(value) => onUpdateRule('lunch_start_slot', value)}
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
            onValueChange={(value) => onUpdateRule('lunch_end_slot', value)}
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
  );
};

export default LunchBreakSettings;
