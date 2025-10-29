-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create states table
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    boundary_geom geometry(MULTIPOLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    boundary_geom geometry(MULTIPOLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state_id, name)
);

-- Create villages table
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    population INTEGER,
    tribal_population INTEGER,
    boundary_geom geometry(MULTIPOLYGON, 4326),
    centroid geometry(POINT, 4326),
    area_hectares DECIMAL(15, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, name)
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    claim_id VARCHAR(100) UNIQUE NOT NULL,
    claimant_name VARCHAR(200) NOT NULL,
    claim_type VARCHAR(10) NOT NULL CHECK (claim_type IN ('IFR', 'CR', 'CFR')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'DOCUMENTATION_REQUIRED')),
    village_id INTEGER REFERENCES villages(id) ON DELETE SET NULL,
    geom geometry(MULTIPOLYGON, 4326),
    area_hectares DECIMAL(15, 4),
    surveyor_name VARCHAR(200),
    survey_date DATE,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    approval_date DATE,
    rejection_reason TEXT,
    documents JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'state_officer', 'district_officer', 'operator', 'viewer')),
    state_id INTEGER REFERENCES states(id) ON DELETE SET NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create forest assets table
CREATE TABLE IF NOT EXISTS forest_assets (
    id SERIAL PRIMARY KEY,
    village_id INTEGER REFERENCES villages(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('water_body', 'grazing_land', 'agricultural_land', 'forest_patch', 'homestead')),
    name VARCHAR(200),
    geom geometry(GEOMETRY, 4326),
    area_hectares DECIMAL(15, 4),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create iot_devices table
CREATE TABLE IF NOT EXISTS iot_devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('soil_moisture', 'water_level', 'weather_station', 'air_quality')),
    village_id INTEGER REFERENCES villages(id) ON DELETE SET NULL,
    location geometry(POINT, 4326) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    installation_date DATE,
    last_maintenance DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_states_boundary ON states USING GIST (boundary_geom);
CREATE INDEX IF NOT EXISTS idx_districts_boundary ON districts USING GIST (boundary_geom);
CREATE INDEX IF NOT EXISTS idx_villages_boundary ON villages USING GIST (boundary_geom);
CREATE INDEX IF NOT EXISTS idx_villages_centroid ON villages USING GIST (centroid);
CREATE INDEX IF NOT EXISTS idx_claims_geom ON claims USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_forest_assets_geom ON forest_assets USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_iot_devices_location ON iot_devices USING GIST (location);

-- Create regular indexes
CREATE INDEX IF NOT EXISTS idx_claims_claim_id ON claims (claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);
CREATE INDEX IF NOT EXISTS idx_claims_claim_type ON claims (claim_type);
CREATE INDEX IF NOT EXISTS idx_claims_village_id ON claims (village_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON villages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forest_assets_updated_at BEFORE UPDATE ON forest_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_iot_devices_updated_at BEFORE UPDATE ON iot_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO states (name, code) VALUES 
    ('Chhattisgarh', 'CG'),
    ('Jharkhand', 'JH'),
    ('Odisha', 'OD'),
    ('Telangana', 'TS')
ON CONFLICT (name) DO NOTHING;

INSERT INTO districts (state_id, name, code) VALUES 
    (1, 'Kondagaon', 'CG-KDG'),
    (1, 'Kanker', 'CG-KNK'),
    (1, 'Bastar', 'CG-BST'),
    (2, 'Ranchi', 'JH-RNC'),
    (2, 'Gumla', 'JH-GML'),
    (3, 'Koraput', 'OD-KRP'),
    (3, 'Rayagada', 'OD-RYG'),
    (4, 'Adilabad', 'TS-ADB'),
    (4, 'Khammam', 'TS-KMM')
ON CONFLICT (state_id, name) DO NOTHING;

-- Insert sample villages
INSERT INTO villages (district_id, name, code, population, tribal_population, area_hectares) VALUES 
    (1, 'Bhelwa', 'CG-KDG-BHL', 2500, 2200, 1250.75),
    (1, 'Dhanora', 'CG-KDG-DHN', 1800, 1600, 890.25),
    (2, 'Kohka', 'CG-KNK-KHK', 3200, 2800, 1560.50),
    (4, 'Bundu', 'JH-RNC-BND', 4100, 3500, 2100.25),
    (6, 'Similiguda', 'OD-KRP-SML', 2900, 2700, 1450.00)
ON CONFLICT (district_id, name) DO NOTHING;

-- Insert sample claims
INSERT INTO claims (claim_id, claimant_name, claim_type, status, village_id, area_hectares, submission_date) VALUES 
    ('CG-KDG-001-2024', 'Ramesh Kumar', 'IFR', 'APPROVED', 1, 1.5, '2024-01-15'),
    ('CG-KDG-002-2024', 'Sita Devi', 'CR', 'PENDING', 1, 2.1, '2024-02-10'),
    ('CG-KDG-003-2024', 'Mohan Singh', 'CFR', 'UNDER_REVIEW', 2, 15.8, '2024-03-05'),
    ('CG-KNK-001-2024', 'Lakshmi Bai', 'IFR', 'APPROVED', 3, 1.2, '2024-01-28'),
    ('JH-RNC-001-2024', 'Suresh Oraon', 'IFR', 'PENDING', 4, 1.8, '2024-02-20'),
    ('OD-KRP-001-2024', 'Parvati Majhi', 'CR', 'APPROVED', 5, 3.2, '2024-01-10')
ON CONFLICT (claim_id) DO NOTHING;

-- Insert sample IoT devices
INSERT INTO iot_devices (device_id, device_type, village_id, location, installation_date) VALUES 
    ('DHT22-001', 'soil_moisture', 1, ST_SetSRID(ST_MakePoint(81.5235, 20.0321), 4326), '2024-01-01'),
    ('WL-001', 'water_level', 1, ST_SetSRID(ST_MakePoint(81.5198, 20.0356), 4326), '2024-01-15'),
    ('DHT22-002', 'soil_moisture', 3, ST_SetSRID(ST_MakePoint(81.2345, 20.1234), 4326), '2024-02-01'),
    ('WS-001', 'weather_station', 4, ST_SetSRID(ST_MakePoint(85.3094, 23.3441), 4326), '2024-01-20')
ON CONFLICT (device_id) DO NOTHING;

-- Create default admin user (password: admin123 - change in production!)
INSERT INTO users (username, email, password_hash, role) VALUES 
    ('admin', 'admin@drishti-gis.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW claim_summary AS
SELECT 
    c.id,
    c.claim_id,
    c.claimant_name,
    c.claim_type,
    c.status,
    c.area_hectares,
    c.submission_date,
    c.approval_date,
    v.name as village_name,
    d.name as district_name,
    s.name as state_name,
    s.code as state_code
FROM claims c
LEFT JOIN villages v ON c.village_id = v.id
LEFT JOIN districts d ON v.district_id = d.id  
LEFT JOIN states s ON d.state_id = s.id;

-- Create materialized view for dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    COUNT(*) as total_claims,
    COUNT(*) FILTER (WHERE status = 'APPROVED') as approved_claims,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_claims,
    COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected_claims,
    COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW') as under_review_claims,
    COALESCE(SUM(area_hectares), 0) as total_area,
    COUNT(DISTINCT village_id) as villages_covered,
    (SELECT COUNT(*) FROM states) as states_count,
    (SELECT COUNT(*) FROM districts) as districts_count
FROM claims;

-- Create function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your deployment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO drishti_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO drishti_app;

-- Initial refresh of materialized view
SELECT refresh_dashboard_stats();
