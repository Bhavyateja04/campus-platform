```js id="z2zttg"
// ======================================================
// IMPORTS
// ======================================================

const dashboardService = require("../services/dashboardService");
const AppError = require("../utils/AppError");


// ======================================================
// RESPONSE HELPER
// ======================================================

/**
 * Send standardized success response
 */
const sendSuccessResponse = (
  res,
  message,
  data,
  pagination = null
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};


// ======================================================
// DASHBOARD CONTROLLERS
// ======================================================

/**
 * @desc    Get dashboard summary cards
 * @route   GET /api/admin/dashboard/summary
 * @access  Admin
 */
const getDashboardSummary = async (
  req,
  res,
  next
) => {
  try {
    const summary =
      await dashboardService.getSummary();

    return sendSuccessResponse(
      res,
      "Dashboard summary fetched successfully",
      summary
    );

  } catch (error) {
    next(
      new AppError(
        error.message ||
          "Failed to fetch dashboard summary",
        500
      )
    );
  }
};


/**
 * @desc    Get recent activity feed
 * @route   GET /api/admin/dashboard/recent-activities
 * @access  Admin
 */
const getRecentActivities = async (
  req,
  res,
  next
) => {
  try {
    const { page, limit } = req.pagination;

    const result =
      await dashboardService.getRecentActivities(
        page,
        limit
      );

    return sendSuccessResponse(
      res,
      "Recent activities fetched successfully",
      result.activities,
      result.pagination
    );

  } catch (error) {
    next(
      new AppError(
        error.message ||
          "Failed to fetch recent activities",
        500
      )
    );
  }
};


/**
 * @desc    Get dashboard chart analytics
 * @route   GET /api/admin/dashboard/charts
 * @access  Admin
 */
const getChartData = async (
  req,
  res,
  next
) => {
  try {
    const chartData =
      await dashboardService.getChartData();

    return sendSuccessResponse(
      res,
      "Chart data fetched successfully",
      chartData
    );

  } catch (error) {
    next(
      new AppError(
        error.message ||
          "Failed to fetch chart data",
        500
      )
    );
  }
};


/**
 * @desc    Get latest memory posts
 * @route   GET /api/admin/dashboard/latest-memories
 * @access  Admin
 */
const getLatestMemories = async (
  req,
  res,
  next
) => {
  try {
    const { page, limit } = req.pagination;

    const result =
      await dashboardService.getLatestMemories(
        page,
        limit
      );

    return sendSuccessResponse(
      res,
      "Latest memories fetched successfully",
      result.memories,
      result.pagination
    );

  } catch (error) {
    next(
      new AppError(
        error.message ||
          "Failed to fetch latest memories",
        500
      )
    );
  }
};


/**
 * @desc    Get latest marketplace listings
 * @route   GET /api/admin/dashboard/latest-marketplace
 * @access  Admin
 */
const getLatestMarketplace = async (
  req,
  res,
  next
) => {
  try {
    const { page, limit } = req.pagination;

    const result =
      await dashboardService.getLatestMarketplace(
        page,
        limit
      );

    return sendSuccessResponse(
      res,
      "Marketplace listings fetched successfully",
      result.products,
      result.pagination
    );

  } catch (error) {
    next(
      new AppError(
        error.message ||
          "Failed to fetch marketplace listings",
        500
      )
    );
  }
};


/**
 * @desc    Get latest placement posts
 * @route   GET /api/admin/dashboard/latest-placement-posts
 * @access  Admin
 */
const getLatestPlacements = async (
  req,
  res,
  next
) => {
  try {
    const { page, limit } = req.pagination;

    const result =
      await dashboardService.getLatestPlacements(
        page,
        limit
      );

    return sendSuccessResponse(
      res,
      "Placement posts fetched successfully",
      result.posts,
      result.pagination
    );

  } catch (error) {
    next(
      new AppError(
        error.message ||
          "Failed to fetch placement posts",
        500
      )
    );
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getDashboardSummary,
  getRecentActivities,
  getChartData,
  getLatestMemories,
  getLatestMarketplace,
  getLatestPlacements,
};
```
