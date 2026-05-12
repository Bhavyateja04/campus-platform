const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. No token provided.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+role').lean();

    if (!currentUser) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    if (currentUser.isBlocked) {
      return next(new AppError('Your account has been blocked. Contact admin.', 403));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * Restrict access to specific roles.
 * Usage: restrictTo('admin', 'moderator')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

/**
 * Combined middleware: protect + admin only.
 */
const adminAuth = [protect, restrictTo('admin')];

module.exports = { protect, restrictTo, adminAuth };
