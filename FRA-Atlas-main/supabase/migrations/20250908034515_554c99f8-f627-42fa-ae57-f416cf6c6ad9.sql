-- Create storage buckets for FRA system
INSERT INTO storage.buckets (id, name, public) VALUES ('fra-documents', 'fra-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('community-photos', 'community-photos', true);

-- Create storage policies for FRA documents
CREATE POLICY "Authenticated users can upload FRA documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'fra-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view FRA documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'fra-documents' AND auth.role() = 'authenticated');

-- Create storage policies for community photos
CREATE POLICY "Anyone can upload community photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'community-photos');

CREATE POLICY "Public can view community photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'community-photos');

-- Insert sample data for demo
INSERT INTO public.pattas (holder_name, village, district, state, tribal_group, claim_type, land_area, coordinates, status) VALUES
('Ravi Kumar', 'Kumargram', 'Alipurduar', 'West Bengal', 'Rajbanshi', 'individual', 2.5, POINT(89.1234, 26.5678), 'approved'),
('Maya Devi', 'Birpara', 'Alipurduar', 'West Bengal', 'Toto', 'individual', 1.8, POINT(89.2345, 26.6789), 'approved'),
('Community Group A', 'Madarihat', 'Alipurduar', 'West Bengal', 'Mech', 'community', 15.3, POINT(89.3456, 26.7890), 'approved'),
('Lakshmi Oraon', 'Kalchini', 'Alipurduar', 'West Bengal', 'Oraon', 'individual', 3.2, POINT(89.4567, 26.8901), 'pending'),
('Suresh Munda', 'Nagrakata', 'Jalpaiguri', 'West Bengal', 'Munda', 'individual', 1.5, POINT(88.9876, 26.9012), 'approved');

-- Insert sample assets for the pattas
INSERT INTO public.assets (patta_id, asset_type, coordinates, area, confidence_score) VALUES
((SELECT id FROM public.pattas WHERE holder_name = 'Ravi Kumar'), 'farmland', POINT(89.1234, 26.5678), 2.0, 0.95),
((SELECT id FROM public.pattas WHERE holder_name = 'Ravi Kumar'), 'pond', POINT(89.1244, 26.5688), 0.3, 0.88),
((SELECT id FROM public.pattas WHERE holder_name = 'Maya Devi'), 'farmland', POINT(89.2345, 26.6789), 1.5, 0.92),
((SELECT id FROM public.pattas WHERE holder_name = 'Maya Devi'), 'homestead', POINT(89.2355, 26.6799), 0.2, 0.96),
((SELECT id FROM public.pattas WHERE holder_name = 'Community Group A'), 'forest', POINT(89.3456, 26.7890), 12.0, 0.91),
((SELECT id FROM public.pattas WHERE holder_name = 'Community Group A'), 'water_body', POINT(89.3466, 26.7900), 2.5, 0.89),
((SELECT id FROM public.pattas WHERE holder_name = 'Lakshmi Oraon'), 'farmland', POINT(89.4567, 26.8901), 2.8, 0.93),
((SELECT id FROM public.pattas WHERE holder_name = 'Suresh Munda'), 'farmland', POINT(88.9876, 26.9012), 1.2, 0.94),
((SELECT id FROM public.pattas WHERE holder_name = 'Suresh Munda'), 'homestead', POINT(88.9886, 26.9022), 0.1, 0.97);