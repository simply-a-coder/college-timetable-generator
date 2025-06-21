
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { TimetableEntry, TIME_SLOTS, DAYS } from '@/types';

interface TimetableDisplayProps {
  timetable: TimetableEntry[];
}

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ timetable }) => {
  if (timetable.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Generated Timetable ({timetable.length} sessions)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-slate-100">Time</th>
                {DAYS.slice(0, 5).map(day => (
                  <th key={day} className="border p-2 bg-slate-100">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="border p-2 font-medium bg-slate-50">{timeSlot}</td>
                  {DAYS.slice(0, 5).map(day => {
                    const entry = timetable.find(t => t.day === day && t.time === timeSlot);
                    return (
                      <td key={`${day}-${timeSlot}`} className="border p-2">
                        {entry && (
                          <div className="text-xs space-y-1">
                            <div className="font-medium">{entry.course}</div>
                            <div className="text-slate-600">{entry.section}</div>
                            <div className="text-slate-600">{entry.teacher}</div>
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {entry.room}
                            </Badge>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableDisplay;
