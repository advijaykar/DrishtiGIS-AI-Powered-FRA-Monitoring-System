-- ========================================
-- Decision Support Engine - Sample Data
-- ========================================

-- Add more diverse patta holders from different states and contexts
INSERT INTO public.pattas (holder_name, village, district, state, tribal_group, claim_type, land_area, coordinates, status, survey_number) VALUES
-- Odisha (Tribal areas with rich forest resources)
('Dharani Majhi', 'Similiguda', 'Koraput', 'Odisha', 'Kondh', 'individual', 1.2, POINT(82.7234, 18.8123), 'approved', 'SY-145'),
('Baidhar Sabar', 'Raikia', 'Kandhamal', 'Odisha', 'Sabar', 'community', 8.5, POINT(84.0567, 20.1234), 'approved', 'SY-201'),
('Kumari Paraja', 'Daringbadi', 'Kandhamal', 'Odisha', 'Paraja', 'individual', 2.8, POINT(84.1678, 20.2345), 'pending', 'SY-156'),

-- Chhattisgarh (Van Dhan rich areas)
('Somaru Baiga', 'Patalkot', 'Chhindwara', 'Chhattisgarh', 'Baiga', 'individual', 3.5, POINT(78.9876, 22.1234), 'approved', 'SY-089'),
('Phoolmati Gond', 'Pendra', 'Bilaspur', 'Chhattisgarh', 'Gond', 'community', 12.3, POINT(81.9123, 22.7890), 'approved', 'SY-234'),
('Ramesh Korwa', 'Sarguja', 'Sarguja', 'Chhattisgarh', 'Korwa', 'individual', 1.9, POINT(83.1234, 23.6789), 'approved', 'SY-167'),

-- Jharkhand (Mining affected areas)
('Birsa Santhal', 'Dumka', 'Dumka', 'Jharkhand', 'Santhal', 'individual', 0.8, POINT(87.2468, 24.2691), 'rejected', 'SY-078'),
('Sushila Ho', 'Chaibasa', 'West Singhbhum', 'Jharkhand', 'Ho', 'individual', 4.2, POINT(85.8036, 22.5562), 'approved', 'SY-312'),

-- Maharashtra (Watershed areas)
('Vitthal Bhil', 'Akkalkuwa', 'Nandurbar', 'Maharashtra', 'Bhil', 'individual', 2.1, POINT(74.0123, 21.1234), 'approved', 'SY-445'),
('Savita Warli', 'Dahanu', 'Palghar', 'Maharashtra', 'Warli', 'community', 6.7, POINT(72.7234, 19.9678), 'approved', 'SY-221'),

-- Rajasthan (Arid zone agriculture)
('Kaluram Meena', 'Baran', 'Baran', 'Rajasthan', 'Meena', 'individual', 5.8, POINT(76.5123, 25.1012), 'approved', 'SY-556'),
('Geeta Saharia', 'Shahpura', 'Bhilwara', 'Rajasthan', 'Saharia', 'individual', 1.3, POINT(74.8234, 25.6234), 'pending', 'SY-189'),

-- Assam (Tea garden workers)
('Krishna Bodo', 'Kokrajhar', 'Kokrajhar', 'Assam', 'Bodo', 'individual', 1.5, POINT(90.2728, 26.4019), 'approved', 'SY-667'),
('Purnima Rabha', 'Goalpara', 'Goalpara', 'Assam', 'Rabha', 'individual', 2.3, POINT(90.6182, 26.1662), 'approved', 'SY-334');

-- Add comprehensive assets for new pattas
INSERT INTO public.assets (patta_id, asset_type, coordinates, area, confidence_score, detected_at) VALUES
-- Dharani Majhi's assets
((SELECT id FROM public.pattas WHERE holder_name = 'Dharani Majhi'), 'farmland', POINT(82.7234, 18.8123), 0.8, 0.94, now() - interval '10 days'),
((SELECT id FROM public.pattas WHERE holder_name = 'Dharani Majhi'), 'forest', POINT(82.7244, 18.8133), 0.3, 0.89, now() - interval '10 days'),

-- Baidhar Sabar's community assets
((SELECT id FROM public.pattas WHERE holder_name = 'Baidhar Sabar'), 'forest', POINT(84.0567, 20.1234), 6.2, 0.96, now() - interval '15 days'),
((SELECT id FROM public.pattas WHERE holder_name = 'Baidhar Sabar'), 'water_body', POINT(84.0577, 20.1244), 1.5, 0.92, now() - interval '15 days'),
((SELECT id FROM public.pattas WHERE holder_name = 'Baidhar Sabar'), 'farmland', POINT(84.0587, 20.1254), 0.8, 0.88, now() - interval '15 days'),

-- Somaru Baiga's assets (Van Dhan rich)
((SELECT id FROM public.pattas WHERE holder_name = 'Somaru Baiga'), 'forest', POINT(78.9876, 22.1234), 2.8, 0.97, now() - interval '8 days'),
((SELECT id FROM public.pattas WHERE holder_name = 'Somaru Baiga'), 'farmland', POINT(78.9886, 22.1244), 0.6, 0.91, now() - interval '8 days'),
((SELECT id FROM public.pattas WHERE holder_name = 'Somaru Baiga'), 'homestead', POINT(78.9896, 22.1254), 0.1, 0.95, now() - interval '8 days'),

-- Sushila Ho's assets
((SELECT id FROM public.pattas WHERE holder_name = 'Sushila Ho'), 'farmland', POINT(85.8036, 22.5562), 3.5, 0.93, now() - interval '5 days'),
((SELECT id FROM public.pattas WHERE holder_name = 'Sushila Ho'), 'pond', POINT(85.8046, 22.5572), 0.4, 0.87, now() - interval '5 days'),
((SELECT id FROM public.pattas WHERE holder_name = 'Sushila Ho'), 'homestead', POINT(85.8056, 22.5582), 0.3, 0.96, now() - interval '5 days');

-- Add comprehensive government schemes with detailed eligibility criteria
INSERT INTO public.schemes (name, description, eligibility_criteria, benefits, department, is_active) VALUES
('Van Dhan Vikas', 'Tribal Forest Produce Value Addition Scheme', 
 '{"tribal_area": true, "forest_produce_available": true, "shg_formation": "required", "land_area": "any"}', 
 'Forest produce processing facilities, training, market linkage', 'Ministry of Tribal Affairs', true),

('PM Fasal Bima Yojana', 'Crop Insurance Scheme', 
 '{"farmer_type": "all", "crop_cultivation": true, "premium_payment": "required", "land_area": ">0.5"}', 
 'Crop loss insurance coverage up to sum insured', 'Agriculture & Farmers Welfare', true),

('Kisan Credit Card', 'Agricultural Credit Scheme', 
 '{"farmer_type": "all", "land_ownership": "required", "credit_history": "good", "land_area": ">0.5"}', 
 'Flexible credit up to Rs 3 lakhs at 7% interest', 'Agriculture & Farmers Welfare', true),

('National Horticulture Mission', 'Horticulture Development', 
 '{"land_area": ">0.25", "horticulture_suitable": true, "water_access": "required"}', 
 'Subsidy for horticulture development, drip irrigation', 'Agriculture & Farmers Welfare', true),

('Pradhan Mantri Matsya Sampada Yojana', 'Fisheries Development', 
 '{"water_body_access": true, "fishery_activity": "new_or_existing", "land_area": ">0.1"}', 
 'Financial assistance for fish farming, equipment', 'Fisheries', true),

('Soil Health Card Scheme', 'Soil Testing and Health Cards', 
 '{"farmer_type": "all", "land_cultivation": true, "land_area": ">0"}', 
 'Free soil testing, nutrient recommendations', 'Agriculture & Farmers Welfare', true),

('Pradhan Mantri Krishi Sinchayee Yojana', 'Irrigation Development', 
 '{"land_area": ">0.5", "irrigation_required": true, "water_source_nearby": true}', 
 'Drip irrigation, sprinkler systems, micro-irrigation', 'Agriculture & Farmers Welfare', true),

('National Rural Livelihood Mission', 'Self Employment and Skill Development', 
 '{"rural_area": true, "below_poverty_line": true, "age": "18-59"}', 
 'Skill training, credit linkage, employment opportunities', 'Rural Development', true),

('Forest Rights Act Implementation', 'Community Forest Rights', 
 '{"tribal_community": true, "forest_area": "traditional_use", "community_claim": "eligible"}', 
 'Community forest rights, conservation responsibilities', 'Environment & Forests', true),

('Digital India - Common Service Centers', 'Digital Service Access', 
 '{"rural_area": true, "digital_literacy": "basic", "entrepreneur_interest": true}', 
 'Digital service delivery, entrepreneurship opportunities', 'Electronics & IT', true),

('Pradhan Mantri Ujjwala Yojana', 'Clean Cooking Fuel', 
 '{"below_poverty_line": true, "rural_area": true, "woman_head": "preferred"}', 
 'Free LPG connection, cooking gas subsidy', 'Petroleum & Natural Gas', true),

('Ayushman Bharat - PMJAY', 'Health Insurance Scheme', 
 '{"below_poverty_line": true, "secc_database": "eligible", "family_size": "any"}', 
 'Health insurance coverage up to Rs 5 lakhs per family', 'Health & Family Welfare', true);

-- Generate realistic scheme recommendations based on patta holder profiles
INSERT INTO public.scheme_recommendations (patta_id, scheme_id, recommendation_reason, confidence_score, status) VALUES
-- Van Dhan suitable for forest-rich areas
((SELECT id FROM public.pattas WHERE holder_name = 'Somaru Baiga'), 
 (SELECT id FROM public.schemes WHERE name = 'Van Dhan Vikas'), 
 'Located in forest-rich Baiga tribal area with traditional knowledge of NTFP collection and processing', 0.96, 'pending'),

((SELECT id FROM public.pattas WHERE holder_name = 'Baidhar Sabar'), 
 (SELECT id FROM public.schemes WHERE name = 'Van Dhan Vikas'), 
 'Community forest area with diverse NTFP resources, existing community cooperation', 0.94, 'accepted'),

-- PM-KISAN for small landholders
((SELECT id FROM public.pattas WHERE holder_name = 'Dharani Majhi'), 
 (SELECT id FROM public.schemes WHERE name = 'PM-KISAN'), 
 'Small landholder (1.2 ha) engaged in agriculture, below 2 hectare limit', 0.98, 'accepted'),

((SELECT id FROM public.pattas WHERE holder_name = 'Ramesh Korwa'), 
 (SELECT id FROM public.schemes WHERE name = 'PM-KISAN'), 
 'Marginal farmer with 1.9 hectares, primarily agricultural land use', 0.95, 'pending'),

-- MGNREGA for employment
((SELECT id FROM public.pattas WHERE holder_name = 'Krishna Bodo'), 
 (SELECT id FROM public.schemes WHERE name = 'MGNREGA'), 
 'Rural household with adult members, need for employment opportunities', 0.92, 'accepted'),

-- Fisheries scheme for water body owners
((SELECT id FROM public.pattas WHERE holder_name = 'Sushila Ho'), 
 (SELECT id FROM public.schemes WHERE name = 'Pradhan Mantri Matsya Sampada Yojana'), 
 'Has pond asset (0.4 ha), suitable for fish farming development', 0.89, 'pending'),

-- Irrigation scheme for larger landholders
((SELECT id FROM public.pattas WHERE holder_name = 'Kaluram Meena'), 
 (SELECT id FROM public.schemes WHERE name = 'Pradhan Mantri Krishi Sinchayee Yojana'), 
 'Large landholding (5.8 ha) in arid Rajasthan, irrigation critical for productivity', 0.91, 'pending'),

-- Crop insurance for farmers
((SELECT id FROM public.pattas WHERE holder_name = 'Vitthal Bhil'), 
 (SELECT id FROM public.schemes WHERE name = 'PM Fasal Bima Yojana'), 
 'Agricultural land in drought-prone area, crop insurance recommended', 0.87, 'accepted');

-- Add community feedback entries
INSERT INTO public.community_feedback (patta_id, feedback_type, content, photo_url, coordinates, submitted_by_phone, verified) VALUES
((SELECT id FROM public.pattas WHERE holder_name = 'Dharani Majhi'), 'asset_verification', 
 'The pond shown in satellite image has dried up during summer. Need water conservation measures.', 
 'https://example.com/dried_pond.jpg', POINT(82.7244, 18.8133), '+919876543210', true),

((SELECT id FROM public.pattas WHERE holder_name = 'Somaru Baiga'), 'photo_upload', 
 'Tendu leaf collection in progress. Good harvest this season. Van Dhan center would help with processing.', 
 'https://example.com/tendu_collection.jpg', POINT(78.9876, 22.1234), '+919876543211', true),

((SELECT id FROM public.pattas WHERE holder_name = 'Baidhar Sabar'), 'status_update', 
 'Community forest rights certificate received. Planning sustainable harvesting of minor forest produce.', 
 NULL, POINT(84.0567, 20.1234), '+919876543212', true),

((SELECT id FROM public.pattas WHERE holder_name = 'Sushila Ho'), 'asset_verification', 
 'New pond excavation completed under MGNREGA. Ready for fish farming.', 
 'https://example.com/new_pond.jpg', POINT(85.8046, 22.5572), '+919876543213', false),

((SELECT id FROM public.pattas WHERE holder_name = 'Krishna Bodo'), 'photo_upload', 
 'Crop damage due to elephant intrusion. Need compensation and protection measures.', 
 'https://example.com/crop_damage.jpg', POINT(90.2728, 26.4019), '+919876543214', true),

((SELECT id FROM public.pattas WHERE holder_name = 'Kaluram Meena'), 'status_update', 
 'Drip irrigation system installed. Water usage reduced by 40%. Crop yield improved.', 
 'https://example.com/drip_irrigation.jpg', POINT(76.5123, 25.1012), '+919876543215', true);

-- Update some existing pattas with more realistic data
UPDATE public.pattas SET 
    tribal_group = CASE 
        WHEN holder_name = 'Ravi Kumar' THEN 'Rajbanshi'
        WHEN holder_name = 'Maya Devi' THEN 'Toto'
        WHEN holder_name = 'Community Group A' THEN 'Mech'
        WHEN holder_name = 'Lakshmi Oraon' THEN 'Oraon'
        WHEN holder_name = 'Suresh Munda' THEN 'Munda'
        ELSE tribal_group
    END,
    survey_number = CASE 
        WHEN holder_name = 'Ravi Kumar' THEN 'WB-ALI-001'
        WHEN holder_name = 'Maya Devi' THEN 'WB-ALI-002'
        WHEN holder_name = 'Community Group A' THEN 'WB-ALI-003'
        WHEN holder_name = 'Lakshmi Oraon' THEN 'WB-ALI-004'
        WHEN holder_name = 'Suresh Munda' THEN 'WB-JAL-005'
        ELSE survey_number
    END;

-- Add additional recommendations for existing patta holders
INSERT INTO public.scheme_recommendations (patta_id, scheme_id, recommendation_reason, confidence_score, status) VALUES
((SELECT id FROM public.pattas WHERE holder_name = 'Ravi Kumar'), 
 (SELECT id FROM public.schemes WHERE name = 'PM Fasal Bima Yojana'), 
 'Medium landholding with mixed crop cultivation, crop insurance recommended', 0.88, 'pending'),

((SELECT id FROM public.pattas WHERE holder_name = 'Maya Devi'), 
 (SELECT id FROM public.schemes WHERE name = 'Jal Jeevan Mission'), 
 'Rural household without piped water access, priority area for tap connection', 0.93, 'accepted'),

((SELECT id FROM public.pattas WHERE holder_name = 'Community Group A'), 
 (SELECT id FROM public.schemes WHERE name = 'Forest Rights Act Implementation'), 
 'Large community forest holding requires formal rights recognition and management plan', 0.97, 'accepted');

-- Insert sample FRA documents to link with pattas
INSERT INTO public.fra_documents (file_name, file_url, extraction_status, extracted_data) VALUES
('Patalkot_Community_Claim.pdf', 'https://storage.supabase.co/fra-documents/patalkot_claim.pdf', 'completed', 
 '{"pages": 15, "claim_type": "individual", "land_area": 3.5, "gps_coordinates": "78.9876,22.1234", "assets": ["forest", "farmland", "homestead"]}'),
 
('Similiguda_Individual_Rights.pdf', 'https://storage.supabase.co/fra-documents/similiguda_rights.pdf', 'completed',
 '{"pages": 8, "claim_type": "individual", "land_area": 1.2, "gps_coordinates": "82.7234,18.8123", "assets": ["farmland", "forest"]}'),
 
('Sarguja_Family_Patta.pdf', 'https://storage.supabase.co/fra-documents/sarguja_patta.pdf', 'processing',
 '{"pages": 12, "claim_type": "individual", "land_area": 1.9, "extraction_progress": 60}');

-- Update some pattas to link with documents
UPDATE public.pattas SET 
    document_id = (SELECT id FROM public.fra_documents WHERE file_name = 'Patalkot_Community_Claim.pdf')
    WHERE holder_name = 'Somaru Baiga';

UPDATE public.pattas SET 
    document_id = (SELECT id FROM public.fra_documents WHERE file_name = 'Similiguda_Individual_Rights.pdf')
    WHERE holder_name = 'Dharani Majhi';

UPDATE public.pattas SET 
    document_id = (SELECT id FROM public.fra_documents WHERE file_name = 'Sarguja_Family_Patta.pdf')
    WHERE holder_name = 'Ramesh Korwa';

-- Add performance tracking data for analytics
CREATE TABLE IF NOT EXISTS public.dss_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2),
    metric_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.dss_analytics (metric_name, metric_value, metric_date) VALUES
('scheme_recommendations_generated', 156, CURRENT_DATE - INTERVAL '30 days'),
('eligible_beneficiaries_identified', 89, CURRENT_DATE - INTERVAL '25 days'),
('scheme_applications_submitted', 67, CURRENT_DATE - INTERVAL '20 days'),
('community_feedback_received', 23, CURRENT_DATE - INTERVAL '15 days'),
('asset_verifications_completed', 45, CURRENT_DATE - INTERVAL '10 days'),
('schemes_successfully_implemented', 34, CURRENT_DATE - INTERVAL '5 days'),
('average_confidence_score', 0.91, CURRENT_DATE),
('forest_cover_improvement', 12.5, CURRENT_DATE),
('livelihood_improvement_percentage', 23.8, CURRENT_DATE),
('water_access_improvement', 18.2, CURRENT_DATE);

-- Create materialized view for DSS dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.dss_dashboard_summary AS
SELECT 
    COUNT(DISTINCT p.id) as total_pattas,
    COUNT(DISTINCT CASE WHEN p.status = 'approved' THEN p.id END) as approved_pattas,
    COUNT(DISTINCT s.id) as total_schemes,
    COUNT(DISTINCT sr.id) as total_recommendations,
    COUNT(DISTINCT CASE WHEN sr.status = 'accepted' THEN sr.id END) as accepted_recommendations,
    AVG(sr.confidence_score) as avg_confidence_score,
    COUNT(DISTINCT cf.id) as total_feedback,
    COUNT(DISTINCT a.id) as total_assets,
    SUM(p.land_area) as total_land_area,
    COUNT(DISTINCT p.state) as states_covered,
    COUNT(DISTINCT p.tribal_group) as tribal_groups_covered
FROM public.pattas p
LEFT JOIN public.scheme_recommendations sr ON p.id = sr.patta_id
LEFT JOIN public.schemes s ON sr.scheme_id = s.id
LEFT JOIN public.community_feedback cf ON p.id = cf.patta_id
LEFT JOIN public.assets a ON p.id = a.patta_id;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW public.dss_dashboard_summary;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheme_recommendations_patta ON public.scheme_recommendations (patta_id);
CREATE INDEX IF NOT EXISTS idx_scheme_recommendations_scheme ON public.scheme_recommendations (scheme_id);
CREATE INDEX IF NOT EXISTS idx_scheme_recommendations_status ON public.scheme_recommendations (status);
CREATE INDEX IF NOT EXISTS idx_community_feedback_verified ON public.community_feedback (verified);
CREATE INDEX IF NOT EXISTS idx_pattas_status ON public.pattas (status);
CREATE INDEX IF NOT EXISTS idx_pattas_tribal_group ON public.pattas (tribal_group);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets (asset_type);

-- Add RLS policies for new table
ALTER TABLE public.dss_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view DSS analytics" 
ON public.dss_analytics FOR SELECT 
USING (true);

COMMENT ON TABLE public.dss_analytics IS 'Analytics data for Decision Support System performance tracking';
COMMENT ON MATERIALIZED VIEW public.dss_dashboard_summary IS 'Summary statistics for DSS dashboard display';

-- Final summary
SELECT 
    'Data insertion completed successfully' as status,
    COUNT(*) as total_pattas_count
FROM public.pattas;
