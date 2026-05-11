/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to Express error-handling middleware.
 *
 * @param {Function} fn - Async function (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
