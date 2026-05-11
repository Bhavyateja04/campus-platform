const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/RevokedTokenModel");

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
}

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const parts = authHeader.split(" ");
  const token =
    parts.length === 2 && parts[0].toLowerCase() === "bearer"
      ? parts[1]
      : parts[parts.length - 1];

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret());
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Reject tokens that have been explicitly revoked via /api/auth/logout
  // (or any future admin force-logout flow). Tokens issued before the `jti`
  // claim was introduced have nothing to look up; we still let them through
  // because they will expire on their own within a day.
  if (decoded && decoded.jti) {
    try {
      const revoked = await RevokedToken.exists({ jti: decoded.jti });
      if (revoked) {
        return res.status(401).json({ message: "Token has been revoked" });
      }
    } catch (error) {
      // Fail closed: a degraded auth-store should never widen the auth
      // surface, so reject the request rather than skipping the check.
      console.error("revocation lookup failed", error);
      return res.status(503).json({ message: "Auth verification temporarily unavailable" });
    }
  }

  req.user = decoded;
  next();
};

module.exports = protect;
