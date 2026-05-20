const AppError = require('../utils/AppError');

/**
 * Handle Mongoose CastError (invalid ObjectId).
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error.
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  const message = `Duplicate value for field: ${field}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose validation error.
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Send detailed error in development.
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/**
 * Send clean error in production.
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown error: don't leak details
    console.error('❌ UNEXPECTED ERROR:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong on the server.',
    });
  }
};

/**
 * Global error handling middleware.
 * Must have 4 params to be recognized by Express as error handler.
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);

    sendErrorProd(error, res);
  }
};

module.exports = { globalErrorHandler };
