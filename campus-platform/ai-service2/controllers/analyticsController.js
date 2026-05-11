const analyticsService = require('../services/analyticsService');
const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getTrends = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const trends = await analyticsService.getTrends(days);
  res.status(200).json({ status: 'success', data: { trends } });
});

exports.getTopObjects = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  const topObjects = await analyticsService.getTopObjects(limit);
  res.status(200).json({ status: 'success', results: topObjects.length, data: { topObjects } });
});
