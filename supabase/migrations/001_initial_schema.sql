-- Labverse Database Schema
-- Run these migrations in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    school_name TEXT,
    target_waec_year INT DEFAULT 2026,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- Practicals Catalog
CREATE TABLE public.practicals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- User Experiment Sessions
CREATE TABLE public.experiment_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    practical_id UUID REFERENCES public.practicals(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
    state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    score NUMERIC(5,2),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practicals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Experiment sessions policies
CREATE POLICY "Users can manage own sessions" ON public.experiment_sessions 
    FOR ALL USING (auth.uid() = user_id);

-- Practicals policies (public read)
CREATE POLICY "Anyone can view practicals" ON public.practicals 
    FOR SELECT USING (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, school_name, target_waec_year)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'school_name', 2026);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed practicals data
INSERT INTO public.practicals (subject, title, description, slug) VALUES
-- Physics
('physics', 'Simple Pendulum Experiment', 'Determine acceleration due to gravity (g) using T² vs L graph', 'pendulum'),
('physics', 'Refraction through Glass Block', 'Verify Snell''s law and determine refractive index', 'refraction'),
('physics', 'Ohm''s Law Verification', 'Determine resistance using V-I characteristics', 'ohms-law'),
('physics', 'Focal Length of Convex Lens', 'Determine focal length using u-v method', 'convex-lens'),
('physics', 'Speed of Sound in Air', 'Resonance tube method for determining speed of sound', 'speed-of-sound'),

-- Chemistry
('chemistry', 'Acid-Base Titration', 'Standardize HCl against Na₂CO₃ using Methyl Orange indicator', 'titration'),
('chemistry', 'Qualitative Analysis - Cations', 'Identify unknown cations using systematic analysis', 'qualitative-cations'),
('chemistry', 'Qualitative Analysis - Anions', 'Identify unknown anions using confirmatory tests', 'qualitative-anions'),
('chemistry', 'Enthalpy of Neutralization', 'Determine heat of neutralization of strong acid and base', 'enthalpy-neutralization'),
('chemistry', 'Rate of Reaction', 'Study effect of concentration on reaction rate', 'rate-of-reaction'),

-- Biology
('biology', 'Onion Epidermal Cell', 'Observe and label plant cell structure under microscope', 'onion-epidermis'),
('biology', 'Leaf Stomata Observation', 'Examine stomatal distribution and structure', 'leaf-stomata'),
('biology', 'Human Cheek Cell', 'Observe animal cell structure', 'cheek-cell'),
('biology', 'Spirogyra Filament', 'Study algae cell structure and conjugation', 'spirogyra'),
('biology', 'Transpiration Rate', 'Measure transpiration using potometer', 'transpiration')
ON CONFLICT (slug) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_experiment_sessions_user_id ON public.experiment_sessions(user_id);
CREATE INDEX idx_experiment_sessions_practical_id ON public.experiment_sessions(practical_id);
CREATE INDEX idx_experiment_sessions_status ON public.experiment_sessions(status);
CREATE INDEX idx_practicals_subject ON public.practicals(subject);