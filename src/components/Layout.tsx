
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Users, BookOpen, UserCheck, Settings, Grid2x2, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/sections', label: 'Sections', icon: Grid2x2 },
  { path: '/teachers', label: 'Teachers', icon: Users },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/groups', label: 'Groups', icon: UserCheck },
  { path: '/assignments', label: 'Assignments', icon: Plus },
  { path: '/rules', label: 'Rules', icon: Settings },
  { path: '/generate', label: 'Generate', icon: Calendar },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                University Timetable Generator
              </h1>
              <p className="text-slate-600 mt-2">Create optimized schedules with AI-powered constraints</p>
            </div>
          </div>
          
          <nav className="mt-6">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200",
                      "hover:scale-105 hover:shadow-md",
                      isActive
                        ? "bg-white text-blue-600 shadow-lg border border-blue-100"
                        : "text-slate-600 hover:bg-white/60 hover:text-blue-600"
                    )}
                  >
                    <IconComponent size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        <main className="animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
