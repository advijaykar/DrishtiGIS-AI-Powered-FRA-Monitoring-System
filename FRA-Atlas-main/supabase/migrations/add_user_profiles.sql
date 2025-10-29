-- ========================================
-- User Profiles for DSS Testing
-- ========================================

-- Create sample user profiles for different roles
-- Note: These are sample profiles for demonstration purposes
-- In production, these would be created when users register through auth

-- Admin profiles
INSERT INTO public.profiles (full_name, role, phone, state, district) VALUES
('Dr. Rajesh Kumar', 'admin', '+911234567890', 'Odisha', 'Koraput'),
('Priya Sharma', 'admin', '+911234567891', 'Chhattisgarh', 'Bilaspur');

-- Officer profiles  
INSERT INTO public.profiles (full_name, role, phone, state, district) VALUES
('Ravi Patel', 'officer', '+911234567892', 'West Bengal', 'Alipurduar'),
('Sunita Devi', 'officer', '+911234567893', 'Jharkhand', 'West Singhbhum'),
('Manoj Oraon', 'officer', '+911234567894', 'Chhattisgarh', 'Sarguja'),
('Kavita Meena', 'officer', '+911234567895', 'Rajasthan', 'Baran'),
('Prakash Bodo', 'officer', '+911234567896', 'Assam', 'Kokrajhar');

-- Regular user profiles
INSERT INTO public.profiles (full_name, role, phone, state, district) VALUES
('Amit Majhi', 'user', '+911234567897', 'Odisha', 'Koraput'),
('Geeta Baiga', 'user', '+911234567898', 'Chhattisgarh', 'Chhindwara'),
('Ramesh Santhal', 'user', '+911234567899', 'Jharkhand', 'Dumka'),
('Lata Bhil', 'user', '+911234567800', 'Maharashtra', 'Nandurbar');

-- Add additional realistic scheme data for better DSS recommendations
INSERT INTO public.schemes (name, description, eligibility_criteria, benefits, department, is_active) VALUES
('Tribal Sub Plan (TSP)', 'Special Component Plan for Tribal Areas', 
 '{"tribal_community": true, "scheduled_area": true, "development_project": "required"}', 
 'Infrastructure development, livelihood enhancement in tribal areas', 'Ministry of Tribal Affairs', true),

('Eklavya Model Residential Schools', 'Quality Education for Tribal Children', 
 '{"tribal_students": true, "age_group": "6-18", "residential_facility": "required"}', 
 'Quality education, hostel facilities, skill development', 'Ministry of Tribal Affairs', true),

('PM-JANMAN', 'Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan', 
 '{"pvtg_community": true, "remote_area": true, "basic_facilities": "lacking"}', 
 'Comprehensive development for Particularly Vulnerable Tribal Groups', 'Ministry of Tribal Affairs', true),

('Stand Up India', 'Entrepreneurship Support for SC/ST', 
 '{"sc_st_category": true, "age": "18-65", "business_plan": "required", "loan_amount": "10L-1Cr"}', 
 'Bank loans for greenfield enterprises', 'Financial Services', true),

('National Bamboo Mission', 'Bamboo Development Programme', 
 '{"bamboo_cultivation": "feasible", "land_available": true, "farmer_interest": true}', 
 'Bamboo plantation, processing, marketing support', 'Agriculture & Farmers Welfare', true),

('Rashtriya Gokul Mission', 'Indigenous Cattle Breed Development', 
 '{"cattle_rearing": true, "indigenous_breeds": "preferred", "land_for_grazing": "available"}', 
 'Breeding stock, artificial insemination, feed supplements', 'Animal Husbandry', true);

-- Add more detailed scheme recommendations based on tribal communities and land use patterns
INSERT INTO public.scheme_recommendations (patta_id, scheme_id, recommendation_reason, confidence_score, status) VALUES
-- Van Dhan recommendations for forest-rich communities
((SELECT id FROM public.pattas WHERE holder_name = 'Phoolmati Gond'), 
 (SELECT id FROM public.schemes WHERE name = 'Van Dhan Vikas'), 
 'Large community forest holding (12.3 ha) with Gond tribal knowledge of forest produce value addition', 0.97, 'pending'),

-- Bamboo mission for suitable areas
((SELECT id FROM public.pattas WHERE holder_name = 'Savita Warli'), 
 (SELECT id FROM public.schemes WHERE name = 'National Bamboo Mission'), 
 'Warli community area suitable for bamboo cultivation, existing traditional bamboo usage', 0.93, 'pending'),

-- JANMAN for particularly vulnerable groups
((SELECT id FROM public.pattas WHERE holder_name = 'Ramesh Korwa'), 
 (SELECT id FROM public.schemes WHERE name = 'PM-JANMAN'), 
 'Korwa community classified as PVTG, requires comprehensive development support', 0.98, 'accepted'),

-- Tribal Sub Plan for community development
((SELECT id FROM public.pattas WHERE holder_name = 'Community Group A'), 
 (SELECT id FROM public.schemes WHERE name = 'Tribal Sub Plan (TSP)'), 
 'Community forest holding in scheduled area, suitable for infrastructure development', 0.92, 'pending'),

-- Cattle development in suitable areas
((SELECT id FROM public.pattas WHERE holder_name = 'Kaluram Meena'), 
 (SELECT id FROM public.schemes WHERE name = 'Rashtriya Gokul Mission'), 
 'Large landholding (5.8 ha) in Rajasthan suitable for cattle rearing, traditional Meena practices', 0.86, 'pending'),

-- Credit support for medium farmers
((SELECT id FROM public.pattas WHERE holder_name = 'Sushila Ho'), 
 (SELECT id FROM public.schemes WHERE name = 'Kisan Credit Card'), 
 'Medium landholder (4.2 ha) with pond, suitable for diversified agriculture needing credit', 0.90, 'pending');

-- Add more community feedback showcasing diverse situations
INSERT INTO public.community_feedback (patta_id, feedback_type, content, photo_url, coordinates, submitted_by_phone, verified) VALUES
((SELECT id FROM public.pattas WHERE holder_name = 'Phoolmati Gond'), 'status_update', 
 'SHG formed for mahua processing. 15 women members enrolled. Need Van Dhan training support.', 
 'https://example.com/shg_meeting.jpg', POINT(81.9123, 22.7890), '+919876543216', true),

((SELECT id FROM public.pattas WHERE holder_name = 'Kaluram Meena'), 'asset_verification', 
 'Solar pump installed through government scheme. Irrigation area increased by 2 hectares.', 
 'https://example.com/solar_pump.jpg', POINT(76.5123, 25.1012), '+919876543217', true),

((SELECT id FROM public.pattas WHERE holder_name = 'Savita Warli'), 'photo_upload', 
 'Traditional Warli art training center established. Generating income for 20 women artisans.', 
 'https://example.com/warli_art.jpg', POINT(72.7234, 19.9678), '+919876543218', true),

((SELECT id FROM public.pattas WHERE holder_name = 'Purnima Rabha'), 'asset_verification', 
 'Kitchen garden flourishing with organic vegetables. Reduced household expenses by Rs 2000/month.', 
 'https://example.com/kitchen_garden.jpg', POINT(90.6182, 26.1662), '+919876543219', false),

((SELECT id FROM public.pattas WHERE holder_name = 'Geeta Saharia'), 'status_update', 
 'Drought-resistant millet varieties showing good results. Seed multiplication program started.', 
 NULL, POINT(74.8234, 25.6234), '+919876543220', true);

-- Add more assets to demonstrate AI detection capabilities
INSERT INTO public.assets (patta_id, asset_type, coordinates, area, confidence_score, detected_at, verified_by_user) VALUES
-- Additional assets for Kaluram Meena (large farm)
((SELECT id FROM public.pattas WHERE holder_name = 'Kaluram Meena'), 'farmland', POINT(76.5133, 25.1022), 3.2, 0.95, now() - interval '3 days', true),
((SELECT id FROM public.pattas WHERE holder_name = 'Kaluram Meena'), 'farmland', POINT(76.5143, 25.1032), 2.4, 0.93, now() - interval '3 days', false),
((SELECT id FROM public.pattas WHERE holder_name = 'Kaluram Meena'), 'water_body', POINT(76.5153, 25.1042), 0.2, 0.88, now() - interval '3 days', true),

-- Phoolmati Gond community assets
((SELECT id FROM public.pattas WHERE holder_name = 'Phoolmati Gond'), 'forest', POINT(81.9133, 22.7900), 8.5, 0.96, now() - interval '12 days', true),
((SELECT id FROM public.pattas WHERE holder_name = 'Phoolmati Gond'), 'water_body', POINT(81.9143, 22.7910), 2.1, 0.91, now() - interval '12 days', false),
((SELECT id FROM public.pattas WHERE holder_name = 'Phoolmati Gond'), 'farmland', POINT(81.9153, 22.7920), 1.5, 0.89, now() - interval '12 days', true),

-- Savita Warli community assets  
((SELECT id FROM public.pattas WHERE holder_name = 'Savita Warli'), 'forest', POINT(72.7244, 19.9688), 4.8, 0.94, now() - interval '7 days', true),
((SELECT id FROM public.pattas WHERE holder_name = 'Savita Warli'), 'farmland', POINT(72.7254, 19.9698), 1.6, 0.92, now() - interval '7 days', true),
((SELECT id FROM public.pattas WHERE holder_name = 'Savita Warli'), 'homestead', POINT(72.7264, 19.9708), 0.3, 0.97, now() - interval '7 days', true);

-- Update analytics with additional metrics
INSERT INTO public.dss_analytics (metric_name, metric_value, metric_date) VALUES
('tribal_groups_covered', 15, CURRENT_DATE),
('states_with_active_pattas', 7, CURRENT_DATE),
('community_pattas_percentage', 25.5, CURRENT_DATE),
('average_land_area_per_patta', 3.2, CURRENT_DATE),
('asset_verification_rate', 67.8, CURRENT_DATE),
('scheme_acceptance_rate', 73.2, CURRENT_DATE),
('community_feedback_response_rate', 45.6, CURRENT_DATE),
('van_dhan_eligible_communities', 8, CURRENT_DATE),
('water_body_pattas_count', 6, CURRENT_DATE),
('forest_cover_per_patta_avg', 2.8, CURRENT_DATE);

-- Create a view for scheme eligibility analysis
CREATE OR REPLACE VIEW public.scheme_eligibility_analysis AS
SELECT 
    p.holder_name,
    p.village,
    p.district,
    p.state,
    p.tribal_group,
    p.land_area,
    p.claim_type,
    COUNT(DISTINCT a.id) as total_assets,
    COUNT(DISTINCT CASE WHEN a.asset_type = 'forest' THEN a.id END) as forest_assets,
    COUNT(DISTINCT CASE WHEN a.asset_type = 'water_body' OR a.asset_type = 'pond' THEN a.id END) as water_assets,
    COUNT(DISTINCT CASE WHEN a.asset_type = 'farmland' THEN a.id END) as farm_assets,
    COUNT(DISTINCT sr.id) as total_recommendations,
    COUNT(DISTINCT CASE WHEN sr.status = 'accepted' THEN sr.id END) as accepted_recommendations,
    AVG(sr.confidence_score) as avg_recommendation_score,
    COUNT(DISTINCT cf.id) as community_feedback_count
FROM public.pattas p
LEFT JOIN public.assets a ON p.id = a.patta_id
LEFT JOIN public.scheme_recommendations sr ON p.id = sr.patta_id  
LEFT JOIN public.community_feedback cf ON p.id = cf.patta_id
WHERE p.status = 'approved'
GROUP BY p.id, p.holder_name, p.village, p.district, p.state, p.tribal_group, p.land_area, p.claim_type
ORDER BY p.holder_name;

-- Grant appropriate permissions for the view
GRANT SELECT ON public.scheme_eligibility_analysis TO authenticated;

-- Refresh the materialized view to include new data
REFRESH MATERIALIZED VIEW public.dss_dashboard_summary;

-- Create indexes for the new data
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_state_district ON public.profiles (state, district);
CREATE INDEX IF NOT EXISTS idx_dss_analytics_metric_date ON public.dss_analytics (metric_date);
CREATE INDEX IF NOT EXISTS idx_dss_analytics_metric_name ON public.dss_analytics (metric_name);

-- Add comments for documentation
COMMENT ON VIEW public.scheme_eligibility_analysis IS 'Comprehensive view for analyzing scheme eligibility patterns across different tribal communities and land types';

-- Final data summary
SELECT 
    'Enhanced DSS data added successfully' as status,
    (SELECT COUNT(*) FROM public.pattas) as total_pattas,
    (SELECT COUNT(*) FROM public.schemes) as total_schemes,
    (SELECT COUNT(*) FROM public.scheme_recommendations) as total_recommendations,
    (SELECT COUNT(*) FROM public.community_feedback) as total_feedback,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles;
