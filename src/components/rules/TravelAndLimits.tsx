
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { Rules } from '@/types';

interface TravelAndLimitsProps {
  rules: Rules;
  onUpdateRule: (field: keyof Rules, value: any) => void;
}

const TravelAndLimits: React.FC<TravelAndLimitsProps> = ({ rules, onUpdateRule }) => {
  return (
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
            onValueChange={(value) => onUpdateRule('travel_gap_minutes', parseInt(value))}
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
              onChange={(e) => onUpdateRule('max_lectures_per_day', parseInt(e.target.value) || 1)}
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
              onChange={(e) => onUpdateRule('max_labs_per_day', parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelAndLimits;
