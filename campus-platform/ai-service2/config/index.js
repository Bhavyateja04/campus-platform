require('dotenv').config();

/**
 * Centralized configuration object.
 * All environment variables are read here and exported as a single object.
 */
const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // Database
  mongoUri:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-image-analysis',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // OpenRouter AI Vision
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    timeout: 60000,
  },

  // Roboflow (optional fallback)
  roboflow: {
    apiKey: process.env.ROBOFLOW_API_KEY || '',
    workspace: process.env.ROBOFLOW_WORKSPACE || '',
    modelId: process.env.ROBOFLOW_MODEL_ID || '',
    modelVersion: process.env.ROBOFLOW_MODEL_VERSION || '1',
    workflowId: process.env.ROBOFLOW_WORKFLOW_ID || '',
    baseUrl: 'https://detect.roboflow.com',
    inferenceUrl: 'https://infer.roboflow.com',
    timeout: 30000,
  },

  // Matching Thresholds
  matching: {
    strongMatchThreshold: parseInt(process.env.STRONG_MATCH_THRESHOLD, 10) || 70,
    possibleMatchThreshold: parseInt(process.env.POSSIBLE_MATCH_THRESHOLD, 10) || 50,
    minConfidence: parseFloat(process.env.MIN_CONFIDENCE) || 0.6,
    topMatches: parseInt(process.env.TOP_MATCHES, 10) || 5,
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  useCloudinary: process.env.USE_CLOUDINARY === 'true',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    uploadMax: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX, 10) || 20,
  },

  // Image Validation
  imageValidation: {
    maxSizeMB: parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 10,
    minQualityScore: parseInt(process.env.MIN_IMAGE_QUALITY_SCORE, 10) || 30,
    blurThreshold: parseInt(process.env.BLUR_THRESHOLD, 10) || 100,
    confidenceThreshold:
      parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.6,
  },

  // Cleanup
  cleanup: {
    intervalHours:
      parseInt(process.env.CLEANUP_INTERVAL_HOURS, 10) || 24,
    orphanAgeHours:
      parseInt(process.env.ORPHAN_FILE_AGE_HOURS, 10) || 48,
  },
};

module.exports = config;
