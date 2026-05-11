const config = require('../config');

/**
 * Centralized error handling middleware.
 * Catches all errors passed via next(err) and returns structured JSON responses.
 */

// Handle Mongoose CastError (invalid ObjectId)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return { statusCode: 400, message };
};

// Handle Mongoose duplicate key error
const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for field '${field}': '${err.keyValue[field]}'. Please use another value.`;
  return { statusCode: 409, message };
};

// Handle Mongoose validation error
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return { statusCode: 400, message, errors };
};

// Handle JWT errors
const handleJWTError = () => ({
  statusCode: 401,
  message: 'Invalid token. Please log in again.',
});

const handleJWTExpired = () => ({
  statusCode: 401,
  message: 'Token has expired. Please log in again.',
});

// Handle Multer errors
const handleMulterError = (err) => {
  const messages = {
    LIMIT_FILE_SIZE: 'File size exceeds the maximum allowed limit.',
    LIMIT_FILE_COUNT: 'Too many files uploaded.',
    LIMIT_UNEXPECTED_FILE: 'Unexpected file field.',
  };
  return {
    statusCode: 400,
    message: messages[err.code] || err.message,
  };
};

/**
 * Development error response — includes stack trace.
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/**
 * Production error response — hides internal details.
 */
const sendErrorProd = (err, res) => {
  // Operational error: safe to send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Programming / unknown error: log and send generic message
  console.error('💥 UNEXPECTED ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

/**
 * Global error handler middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.isDev) {
    return sendErrorDev(err, res);
  }

  // Production — transform known error types
  let error = { ...err, message: err.message, stack: err.stack };

  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();
  if (err.name === 'MulterError') error = handleMulterError(err);

  // Ensure isOperational is set for transformed errors
  error.isOperational = true;
  error.status = error.status || 'fail';
  error.statusCode = error.statusCode || 500;

  return sendErrorProd(error, res);
};

module.exports = errorHandler;
