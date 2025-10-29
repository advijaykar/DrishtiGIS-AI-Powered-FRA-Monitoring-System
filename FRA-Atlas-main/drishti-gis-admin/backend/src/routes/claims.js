import express from 'express';
import multer from 'multer';
import { Pool } from 'pg';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/drishti'
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads/claims';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf format allowed!'));
    }
  }
});

// Helper function to validate claim data
const validateClaimData = (data) => {
  const errors = [];
  
  if (!data.claimant_name || data.claimant_name.trim().length < 2) {
    errors.push('Claimant name must be at least 2 characters long');
  }
  
  if (!['IFR', 'CR', 'CFR'].includes(data.claim_type)) {
    errors.push('Claim type must be IFR, CR, or CFR');
  }
  
  if (data.area_hectares && (isNaN(data.area_hectares) || data.area_hectares <= 0)) {
    errors.push('Area must be a positive number');
  }
  
  return errors;
};

// GET /api/claims - Get all claims with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'DOCUMENTATION_REQUIRED']),
  query('claim_type').optional().isIn(['IFR', 'CR', 'CFR']),
  query('state').optional().isLength({ min: 1 }).withMessage('State cannot be empty'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add filters
    if (req.query.status) {
      whereClause += ` AND c.status = $${++paramCount}`;
      params.push(req.query.status);
    }
    
    if (req.query.claim_type) {
      whereClause += ` AND c.claim_type = $${++paramCount}`;
      params.push(req.query.claim_type);
    }
    
    if (req.query.state) {
      whereClause += ` AND s.name = $${++paramCount}`;
      params.push(req.query.state);
    }

    if (req.query.village_id) {
      whereClause += ` AND c.village_id = $${++paramCount}`;
      params.push(req.query.village_id);
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM claims c
      LEFT JOIN villages v ON c.village_id = v.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      ${whereClause}
    `;
    
    // Data query
    const dataQuery = `
      SELECT 
        c.id,
        c.claim_id,
        c.claimant_name,
        c.claim_type,
        c.status,
        c.area_hectares,
        c.submission_date,
        c.approval_date,
        c.rejection_reason,
        c.created_at,
        c.updated_at,
        v.name as village_name,
        d.name as district_name,
        s.name as state_name,
        s.code as state_code,
        ST_AsGeoJSON(c.geom) as geometry
      FROM claims c
      LEFT JOIN villages v ON c.village_id = v.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, -2)),
      pool.query(dataQuery, params)
    ]);

    const totalRecords = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      data: dataResult.rows.map(row => ({
        ...row,
        geometry: row.geometry ? JSON.parse(row.geometry) : null
      })),
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/claims/search - Search claims
router.get('/search', [
  query('q').notEmpty().withMessage('Query parameter is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const searchQuery = req.query.q;
    const limit = parseInt(req.query.limit) || 50;

    const query = `
      SELECT 
        c.id,
        c.claim_id,
        c.claimant_name,
        c.claim_type,
        c.status,
        c.area_hectares,
        c.submission_date,
        c.approval_date,
        c.created_at,
        v.name as village_name,
        d.name as district_name,
        s.name as state_name
      FROM claims c
      LEFT JOIN villages v ON c.village_id = v.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      WHERE 
        c.claim_id ILIKE $1 
        OR c.claimant_name ILIKE $1
        OR v.name ILIKE $1
      ORDER BY 
        CASE 
          WHEN c.claim_id ILIKE $1 THEN 1
          WHEN c.claimant_name ILIKE $1 THEN 2
          ELSE 3
        END,
        c.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [`%${searchQuery}%`, limit]);
    res.json(result.rows);

  } catch (error) {
    console.error('Error searching claims:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/claims/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        total_claims,
        approved_claims,
        pending_claims,
        rejected_claims,
        under_review_claims,
        total_area,
        villages_covered,
        states_count,
        districts_count
      FROM dashboard_stats
    `;

    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      // Fallback if materialized view is empty
      const fallbackQuery = `
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
        FROM claims
      `;
      
      const fallbackResult = await pool.query(fallbackQuery);
      return res.json(fallbackResult.rows[0]);
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/claims/upload - Upload and process claim documents
router.post('/upload', upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const processedFiles = [];
    
    for (const file of req.files) {
      // Process images
      if (file.mimetype.startsWith('image/')) {
        const processedPath = file.path.replace(path.extname(file.path), '_processed.jpg');
        
        await sharp(file.path)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(processedPath);
        
        processedFiles.push({
          original: file.filename,
          processed: path.basename(processedPath),
          mimetype: 'image/jpeg',
          size: file.size
        });
      } else {
        processedFiles.push({
          original: file.filename,
          mimetype: file.mimetype,
          size: file.size
        });
      }
    }

    // Call OCR service for document processing
    let ocrResult = null;
    try {
      const ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://localhost:8000';
      const formData = new FormData();
      
      // Send the first document for OCR processing
      if (req.files[0]) {
        const fileBuffer = await fs.readFile(req.files[0].path);
        formData.append('file', new Blob([fileBuffer]), req.files[0].originalname);
      }
      
      const ocrResponse = await axios.post(`${ocrServiceUrl}/ocr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });
      
      ocrResult = ocrResponse.data;
    } catch (ocrError) {
      console.warn('OCR processing failed:', ocrError.message);
      // Continue without OCR data
    }

    res.json({
      success: true,
      files: processedFiles,
      ocrData: ocrResult,
      message: `Successfully processed ${processedFiles.length} file(s)`
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// POST /api/claims - Create new claim
router.post('/', [
  body('claimant_name').notEmpty().trim().isLength({ min: 2 }).withMessage('Claimant name is required'),
  body('claim_type').isIn(['IFR', 'CR', 'CFR']).withMessage('Invalid claim type'),
  body('village_id').optional().isInt().withMessage('Village ID must be an integer'),
  body('area_hectares').optional().isFloat({ min: 0 }).withMessage('Area must be positive'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      claimant_name, 
      claim_type, 
      village_id, 
      area_hectares, 
      surveyor_name,
      survey_date,
      documents,
      geometry 
    } = req.body;

    // Generate claim ID
    const claimIdQuery = `
      SELECT COALESCE(s.code, 'XX') || '-' || COALESCE(d.code, 'XXX') || '-' || 
             LPAD((SELECT COUNT(*) + 1 FROM claims c2 
                   JOIN villages v2 ON c2.village_id = v2.id 
                   JOIN districts d2 ON v2.district_id = d2.id 
                   WHERE d2.id = d.id)::text, 3, '0') || '-' || 
             EXTRACT(YEAR FROM CURRENT_DATE) as claim_id
      FROM villages v
      JOIN districts d ON v.district_id = d.id
      JOIN states s ON d.state_id = s.id
      WHERE v.id = $1
    `;

    let claimId = `TEMP-${Date.now()}`;
    if (village_id) {
      const idResult = await pool.query(claimIdQuery, [village_id]);
      if (idResult.rows.length > 0) {
        claimId = idResult.rows[0].claim_id;
      }
    }

    const insertQuery = `
      INSERT INTO claims (
        claim_id, claimant_name, claim_type, village_id, 
        area_hectares, surveyor_name, survey_date, documents,
        geom
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFromGeoJSON($9))
      RETURNING *
    `;

    const values = [
      claimId,
      claimant_name,
      claim_type,
      village_id || null,
      area_hectares || null,
      surveyor_name || null,
      survey_date || null,
      documents ? JSON.stringify(documents) : null,
      geometry ? JSON.stringify(geometry) : null
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creating claim:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Claim ID already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/claims/:id - Update claim
router.put('/:id', [
  body('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'DOCUMENTATION_REQUIRED']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const claimId = req.params.id;
    const updateData = req.body;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (['claimant_name', 'claim_type', 'status', 'area_hectares', 'surveyor_name', 'survey_date', 'approval_date', 'rejection_reason'].includes(key)) {
        updateFields.push(`${key} = $${++paramCount}`);
        values.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(claimId);

    const updateQuery = `
      UPDATE claims 
      SET ${updateFields.join(', ')}
      WHERE claim_id = $${++paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/claims/:id - Get specific claim
router.get('/:id', async (req, res) => {
  try {
    const claimId = req.params.id;

    const query = `
      SELECT 
        c.*,
        v.name as village_name,
        d.name as district_name,
        s.name as state_name,
        s.code as state_code,
        ST_AsGeoJSON(c.geom) as geometry
      FROM claims c
      LEFT JOIN villages v ON c.village_id = v.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      WHERE c.claim_id = $1 OR c.id = $1
    `;

    const result = await pool.query(query, [claimId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = result.rows[0];
    claim.geometry = claim.geometry ? JSON.parse(claim.geometry) : null;
    claim.documents = claim.documents ? JSON.parse(claim.documents) : null;

    res.json(claim);

  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
