import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import winston from 'winston';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';

// Import routes
import claimsRoutes from './routes/claims.js';
import atlasRoutes from './routes/atlas.js';
import dssRoutes from './routes/dss.js';
import iotRoutes from './routes/iot.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import exportRoutes from './routes/export.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'drishti-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Redis client for rate limiting
let redisClient;
let rateLimiter;

try {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  redisClient.on('error', (err) => logger.error('Redis Client Error', err));
  await redisClient.connect();
  
  rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'drishti_rl',
    points: 100, // Number of requests
    duration: 900, // Per 15 minutes
  });
  
  logger.info('Redis connected successfully');
} catch (err) {
  logger.warn('Redis connection failed, continuing without rate limiting', err);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://drishti-gis.gov.in', 'https://admin.drishti-gis.gov.in']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) }
}));
app.use(requestLogger);

// Rate limiting middleware
app.use(async (req, res, next) => {
  if (!rateLimiter) return next();
  
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/atlas', atlasRoutes);
app.use('/api/dss', dssRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/export', authenticateToken, exportRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Drishti-GIS Backend API',
    version: '1.0.0',
    description: 'Backend API for Forest Rights Act claim management system',
    endpoints: {
      auth: '/api/auth - Authentication endpoints',
      claims: '/api/claims - Claim management',
      atlas: '/api/atlas - GIS and mapping data',
      dss: '/api/dss - Decision Support System',
      iot: '/api/iot - IoT sensor data',
      admin: '/api/admin - Admin operations (requires auth)',
      export: '/api/export - Data export functions (requires auth)',
    },
    health: '/health - Service health check'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Drishti-GIS Backend running on port ${PORT}`);
  logger.info(`📖 API Documentation available at http://localhost:${PORT}/api`);
  logger.info(`❤️  Health check available at http://localhost:${PORT}/health`);
});

export default app;
