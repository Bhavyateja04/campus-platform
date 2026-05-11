const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * General rate limiter — applies to all API routes.
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again later.',
  },
});

/**
 * Strict rate limiter — applies to upload and analysis endpoints.
 */
const uploadLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.uploadMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Upload limit exceeded. Please try again later.',
  },
});

/**
 * Auth rate limiter — applies to login/register endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts. Please try again later.',
  },
});

module.exports = { generalLimiter, uploadLimiter, authLimiter };
