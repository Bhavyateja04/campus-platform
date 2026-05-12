const Joi = require('joi');
const AppError = require('../utils/AppError');

/**
 * Pagination query parameter schema.
 */
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

/**
 * Middleware: validate pagination query params.
 * Attaches sanitized { page, limit } to req.pagination.
 */
const validatePagination = (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query, {
    allowUnknown: true, // don't strip other query params
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('. ');
    return next(new AppError(`Invalid query parameters: ${messages}`, 400));
  }

  req.pagination = {
    page: value.page,
    limit: value.limit,
    skip: (value.page - 1) * value.limit,
  };

  next();
};

/**
 * Middleware: validate chart query params (optional period filter).
 */
const chartQuerySchema = Joi.object({
  period: Joi.string()
    .valid('7d', '30d', '90d', '12m')
    .default('12m'),
});

const validateChartQuery = (req, res, next) => {
  const { error, value } = chartQuerySchema.validate(req.query, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('. ');
    return next(new AppError(`Invalid query parameters: ${messages}`, 400));
  }

  req.chartPeriod = value.period;
  next();
};

module.exports = { validatePagination, validateChartQuery };
