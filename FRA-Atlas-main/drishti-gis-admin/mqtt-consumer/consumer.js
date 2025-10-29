import mqtt from 'mqtt';
import mongoose from 'mongoose';
import winston from 'winston';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mqtt-consumer' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'logs/mqtt-consumer.log' })
  ],
});

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/drishti';
const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';

// MongoDB Schema definitions
const sensorDataSchema = new mongoose.Schema({
  sensor_id: { type: String, required: true, index: true },
  device_type: { type: String, required: true },
  village_id: { type: Number, index: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  value: { type: Number, required: true },
  unit: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  quality: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
  battery_level: { type: Number, min: 0, max: 100 },
  signal_strength: { type: Number },
  metadata: { type: Object, default: {} },
  created_at: { type: Date, default: Date.now }
});

// Add geospatial index
sensorDataSchema.index({ location: '2dsphere' });

// Add compound indexes for common queries
sensorDataSchema.index({ sensor_id: 1, timestamp: -1 });
sensorDataSchema.index({ device_type: 1, timestamp: -1 });
sensorDataSchema.index({ village_id: 1, timestamp: -1 });

const SensorData = mongoose.model('SensorData', sensorDataSchema);

// Device status schema
const deviceStatusSchema = new mongoose.Schema({
  device_id: { type: String, required: true, unique: true },
  device_type: { type: String, required: true },
  village_id: { type: Number },
  status: { type: String, enum: ['online', 'offline', 'maintenance'], default: 'offline' },
  last_seen: { type: Date, default: Date.now },
  battery_level: { type: Number, min: 0, max: 100 },
  signal_strength: { type: Number },
  firmware_version: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  metadata: { type: Object, default: {} },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

deviceStatusSchema.index({ location: '2dsphere' });
deviceStatusSchema.index({ device_id: 1 });
deviceStatusSchema.index({ village_id: 1 });

const DeviceStatus = mongoose.model('DeviceStatus', deviceStatusSchema);

// Alert schema for threshold violations
const alertSchema = new mongoose.Schema({
  sensor_id: { type: String, required: true },
  device_type: { type: String, required: true },
  village_id: { type: Number },
  alert_type: { type: String, required: true }, // 'threshold', 'offline', 'battery_low'
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  message: { type: String, required: true },
  value: { type: Number },
  threshold: { type: Number },
  acknowledged: { type: Boolean, default: false },
  acknowledged_by: { type: String },
  acknowledged_at: { type: Date },
  resolved: { type: Boolean, default: false },
  resolved_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

alertSchema.index({ sensor_id: 1, created_at: -1 });
alertSchema.index({ village_id: 1, created_at: -1 });
alertSchema.index({ acknowledged: 1, resolved: 1 });

const Alert = mongoose.model('Alert', alertSchema);

// Threshold definitions for different sensor types
const THRESHOLDS = {
  soil_moisture: {
    min: 20, // Below 20% - drought alert
    max: 80, // Above 80% - flood alert
    unit: '%'
  },
  water_level: {
    min: 0.5, // Below 0.5m - low water alert
    max: 5.0, // Above 5m - flood alert
    unit: 'm'
  },
  air_quality: {
    min: 0,
    max: 100, // Above 100 AQI - poor air quality
    unit: 'AQI'
  },
  temperature: {
    min: -10,
    max: 45, // Above 45°C - extreme heat
    unit: '°C'
  }
};

// Data validation and cleaning
function validateSensorData(data) {
  const errors = [];
  
  if (!data.id) errors.push('Missing sensor ID');
  if (!data.type) errors.push('Missing sensor type');
  if (typeof data.value !== 'number') errors.push('Invalid sensor value');
  if (!data.ts) errors.push('Missing timestamp');
  
  // Validate coordinates if provided
  if (data.lat !== undefined || data.lng !== undefined) {
    if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
      errors.push('Invalid coordinates');
    } else if (data.lat < -90 || data.lat > 90 || data.lng < -180 || data.lng > 180) {
      errors.push('Coordinates out of range');
    }
  }
  
  return errors;
}

// Check for threshold violations
function checkThresholds(sensorType, value) {
  const threshold = THRESHOLDS[sensorType];
  if (!threshold) return null;
  
  if (value < threshold.min) {
    return {
      type: 'threshold',
      severity: sensorType === 'soil_moisture' ? 'high' : 'medium',
      message: `${sensorType} below minimum threshold: ${value}${threshold.unit} < ${threshold.min}${threshold.unit}`,
      threshold: threshold.min
    };
  }
  
  if (value > threshold.max) {
    return {
      type: 'threshold',
      severity: sensorType === 'water_level' || sensorType === 'air_quality' ? 'high' : 'medium',
      message: `${sensorType} above maximum threshold: ${value}${threshold.unit} > ${threshold.max}${threshold.unit}`,
      threshold: threshold.max
    };
  }
  
  return null;
}

// Process incoming sensor data
async function processSensorData(topic, payload) {
  try {
    const data = JSON.parse(payload.toString());
    
    // Validate data
    const validationErrors = validateSensorData(data);
    if (validationErrors.length > 0) {
      logger.warn(`Invalid sensor data: ${validationErrors.join(', ')}`, { data, topic });
      return;
    }
    
    // Extract coordinates (default to India center if not provided)
    const coordinates = [
      data.lng || 78.9629, // Default longitude (India center)
      data.lat || 20.5937  // Default latitude (India center)
    ];
    
    // Create sensor data document
    const sensorData = new SensorData({
      sensor_id: data.id,
      device_type: data.type,
      village_id: data.village || null,
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      value: data.value,
      unit: data.unit || THRESHOLDS[data.type]?.unit || '',
      timestamp: new Date(data.ts),
      quality: data.quality || 'good',
      battery_level: data.battery,
      signal_strength: data.signal,
      metadata: {
        topic: topic,
        raw_data: data
      }
    });
    
    // Save to database
    await sensorData.save();
    logger.info(`Saved sensor data: ${data.id} - ${data.type} = ${data.value}`, {
      sensor_id: data.id,
      value: data.value,
      timestamp: data.ts
    });
    
    // Update device status
    await DeviceStatus.findOneAndUpdate(
      { device_id: data.id },
      {
        device_type: data.type,
        village_id: data.village || null,
        status: 'online',
        last_seen: new Date(),
        battery_level: data.battery,
        signal_strength: data.signal,
        location: {
          type: 'Point',
          coordinates: coordinates
        },
        updated_at: new Date()
      },
      { 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    // Check for threshold violations
    const violation = checkThresholds(data.type, data.value);
    if (violation) {
      // Check if we already have a recent alert for this sensor
      const recentAlert = await Alert.findOne({
        sensor_id: data.id,
        alert_type: 'threshold',
        resolved: false,
        created_at: { $gte: new Date(Date.now() - 3600000) } // Within last hour
      });
      
      if (!recentAlert) {
        const alert = new Alert({
          sensor_id: data.id,
          device_type: data.type,
          village_id: data.village || null,
          alert_type: violation.type,
          severity: violation.severity,
          message: violation.message,
          value: data.value,
          threshold: violation.threshold
        });
        
        await alert.save();
        logger.warn(`Alert created: ${violation.message}`, {
          sensor_id: data.id,
          alert_type: violation.type,
          severity: violation.severity
        });
      }
    }
    
  } catch (error) {
    logger.error('Error processing sensor data', {
      topic,
      payload: payload.toString(),
      error: error.message
    });
  }
}

// Process device status updates
async function processDeviceStatus(topic, payload) {
  try {
    const data = JSON.parse(payload.toString());
    
    await DeviceStatus.findOneAndUpdate(
      { device_id: data.device_id },
      {
        status: data.status || 'online',
        last_seen: new Date(),
        battery_level: data.battery_level,
        signal_strength: data.signal_strength,
        firmware_version: data.firmware_version,
        updated_at: new Date()
      },
      { upsert: true }
    );
    
    // Check for low battery alert
    if (data.battery_level && data.battery_level < 20) {
      const recentAlert = await Alert.findOne({
        sensor_id: data.device_id,
        alert_type: 'battery_low',
        resolved: false,
        created_at: { $gte: new Date(Date.now() - 86400000) } // Within last 24 hours
      });
      
      if (!recentAlert) {
        const alert = new Alert({
          sensor_id: data.device_id,
          device_type: data.device_type || 'unknown',
          alert_type: 'battery_low',
          severity: data.battery_level < 10 ? 'high' : 'medium',
          message: `Low battery: ${data.battery_level}%`,
          value: data.battery_level,
          threshold: 20
        });
        
        await alert.save();
        logger.warn(`Low battery alert: ${data.device_id} - ${data.battery_level}%`);
      }
    }
    
  } catch (error) {
    logger.error('Error processing device status', {
      topic,
      payload: payload.toString(),
      error: error.message
    });
  }
}

// Periodic cleanup of old data
async function cleanupOldData() {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  try {
    // Delete sensor data older than 1 month
    const deletedSensorData = await SensorData.deleteMany({
      created_at: { $lt: oneMonthAgo }
    });
    
    // Delete resolved alerts older than 1 week
    const deletedAlerts = await Alert.deleteMany({
      resolved: true,
      resolved_at: { $lt: oneWeekAgo }
    });
    
    logger.info(`Cleanup completed: ${deletedSensorData.deletedCount} sensor records, ${deletedAlerts.deletedCount} alerts deleted`);
  } catch (error) {
    logger.error('Cleanup failed', { error: error.message });
  }
}

// Check for offline devices
async function checkOfflineDevices() {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  try {
    // Mark devices as offline if not seen in 15 minutes
    await DeviceStatus.updateMany(
      {
        last_seen: { $lt: fifteenMinutesAgo },
        status: { $ne: 'offline' }
      },
      {
        status: 'offline',
        updated_at: new Date()
      }
    );
    
    // Create alerts for newly offline devices
    const offlineDevices = await DeviceStatus.find({
      last_seen: { $lt: fifteenMinutesAgo },
      status: 'offline'
    });
    
    for (const device of offlineDevices) {
      const recentAlert = await Alert.findOne({
        sensor_id: device.device_id,
        alert_type: 'offline',
        resolved: false,
        created_at: { $gte: new Date(Date.now() - 3600000) } // Within last hour
      });
      
      if (!recentAlert) {
        const alert = new Alert({
          sensor_id: device.device_id,
          device_type: device.device_type,
          village_id: device.village_id,
          alert_type: 'offline',
          severity: 'medium',
          message: `Device offline: Last seen ${device.last_seen.toISOString()}`
        });
        
        await alert.save();
      }
    }
    
  } catch (error) {
    logger.error('Error checking offline devices', { error: error.message });
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    logger.info(`Connected to MongoDB: ${MONGO_URL}`);
    
    // Connect to MQTT broker
    const client = mqtt.connect(MQTT_URL, {
      clientId: `drishti-consumer-${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    });
    
    client.on('connect', () => {
      logger.info(`Connected to MQTT broker: ${MQTT_URL}`);
      
      // Subscribe to topics
      const topics = [
        'drishti/iot/+/data',      // Sensor data: drishti/iot/village_id/data
        'drishti/iot/+/status',    // Device status: drishti/iot/device_id/status
        'drishti/iot/broadcast',   // Broadcast messages
      ];
      
      topics.forEach(topic => {
        client.subscribe(topic, (err) => {
          if (err) {
            logger.error(`Failed to subscribe to ${topic}`, { error: err.message });
          } else {
            logger.info(`Subscribed to topic: ${topic}`);
          }
        });
      });
    });
    
    client.on('message', async (topic, message) => {
      logger.debug(`Received message on ${topic}`, { 
        topic, 
        messageLength: message.length 
      });
      
      if (topic.includes('/data')) {
        await processSensorData(topic, message);
      } else if (topic.includes('/status')) {
        await processDeviceStatus(topic, message);
      }
    });
    
    client.on('error', (error) => {
      logger.error('MQTT connection error', { error: error.message });
    });
    
    client.on('close', () => {
      logger.warn('MQTT connection closed');
    });
    
    client.on('reconnect', () => {
      logger.info('MQTT reconnecting...');
    });
    
    // Set up periodic tasks
    setInterval(cleanupOldData, 24 * 60 * 60 * 1000); // Daily cleanup
    setInterval(checkOfflineDevices, 5 * 60 * 1000);   // Check every 5 minutes
    
    logger.info('MQTT Consumer started successfully');
    
  } catch (error) {
    logger.error('Failed to start MQTT consumer', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the consumer
main().catch(error => {
  logger.error('Unhandled error in main', { error: error.message });
  process.exit(1);
});
