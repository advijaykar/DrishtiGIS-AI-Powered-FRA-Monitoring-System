-- Create FRA Records Management Database Schema

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'officer', 'user')),
  phone TEXT,
  state TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FRA documents table
CREATE TABLE public.fra_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pattas (land rights) table
CREATE TABLE public.pattas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.fra_documents(id),
  holder_name TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  tribal_group TEXT,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('individual', 'community')),
  land_area DECIMAL(10,4),
  coordinates POINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  survey_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table for AI-detected features
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patta_id UUID REFERENCES public.pattas(id),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('farmland', 'water_body', 'homestead', 'forest', 'pond')),
  coordinates POINT,
  area DECIMAL(10,4),
  confidence_score DECIMAL(3,2),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_by_user BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE
);

-- Create schemes table for government schemes
CREATE TABLE public.schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  eligibility_criteria JSONB,
  benefits TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheme recommendations table
CREATE TABLE public.scheme_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patta_id UUID REFERENCES public.pattas(id),
  scheme_id UUID REFERENCES public.schemes(id),
  recommendation_reason TEXT,
  confidence_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community feedback table
CREATE TABLE public.community_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patta_id UUID REFERENCES public.pattas(id),
  feedback_type TEXT CHECK (feedback_type IN ('asset_verification', 'photo_upload', 'status_update')),
  content TEXT,
  photo_url TEXT,
  coordinates POINT,
  submitted_by_phone TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fra_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for FRA documents
CREATE POLICY "Authenticated users can view FRA documents" 
ON public.fra_documents FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload FRA documents" 
ON public.fra_documents FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own documents" 
ON public.fra_documents FOR UPDATE 
USING (auth.uid() = uploaded_by);

-- Create RLS policies for pattas
CREATE POLICY "Public can view approved pattas" 
ON public.pattas FOR SELECT 
USING (status = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create pattas" 
ON public.pattas FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for assets
CREATE POLICY "Public can view assets" 
ON public.assets FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create assets" 
ON public.assets FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for schemes
CREATE POLICY "Public can view active schemes" 
ON public.schemes FOR SELECT 
USING (is_active = true);

-- Create RLS policies for recommendations
CREATE POLICY "Public can view recommendations" 
ON public.scheme_recommendations FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create recommendations" 
ON public.scheme_recommendations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for community feedback
CREATE POLICY "Public can view verified feedback" 
ON public.community_feedback FOR SELECT 
USING (verified = true);

CREATE POLICY "Anyone can submit feedback" 
ON public.community_feedback FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_pattas_coordinates ON public.pattas USING GIST (coordinates);
CREATE INDEX idx_pattas_village ON public.pattas (village, district, state);
CREATE INDEX idx_assets_coordinates ON public.assets USING GIST (coordinates);
CREATE INDEX idx_assets_patta_id ON public.assets (patta_id);

-- Insert sample schemes
INSERT INTO public.schemes (name, description, eligibility_criteria, benefits, department) VALUES
('PM-KISAN', 'Pradhan Mantri Kisan Samman Nidhi', '{"land_size": "<=2", "farmer_type": "small_marginal"}', 'Rs. 6000/year in 3 installments', 'Agriculture'),
('Jal Jeevan Mission', 'Har Ghar Jal - Functional Household Tap Connection', '{"water_access": false, "rural_area": true}', 'Piped water supply to household', 'Water Resources'),
('MGNREGA', 'Mahatma Gandhi National Rural Employment Guarantee Act', '{"rural_household": true, "adult_members": true}', '100 days guaranteed employment', 'Rural Development'),
('PMAY-G', 'Pradhan Mantri Awas Yojana - Gramin', '{"homeless": true, "below_poverty_line": true}', 'Financial assistance for house construction', 'Rural Development'),
('Swachh Bharat Mission', 'Clean India Mission', '{"toilet_access": false, "rural_area": true}', 'Financial assistance for toilet construction', 'Sanitation');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fra_documents_updated_at
  BEFORE UPDATE ON public.fra_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pattas_updated_at
  BEFORE UPDATE ON public.pattas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();