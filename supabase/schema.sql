-- Civic Infrastructure Intelligence Database Schema
-- Run this in your Supabase SQL editor to create all tables, indexes, and Row Level Security policies.

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'official', 'admin')),
  district TEXT DEFAULT 'North Delhi',
  locality TEXT DEFAULT 'Civil Lines',
  pin_code TEXT DEFAULT '110054',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  citizen_name TEXT DEFAULT 'Anonymous Citizen',
  citizen_mobile TEXT,
  citizen_email TEXT,
  issue TEXT NOT NULL,
  category TEXT NOT NULL,
  subissue TEXT,
  district TEXT NOT NULL,
  locality TEXT NOT NULL,
  pin_code TEXT DEFAULT '110007',
  landmark TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  citizen_district TEXT DEFAULT 'North Delhi',
  citizen_locality TEXT DEFAULT 'Civil Lines',
  citizen_pin TEXT DEFAULT '110054',
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Under Review' CHECK (status IN ('Submitted', 'AI Classified', 'Similar Reports Identified', 'Department Review', 'Action Initiated', 'Resolved', 'Under Review')),
  description TEXT NOT NULL,
  evidence_files JSONB DEFAULT '[]'::jsonb,
  voice_note BOOLEAN DEFAULT false,
  voice_audio_url TEXT,
  related_count INTEGER DEFAULT 1,
  similar_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Complaints are viewable by everyone" 
ON public.complaints FOR SELECT USING (true);

CREATE POLICY "Anyone can insert complaints" 
ON public.complaints FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own complaints or officials can update any" 
ON public.complaints FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('official', 'admin'))
);

CREATE POLICY "Officials can delete complaints" 
ON public.complaints FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('official', 'admin'))
);

-- 3. Department Notices table
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  dept TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notices are viewable by everyone" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Officials can manage notices" ON public.notices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('official', 'admin'))
);

-- 4. Infrastructure Gaps table
CREATE TABLE IF NOT EXISTS public.infrastructure_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  sector TEXT NOT NULL,
  gap_description TEXT NOT NULL,
  location TEXT NOT NULL,
  affected_population TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Suggested for Review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.infrastructure_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gaps are viewable by everyone" ON public.infrastructure_gaps FOR SELECT USING (true);

-- 5. Development Projects table
CREATE TABLE IF NOT EXISTS public.development_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'In progress',
  coverage TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.development_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by everyone" ON public.development_projects FOR SELECT USING (true);

-- 6. Priority Signals table
CREATE TABLE IF NOT EXISTS public.priority_signals (
  id TEXT PRIMARY KEY,
  rank TEXT NOT NULL,
  district TEXT NOT NULL,
  issue TEXT NOT NULL,
  demand_score INTEGER NOT NULL,
  gap_score INTEGER NOT NULL,
  population_score INTEGER NOT NULL,
  coverage_score INTEGER NOT NULL,
  signal_score INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Suggested for Review'
);

ALTER TABLE public.priority_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Priority signals are viewable by everyone" ON public.priority_signals FOR SELECT USING (true);

-- Storage bucket for evidence uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Evidence" 
ON storage.objects FOR SELECT USING (bucket_id = 'evidence');

CREATE POLICY "Upload Evidence" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence');
