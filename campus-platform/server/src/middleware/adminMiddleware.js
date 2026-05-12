const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

const MESSAGES = {
  AUTHENTICATION_REQUIRED: "Authentication required",
  ADMIN_ACCESS_REQUIRED: "Admin access required",
};

const ROLES = {
  ADMIN: "admin",
};

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * @desc    Restricts route access to admin users only.
 * @notice  Must be chained AFTER the JWT-verifying auth middleware.
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.AUTHENTICATION_REQUIRED,
    });
  }

  if (req.user.role !== ROLES.ADMIN) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: MESSAGES.ADMIN_ACCESS_REQUIRED,
    });
  }

  next();
};

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = adminOnly;
