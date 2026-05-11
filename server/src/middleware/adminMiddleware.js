const jwt = require("jsonwebtoken");

// @desc    Middleware to protect routes via JWT authentication
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and follows "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  // BUG FIX: Hardcoded "SECRET_KEY" replaced with environment variable
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("protect middleware error:", error.message);

    // Return specific messages based on error type
    const message =
      error.name === "TokenExpiredError"
        ? "Token has expired. Please log in again."
        : "Invalid token. Access denied.";

    return res.status(401).json({ success: false, message });
  }
};

module.exports = protect;
