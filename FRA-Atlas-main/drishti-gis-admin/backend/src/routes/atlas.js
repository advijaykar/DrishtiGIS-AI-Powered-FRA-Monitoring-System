import express from 'express';
import { Pool } from 'pg';
import { query, validationResult } from 'express-validator';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/drishti'
});

// GET /api/atlas/layers - Get all map layers as GeoJSON
router.get('/layers', async (req, res) => {
  try {
    const claimType = req.query.claim_type;
    const status = req.query.status;
    const state = req.query.state;

    // Build where clause for claims filtering
    let claimsWhere = 'WHERE 1=1';
    const claimsParams = [];
    let paramCount = 0;

    if (claimType) {
      claimsWhere += ` AND c.claim_type = $${++paramCount}`;
      claimsParams.push(claimType);
    }

    if (status) {
      claimsWhere += ` AND c.status = $${++paramCount}`;
      claimsParams.push(status);
    }

    if (state) {
      claimsWhere += ` AND s.name = $${++paramCount}`;
      claimsParams.push(state);
    }

    // Villages GeoJSON
    const villagesQuery = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', v.id,
            'properties', jsonb_build_object(
              'id', v.id,
              'name', v.name,
              'code', v.code,
              'population', v.population,
              'tribal_population', v.tribal_population,
              'area_hectares', v.area_hectares,
              'district_name', d.name,
              'state_name', s.name,
              'state_code', s.code
            ),
            'geometry', ST_AsGeoJSON(COALESCE(v.boundary_geom, v.centroid))::jsonb
          )
        )
      ) as geojson
      FROM villages v
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      WHERE v.boundary_geom IS NOT NULL OR v.centroid IS NOT NULL
    `;

    // Claims GeoJSON with filtering
    const claimsQuery = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', c.id,
            'properties', jsonb_build_object(
              'id', c.id,
              'claim_id', c.claim_id,
              'claimant_name', c.claimant_name,
              'claim_type', c.claim_type,
              'status', c.status,
              'area_hectares', c.area_hectares,
              'submission_date', c.submission_date,
              'approval_date', c.approval_date,
              'village_name', v.name,
              'district_name', d.name,
              'state_name', s.name,
              'state_code', s.code,
              'created_at', c.created_at
            ),
            'geometry', ST_AsGeoJSON(c.geom)::jsonb
          )
        )
      ) as geojson
      FROM claims c
      LEFT JOIN villages v ON c.village_id = v.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      ${claimsWhere}
      AND c.geom IS NOT NULL
    `;

    // Execute both queries
    const [villagesResult, claimsResult] = await Promise.all([
      pool.query(villagesQuery),
      pool.query(claimsQuery, claimsParams)
    ]);

    res.json({
      villages: villagesResult.rows[0].geojson || { type: 'FeatureCollection', features: [] },
      claims: claimsResult.rows[0].geojson || { type: 'FeatureCollection', features: [] }
    });

  } catch (error) {
    console.error('Error fetching atlas layers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/atlas/states - Get states with boundaries
router.get('/states', async (req, res) => {
  try {
    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', s.id,
            'properties', jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'code', s.code,
              'districts_count', (SELECT COUNT(*) FROM districts WHERE state_id = s.id),
              'villages_count', (SELECT COUNT(*) FROM villages v 
                                JOIN districts d ON v.district_id = d.id 
                                WHERE d.state_id = s.id),
              'claims_count', (SELECT COUNT(*) FROM claims c
                              JOIN villages v ON c.village_id = v.id
                              JOIN districts d ON v.district_id = d.id
                              WHERE d.state_id = s.id)
            ),
            'geometry', ST_AsGeoJSON(s.boundary_geom)::jsonb
          )
        )
      ) as geojson
      FROM states s
      WHERE s.boundary_geom IS NOT NULL
    `;

    const result = await pool.query(query);
    res.json(result.rows[0].geojson || { type: 'FeatureCollection', features: [] });

  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/atlas/districts - Get districts with boundaries
router.get('/districts', [
  query('state_id').optional().isInt().withMessage('State ID must be an integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let whereClause = 'WHERE d.boundary_geom IS NOT NULL';
    const params = [];
    let paramCount = 0;

    if (req.query.state_id) {
      whereClause += ` AND d.state_id = $${++paramCount}`;
      params.push(req.query.state_id);
    }

    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', d.id,
            'properties', jsonb_build_object(
              'id', d.id,
              'name', d.name,
              'code', d.code,
              'state_id', d.state_id,
              'state_name', s.name,
              'state_code', s.code,
              'villages_count', (SELECT COUNT(*) FROM villages WHERE district_id = d.id),
              'claims_count', (SELECT COUNT(*) FROM claims c
                              JOIN villages v ON c.village_id = v.id
                              WHERE v.district_id = d.id)
            ),
            'geometry', ST_AsGeoJSON(d.boundary_geom)::jsonb
          )
        )
      ) as geojson
      FROM districts d
      LEFT JOIN states s ON d.state_id = s.id
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0].geojson || { type: 'FeatureCollection', features: [] });

  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/atlas/villages - Get villages with boundaries
router.get('/villages', [
  query('district_id').optional().isInt().withMessage('District ID must be an integer'),
  query('state_id').optional().isInt().withMessage('State ID must be an integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let whereClause = 'WHERE (v.boundary_geom IS NOT NULL OR v.centroid IS NOT NULL)';
    const params = [];
    let paramCount = 0;

    if (req.query.district_id) {
      whereClause += ` AND v.district_id = $${++paramCount}`;
      params.push(req.query.district_id);
    }

    if (req.query.state_id) {
      whereClause += ` AND s.id = $${++paramCount}`;
      params.push(req.query.state_id);
    }

    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', v.id,
            'properties', jsonb_build_object(
              'id', v.id,
              'name', v.name,
              'code', v.code,
              'population', v.population,
              'tribal_population', v.tribal_population,
              'area_hectares', v.area_hectares,
              'district_id', v.district_id,
              'district_name', d.name,
              'state_id', s.id,
              'state_name', s.name,
              'state_code', s.code,
              'claims_count', (SELECT COUNT(*) FROM claims WHERE village_id = v.id),
              'approved_claims', (SELECT COUNT(*) FROM claims 
                                WHERE village_id = v.id AND status = 'APPROVED'),
              'pending_claims', (SELECT COUNT(*) FROM claims 
                               WHERE village_id = v.id AND status = 'PENDING')
            ),
            'geometry', ST_AsGeoJSON(COALESCE(v.boundary_geom, v.centroid))::jsonb
          )
        )
      ) as geojson
      FROM villages v
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0].geojson || { type: 'FeatureCollection', features: [] });

  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/atlas/claims - Get claims as GeoJSON with filtering
router.get('/claims', [
  query('claim_type').optional().isIn(['IFR', 'CR', 'CFR']).withMessage('Invalid claim type'),
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'DOCUMENTATION_REQUIRED']),
  query('state_id').optional().isInt().withMessage('State ID must be an integer'),
  query('district_id').optional().isInt().withMessage('District ID must be an integer'),
  query('village_id').optional().isInt().withMessage('Village ID must be an integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let whereClause = 'WHERE c.geom IS NOT NULL';
    const params = [];
    let paramCount = 0;

    if (req.query.claim_type) {
      whereClause += ` AND c.claim_type = $${++paramCount}`;
      params.push(req.query.claim_type);
    }

    if (req.query.status) {
      whereClause += ` AND c.status = $${++paramCount}`;
      params.push(req.query.status);
    }

    if (req.query.village_id) {
      whereClause += ` AND c.village_id = $${++paramCount}`;
      params.push(req.query.village_id);
    }

    if (req.query.district_id) {
      whereClause += ` AND d.id = $${++paramCount}`;
      params.push(req.query.district_id);
    }

    if (req.query.state_id) {
      whereClause += ` AND s.id = $${++paramCount}`;
      params.push(req.query.state_id);
    }

    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', c.id,
            'properties', jsonb_build_object(
              'id', c.id,
              'claim_id', c.claim_id,
              'claimant_name', c.claimant_name,
              'claim_type', c.claim_type,
              'status', c.status,
              'area_hectares', c.area_hectares,
              'submission_date', c.submission_date,
              'approval_date', c.approval_date,
              'surveyor_name', c.surveyor_name,
              'survey_date', c.survey_date,
              'village_id', c.village_id,
              'village_name', v.name,
              'district_name', d.name,
              'state_name', s.name,
              'state_code', s.code,
              'created_at', c.created_at,
              'updated_at', c.updated_at
            ),
            'geometry', ST_AsGeoJSON(c.geom)::jsonb
          )
        )
      ) as geojson
      FROM claims c
      LEFT JOIN villages v ON c.village_id = v.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0].geojson || { type: 'FeatureCollection', features: [] });

  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/atlas/heatmap - Get claim density heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const claimType = req.query.claim_type;
    const status = req.query.status || 'PENDING';

    let whereClause = 'WHERE c.geom IS NOT NULL';
    const params = [];
    let paramCount = 0;

    if (claimType) {
      whereClause += ` AND c.claim_type = $${++paramCount}`;
      params.push(claimType);
    }

    if (status) {
      whereClause += ` AND c.status = $${++paramCount}`;
      params.push(status);
    }

    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'properties', jsonb_build_object(
              'village_id', v.id,
              'village_name', v.name,
              'district_name', d.name,
              'state_name', s.name,
              'claim_count', claim_counts.count,
              'intensity', LEAST(claim_counts.count / 10.0, 1.0)
            ),
            'geometry', ST_AsGeoJSON(COALESCE(v.centroid, ST_Centroid(v.boundary_geom)))::jsonb
          )
        )
      ) as geojson
      FROM (
        SELECT 
          c.village_id,
          COUNT(*) as count
        FROM claims c
        ${whereClause}
        GROUP BY c.village_id
        HAVING COUNT(*) > 0
      ) claim_counts
      JOIN villages v ON claim_counts.village_id = v.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      WHERE v.centroid IS NOT NULL OR v.boundary_geom IS NOT NULL
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0].geojson || { type: 'FeatureCollection', features: [] });

  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/atlas/bounds - Get bounding box for specific area
router.get('/bounds', [
  query('type').isIn(['state', 'district', 'village']).withMessage('Type must be state, district, or village'),
  query('id').isInt().withMessage('ID must be an integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, id } = req.query;

    let table, geomColumn;
    switch (type) {
      case 'state':
        table = 'states';
        geomColumn = 'boundary_geom';
        break;
      case 'district':
        table = 'districts';
        geomColumn = 'boundary_geom';
        break;
      case 'village':
        table = 'villages';
        geomColumn = 'COALESCE(boundary_geom, centroid)';
        break;
    }

    const query = `
      SELECT 
        ST_XMin(bbox) as min_lng,
        ST_YMin(bbox) as min_lat,
        ST_XMax(bbox) as max_lng,
        ST_YMax(bbox) as max_lat
      FROM (
        SELECT ST_Extent(${geomColumn}) as bbox
        FROM ${table}
        WHERE id = $1
      ) bounds
    `;

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0 || !result.rows[0].min_lng) {
      return res.status(404).json({ error: 'No geometry found for the specified area' });
    }

    const bounds = result.rows[0];
    res.json({
      southwest: [bounds.min_lat, bounds.min_lng],
      northeast: [bounds.max_lat, bounds.max_lng],
      center: [
        (bounds.min_lat + bounds.max_lat) / 2,
        (bounds.min_lng + bounds.max_lng) / 2
      ]
    });

  } catch (error) {
    console.error('Error fetching bounds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/atlas/statistics - Get spatial statistics
router.get('/statistics', async (req, res) => {
  try {
    const query = `
      SELECT 
        -- Claims by type and status
        json_build_object(
          'IFR', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM claims WHERE claim_type = 'IFR'),
            'approved', (SELECT COUNT(*) FROM claims WHERE claim_type = 'IFR' AND status = 'APPROVED'),
            'pending', (SELECT COUNT(*) FROM claims WHERE claim_type = 'IFR' AND status = 'PENDING'),
            'rejected', (SELECT COUNT(*) FROM claims WHERE claim_type = 'IFR' AND status = 'REJECTED')
          ),
          'CR', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CR'),
            'approved', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CR' AND status = 'APPROVED'),
            'pending', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CR' AND status = 'PENDING'),
            'rejected', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CR' AND status = 'REJECTED')
          ),
          'CFR', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CFR'),
            'approved', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CFR' AND status = 'APPROVED'),
            'pending', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CFR' AND status = 'PENDING'),
            'rejected', (SELECT COUNT(*) FROM claims WHERE claim_type = 'CFR' AND status = 'REJECTED')
          )
        ) as claims_by_type,
        
        -- Area statistics
        json_build_object(
          'total_area', COALESCE(SUM(c.area_hectares), 0),
          'approved_area', COALESCE(SUM(c.area_hectares) FILTER (WHERE c.status = 'APPROVED'), 0),
          'pending_area', COALESCE(SUM(c.area_hectares) FILTER (WHERE c.status = 'PENDING'), 0),
          'average_claim_size', COALESCE(AVG(c.area_hectares), 0)
        ) as area_statistics,
        
        -- Geographic coverage
        json_build_object(
          'states_covered', (SELECT COUNT(*) FROM states),
          'districts_covered', (SELECT COUNT(*) FROM districts),
          'villages_with_claims', (SELECT COUNT(DISTINCT village_id) FROM claims WHERE village_id IS NOT NULL),
          'total_villages', (SELECT COUNT(*) FROM villages)
        ) as geographic_coverage
        
      FROM claims c
    `;

    const result = await pool.query(query);
    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching atlas statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
