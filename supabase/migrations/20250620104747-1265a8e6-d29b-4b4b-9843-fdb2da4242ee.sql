
-- Create tables for persistent data storage
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- physics_lab, computer_lab, ubuntu_lab, lecture_hall, etc.
  capacity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  student_count INTEGER NOT NULL DEFAULT 0,
  lecture_timings TEXT, -- '8-1', '10-4', '1-4'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  available_days TEXT[] NOT NULL DEFAULT '{}',
  available_slots TEXT[] NOT NULL DEFAULT '{}',
  days_off TEXT[] NOT NULL DEFAULT '{}',
  max_hours_per_day INTEGER NOT NULL DEFAULT 8,
  max_hours_per_week INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sessions_per_week INTEGER NOT NULL DEFAULT 3,
  number_of_hours INTEGER NOT NULL DEFAULT 1,
  room_type TEXT NOT NULL DEFAULT 'lecture_hall',
  no_back_to_back TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sections TEXT[] NOT NULL DEFAULT '{}',
  course_id UUID REFERENCES public.courses(id),
  sessions_override INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(id),
  course_id UUID REFERENCES public.courses(id),
  section_or_group_ids TEXT[] NOT NULL DEFAULT '{}',
  type TEXT NOT NULL DEFAULT 'section', -- 'section' or 'group'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  lunch_start_slot TEXT NOT NULL DEFAULT '12:05-12:55',
  lunch_end_slot TEXT NOT NULL DEFAULT '13:05-13:55',
  travel_gap_minutes INTEGER NOT NULL DEFAULT 10,
  max_lectures_per_day INTEGER NOT NULL DEFAULT 6,
  max_labs_per_day INTEGER NOT NULL DEFAULT 3,
  allowed_slots TEXT[] NOT NULL DEFAULT '{}',
  section_break_rules JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.timetable_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  teacher TEXT NOT NULL,
  course TEXT NOT NULL,
  slot TEXT NOT NULL,
  room TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these later for authentication)
CREATE POLICY "Public access" ON public.programs FOR ALL USING (true);
CREATE POLICY "Public access" ON public.classrooms FOR ALL USING (true);
CREATE POLICY "Public access" ON public.sections FOR ALL USING (true);
CREATE POLICY "Public access" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Public access" ON public.courses FOR ALL USING (true);
CREATE POLICY "Public access" ON public.groups FOR ALL USING (true);
CREATE POLICY "Public access" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Public access" ON public.rules FOR ALL USING (true);
CREATE POLICY "Public access" ON public.timetable_entries FOR ALL USING (true);
