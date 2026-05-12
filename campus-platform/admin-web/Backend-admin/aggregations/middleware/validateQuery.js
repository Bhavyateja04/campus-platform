```js id="h78w4w"
// ======================================================
// IMPORTS
// ======================================================

const Joi = require("joi");

const AppError = require("../utils/AppError");


// ======================================================
// VALIDATION SCHEMAS
// ======================================================

/**
 * Pagination query validation schema
 */
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
});


/**
 * Chart query validation schema
 */
const chartQuerySchema = Joi.object({
  period: Joi.string()
    .valid("7d", "30d", "90d", "12m")
    .default("12m"),
});


// ======================================================
// GENERIC VALIDATION HELPER
// ======================================================

/**
 * Validate request query parameters
 */
const validateQuery = (
  schema,
  query
) => {
  return schema.validate(query, {
    allowUnknown: true,

    abortEarly: false,
  });
};


/**
 * Build formatted validation error
 */
const buildValidationError = (
  validationError
) => {
  const errorMessages =
    validationError.details
      .map((detail) => detail.message)
      .join(". ");

  return new AppError(
    `Invalid query parameters: ${errorMessages}`,
    400
  );
};


// ======================================================
// PAGINATION VALIDATION
// ======================================================

/**
 * Validate pagination query params
 *
 * Attaches:
 * req.pagination = {
 *   page,
 *   limit,
 *   skip
 * }
 */
const validatePagination = (
  req,
  res,
  next
) => {

  const {
    error,
    value,
  } = validateQuery(
    paginationSchema,
    req.query
  );

  if (error) {
    return next(
      buildValidationError(error)
    );
  }

  req.pagination = {
    page: value.page,

    limit: value.limit,

    skip:
      (value.page - 1) *
      value.limit,
  };

  next();
};


// ======================================================
// CHART QUERY VALIDATION
// ======================================================

/**
 * Validate chart query parameters
 *
 * Attaches:
 * req.chartPeriod
 */
const validateChartQuery = (
  req,
  res,
  next
) => {

  const {
    error,
    value,
  } = validateQuery(
    chartQuerySchema,
    req.query
  );

  if (error) {
    return next(
      buildValidationError(error)
    );
  }

  req.chartPeriod = value.period;

  next();
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  validatePagination,
  validateChartQuery,
};
```
