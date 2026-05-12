const express = require('express');
const router = express.Router();

const {
  getDashboardSummary,
  getRecentActivities,
  getChartData,
  getLatestMemories,
  getLatestMarketplace,
  getLatestPlacements,
} = require('../controllers/dashboardController');

const { adminAuth } = require('../middleware/authMiddleware');
const { validatePagination, validateChartQuery } = require('../middleware/validateQuery');

// ─── All routes require admin authentication ───

// Dashboard summary cards (14 metrics)
router.get('/summary', adminAuth, getDashboardSummary);

// Recent activities feed (paginated)
router.get('/recent-activities', adminAuth, validatePagination, getRecentActivities);

// Chart data (monthly, weekly, pie, bar)
router.get('/charts', adminAuth, validateChartQuery, getChartData);

// Latest memories (paginated)
router.get('/latest-memories', adminAuth, validatePagination, getLatestMemories);

// Latest marketplace listings (paginated)
router.get('/latest-marketplace', adminAuth, validatePagination, getLatestMarketplace);

// Latest placement posts (paginated)
router.get('/latest-placement-posts', adminAuth, validatePagination, getLatestPlacements);

module.exports = router;
