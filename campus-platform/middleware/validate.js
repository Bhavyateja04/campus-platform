const { validationResult } = require('express-validator');

/**
 * Express-validator result checker middleware.
 * Checks for validation errors and returns structured 400 response if any found.
 * Place this after express-validator chain(s) in the route definition.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = validate;
