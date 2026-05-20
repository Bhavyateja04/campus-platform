const dashboardService = require('../services/dashboardService');
const AppError = require('../utils/AppError');

/**
 * @desc    Get dashboard summary cards
 * @route   GET /api/admin/dashboard/summary
 * @access  Admin
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();

    res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched successfully',
      data: summary,
    });
  } catch (error) {
    next(new AppError(error.message || 'Failed to fetch dashboard summary', 500));
  }
};

/**
 * @desc    Get recent activities feed
 * @route   GET /api/admin/dashboard/recent-activities
 * @access  Admin
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const result = await dashboardService.getRecentActivities(page, limit);

    res.status(200).json({
      success: true,
      message: 'Recent activities fetched successfully',
      data: result.activities,
      pagination: result.pagination,
    });
  } catch (error) {
    next(new AppError(error.message || 'Failed to fetch recent activities', 500));
  }
};

/**
 * @desc    Get chart data (monthly, weekly, pie, bar)
 * @route   GET /api/admin/dashboard/charts
 * @access  Admin
 */
const getChartData = async (req, res, next) => {
  try {
    const charts = await dashboardService.getChartData();

    res.status(200).json({
      success: true,
      message: 'Chart data fetched successfully',
      data: charts,
    });
  } catch (error) {
    next(new AppError(error.message || 'Failed to fetch chart data', 500));
  }
};

/**
 * @desc    Get latest memories
 * @route   GET /api/admin/dashboard/latest-memories
 * @access  Admin
 */
const getLatestMemories = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const result = await dashboardService.getLatestMemories(page, limit);

    res.status(200).json({
      success: true,
      message: 'Latest memories fetched successfully',
      data: result.memories,
      pagination: result.pagination,
    });
  } catch (error) {
    next(new AppError(error.message || 'Failed to fetch latest memories', 500));
  }
};

/**
 * @desc    Get latest marketplace listings
 * @route   GET /api/admin/dashboard/latest-marketplace
 * @access  Admin
 */
const getLatestMarketplace = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const result = await dashboardService.getLatestMarketplace(page, limit);

    res.status(200).json({
      success: true,
      message: 'Latest marketplace listings fetched successfully',
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(new AppError(error.message || 'Failed to fetch marketplace listings', 500));
  }
};

/**
 * @desc    Get latest placement posts
 * @route   GET /api/admin/dashboard/latest-placement-posts
 * @access  Admin
 */
const getLatestPlacements = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const result = await dashboardService.getLatestPlacements(page, limit);

    res.status(200).json({
      success: true,
      message: 'Latest placement posts fetched successfully',
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(new AppError(error.message || 'Failed to fetch placement posts', 500));
  }
};

module.exports = {
  getDashboardSummary,
  getRecentActivities,
  getChartData,
  getLatestMemories,
  getLatestMarketplace,
  getLatestPlacements,
};
