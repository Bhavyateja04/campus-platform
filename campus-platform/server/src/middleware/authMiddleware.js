const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/RevokedTokenModel");

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  SERVICE_UNAVAILABLE: 503,
};

const MESSAGES = {
  NO_TOKEN: "No token provided",
  INVALID_TOKEN: "Invalid or expired token",
  REVOKED_TOKEN: "Token has been revoked",
  AUTH_UNAVAILABLE: "Auth verification temporarily unavailable",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reads JWT_SECRET from the environment.
 * Throws immediately at startup if the variable is missing,
 * rather than silently failing on the first request.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
};

/**
 * Extracts the raw token string from an Authorization header.
 * Accepts both:
 *   "Bearer <token>"  (standard)
 *   "<token>"         (bare, legacy)
 */
const extractToken = (authHeader) => {
  const parts = authHeader.split(" ");
  const isBearerScheme = parts.length === 2 && parts[0].toLowerCase() === "bearer";
  return isBearerScheme ? parts[1] : parts[parts.length - 1];
};

/**
 * Returns true if the decoded JWT has a `jti` claim
 * that exists in the revocation store.
 * Throws if the revocation store is unreachable (fail-closed).
 */
const isTokenRevoked = async (decoded) => {
  if (!decoded?.jti) return false;
  return await RevokedToken.exists({ jti: decoded.jti });
};

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * @desc    Verifies the JWT and attaches decoded user to req.user.
 * @notice  Must run BEFORE any middleware that reads req.user (e.g. adminOnly).
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.NO_TOKEN,
    });
  }

  const token = extractToken(authHeader);

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.INVALID_TOKEN,
    });
  }

  try {
    if (await isTokenRevoked(decoded)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.REVOKED_TOKEN,
      });
    }
  } catch (error) {
    // Fail closed: a degraded revocation store must never widen the
    // auth surface, so reject the request rather than skipping the check.
    console.error("protect — revocation lookup failed:", error);
    return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      message: MESSAGES.AUTH_UNAVAILABLE,
    });
  }

  req.user = decoded;
  next();
};

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = protect;
