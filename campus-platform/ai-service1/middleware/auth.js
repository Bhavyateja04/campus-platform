const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * JWT authentication middleware.
 * Verifies the token from the Authorization header and attaches user to req.
 */
const auth = catchAsync(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Access denied. No authentication token provided.', 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Fetch user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(
        new AppError('The user associated with this token no longer exists.', 401)
      );
    }

    if (!user.isActive) {
      return next(new AppError('User account is deactivated.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    return next(new AppError('Authentication failed.', 401));
  }
});

module.exports = auth;
