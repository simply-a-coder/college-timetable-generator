
-- First, let's set up authentication and improve the existing tables

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policies to existing tables to require authentication
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables to allow authenticated users full access
CREATE POLICY "Authenticated users can manage programs" ON public.programs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage sections" ON public.sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage teachers" ON public.teachers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage courses" ON public.courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage classrooms" ON public.classrooms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage groups" ON public.groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage assignments" ON public.assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage rules" ON public.rules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage timetable_entries" ON public.timetable_entries FOR ALL USING (auth.role() = 'authenticated');
