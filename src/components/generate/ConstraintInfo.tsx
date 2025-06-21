
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const ConstraintInfo: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Active Constraints
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-slate-800">Teacher Constraints:</h4>
            <ul className="text-slate-600 space-y-1">
              <li>• Available days and time slots</li>
              <li>• No double-booking conflicts</li>
              <li>• Respect days off</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-slate-800">Section Constraints:</h4>
            <ul className="text-slate-600 space-y-1">
              <li>• No overlapping classes</li>
              <li>• Lunch break scheduling</li>
              <li>• Daily session limits</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-slate-800">Classroom Constraints:</h4>
            <ul className="text-slate-600 space-y-1">
              <li>• Room type compatibility</li>
              <li>• Capacity requirements</li>
              <li>• Availability conflicts</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-slate-800">Course Constraints:</h4>
            <ul className="text-slate-600 space-y-1">
              <li>• Back-to-back restrictions</li>
              <li>• Sessions per week</li>
              <li>• Duration requirements</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConstraintInfo;
