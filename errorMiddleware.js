/**
 * @fileoverview Express error-handling middleware
 * Provides a global error handler and a 404 not-found handler.
 * Mount these LAST in your Express app, after all routes.
 */

// ─────────────────────────────────────────────
//  Global Error Handler
// ─────────────────────────────────────────────

/**
 * Catches any error passed via next(err) and returns a structured JSON response.
 * In development mode, the stack trace is included to aid debugging.
 *
 * @param {Error}           err  - The error object (may include a custom statusCode)
 * @param {import('express').Request}  req  - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Express next function (required by Express to recognise this as an error handler)
 */
const errorHandler = (err, req, res, next) => {
  // Log the full stack trace for server-side visibility
  console.error("Global Error:", err.stack);

  const statusCode = err.statusCode || 500;            // Use custom code if set, else 500
  const message    = err.message    || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error:   message,

    // Only expose stack trace in development to avoid leaking internals in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// ─────────────────────────────────────────────
//  404 Not Found Handler
// ─────────────────────────────────────────────

/**
 * Fallback middleware for unmatched routes.
 * Returns a 404 with the attempted HTTP method and URL for easy debugging.
 *
 * @param {import('express').Request}  req  - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// ─────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────

module.exports = { errorHandler, notFound };
