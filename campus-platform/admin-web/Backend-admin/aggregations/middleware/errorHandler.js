```js id="s1wyqq"
// ======================================================
// IMPORTS
// ======================================================

const AppError = require("../utils/AppError");


// ======================================================
// MONGOOSE ERROR HANDLERS
// ======================================================

/**
 * Handle invalid MongoDB ObjectId
 */
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;

  return new AppError(message, 400);
};


/**
 * Handle duplicate key errors
 */
const handleDuplicateKeyError = (
  error
) => {
  const duplicatedFields =
    Object.keys(error.keyValue).join(", ");

  const message =
    `Duplicate value for field: ${duplicatedFields}. ` +
    `Please use another value.`;

  return new AppError(message, 400);
};


/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (
  error
) => {
  const validationMessages =
    Object.values(error.errors).map(
      (item) => item.message
    );

  const message =
    `Validation failed: ${validationMessages.join(
      ". "
    )}`;

  return new AppError(message, 400);
};


// ======================================================
// ERROR RESPONSE HELPERS
// ======================================================

/**
 * Send detailed error response in development
 */
const sendDevelopmentError = (
  error,
  res
) => {
  return res.status(error.statusCode).json({
    success: false,

    status: error.status,

    message: error.message,

    error,

    stack: error.stack,
  });
};


/**
 * Send secure production error response
 */
const sendProductionError = (
  error,
  res
) => {

  // ==========================================
  // OPERATIONAL ERRORS
  // ==========================================

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,

      status: error.status,

      message: error.message,
    });
  }

  // ==========================================
  // UNKNOWN / PROGRAMMING ERRORS
  // ==========================================

  console.error(
    "❌ UNEXPECTED SERVER ERROR:",
    error
  );

  return res.status(500).json({
    success: false,

    status: "error",

    message:
      "Something went wrong on the server.",
  });
};


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

/**
 * Global Express error handling middleware
 *
 * NOTE:
 * Must contain 4 parameters for Express
 * to recognize it as an error middleware.
 */
const globalErrorHandler = (
  error,
  req,
  res,
  next
) => {

  // ==========================================
  // DEFAULT FALLBACK VALUES
  // ==========================================

  error.statusCode =
    error.statusCode || 500;

  error.status =
    error.status || "error";

  // ==========================================
  // DEVELOPMENT MODE
  // ==========================================

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    return sendDevelopmentError(
      error,
      res
    );
  }

  // ==========================================
  // PRODUCTION MODE
  // ==========================================

  let formattedError = {
    ...error,

    message: error.message,

    name: error.name,
  };

  // Handle invalid Mongo ObjectId
  if (
    formattedError.name ===
    "CastError"
  ) {
    formattedError =
      handleCastError(formattedError);
  }

  // Handle duplicate keys
  if (
    formattedError.code === 11000
  ) {
    formattedError =
      handleDuplicateKeyError(
        formattedError
      );
  }

  // Handle schema validation errors
  if (
    formattedError.name ===
    "ValidationError"
  ) {
    formattedError =
      handleValidationError(
        formattedError
      );
  }

  return sendProductionError(
    formattedError,
    res
  );
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  globalErrorHandler,
};
```
