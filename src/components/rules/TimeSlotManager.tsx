
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from 'lucide-react';
import { Rules, TIME_SLOTS } from '@/types';

interface TimeSlotManagerProps {
  rules: Rules;
  onSlotToggle: (slot: string, checked: boolean) => void;
}

const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({ rules, onSlotToggle }) => {
  const isSlotInLunchWindow = (slot: string) => {
    const lunchStart = TIME_SLOTS.indexOf(rules.lunch_start_slot);
    const lunchEnd = TIME_SLOTS.indexOf(rules.lunch_end_slot);
    const slotIndex = TIME_SLOTS.indexOf(slot);
    
    return slotIndex >= lunchStart && slotIndex <= lunchEnd;
  };

  return (
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
                    onCheckedChange={(checked) => onSlotToggle(slot, checked as boolean)}
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
  );
};

export default TimeSlotManager;
