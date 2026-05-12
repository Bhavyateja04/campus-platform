```js id="42yw8i"
// ======================================================
// IMPORTS
// ======================================================

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const AppError = require("../utils/AppError");


// ======================================================
// TOKEN HELPERS
// ======================================================

/**
 * Extract JWT token from Authorization header
 */
const extractTokenFromHeader = (
  authorizationHeader
) => {
  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};


/**
 * Verify JWT token
 */
const verifyJwtToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};


// ======================================================
// AUTH MIDDLEWARE
// ======================================================

/**
 * Protect private routes
 *
 * - Verifies JWT token
 * - Validates user existence
 * - Checks blocked status
 * - Attaches user to req.user
 */
const protect = async (
  req,
  res,
  next
) => {
  try {

    // ==========================================
    // EXTRACT TOKEN
    // ==========================================

    const token = extractTokenFromHeader(
      req.headers.authorization
    );

    if (!token) {
      return next(
        new AppError(
          "Not authorized. No token provided.",
          401
        )
      );
    }

    // ==========================================
    // VERIFY TOKEN
    // ==========================================

    const decodedToken =
      verifyJwtToken(token);

    // ==========================================
    // FIND USER
    // ==========================================

    const currentUser =
      await User.findById(decodedToken.id)
        .select("+role")
        .lean();

    if (!currentUser) {
      return next(
        new AppError(
          "User belonging to this token no longer exists.",
          401
        )
      );
    }

    // ==========================================
    // BLOCK CHECK
    // ==========================================

    if (currentUser.isBlocked) {
      return next(
        new AppError(
          "Your account has been blocked. Contact admin.",
          403
        )
      );
    }

    // ==========================================
    // ATTACH USER
    // ==========================================

    req.user = currentUser;

    next();

  } catch (error) {

    // ==========================================
    // JWT ERRORS
    // ==========================================

    if (
      error.name === "JsonWebTokenError"
    ) {
      return next(
        new AppError(
          "Invalid token. Please log in again.",
          401
        )
      );
    }

    if (
      error.name === "TokenExpiredError"
    ) {
      return next(
        new AppError(
          "Token expired. Please log in again.",
          401
        )
      );
    }

    next(error);
  }
};


// ======================================================
// ROLE-BASED AUTHORIZATION
// ======================================================

/**
 * Restrict access to specific roles
 *
 * Usage:
 * restrictTo("admin", "moderator")
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {

    const userRole = req.user.role;

    if (
      !allowedRoles.includes(userRole)
    ) {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          403
        )
      );
    }

    next();
  };
};


// ======================================================
// COMBINED ADMIN AUTH
// ======================================================

/**
 * Protect route + restrict to admin
 */
const adminAuth = [
  protect,
  restrictTo("admin"),
];


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  protect,
  restrictTo,
  adminAuth,
};
```
