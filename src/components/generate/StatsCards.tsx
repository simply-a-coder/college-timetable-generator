
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, MapPin, Calendar } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    sections: number;
    teachers: number;
    courses: number;
    assignments: number;
    classrooms: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.sections}</div>
          <p className="text-sm text-slate-600">Sections</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.teachers}</div>
          <p className="text-sm text-slate-600">Teachers</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.courses}</div>
          <p className="text-sm text-slate-600">Courses</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.classrooms}</div>
          <p className="text-sm text-slate-600">Classrooms</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.assignments}</div>
          <p className="text-sm text-slate-600">Assignments</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
