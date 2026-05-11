const AppError = require('../utils/AppError');

/**
 * Role-based access control middleware factory.
 * Restricts access to users with the specified role(s).
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/admin-only', auth, roleCheck('admin'), handler);
 * router.get('/multi-role', auth, roleCheck('admin', 'moderator'), handler);
 */
const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required before role check.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleCheck;
