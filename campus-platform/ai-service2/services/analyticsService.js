const ImageAnalysis = require('../models/ImageAnalysis');
const { ANALYSIS_STATUS } = require('../utils/constants');

/**
 * Analytics Service
 * Generates dashboard statistics using MongoDB aggregation pipelines.
 */
class AnalyticsService {
  /**
   * Get dashboard overview statistics.
   */
  async getDashboardStats() {
    const [stats] = await ImageAnalysis.aggregate([
      {
        $facet: {
          totalUploads: [{ $count: 'count' }],
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          categoryBreakdown: [
            { $match: { status: ANALYSIS_STATUS.COMPLETED } },
            { $group: { _id: '$imageCategory', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          detectionStats: [
            { $match: { status: ANALYSIS_STATUS.COMPLETED } },
            {
              $group: {
                _id: null,
                totalDetections: { $sum: '$detectedObjectsCount' },
                avgDetectionsPerImage: { $avg: '$detectedObjectsCount' },
                avgProcessingTime: { $avg: '$processingTime' },
                maxDetections: { $max: '$detectedObjectsCount' },
              },
            },
          ],
          confidenceStats: [
            { $match: { status: ANALYSIS_STATUS.COMPLETED } },
            { $unwind: '$detections' },
            {
              $group: {
                _id: null,
                avgConfidence: { $avg: '$detections.confidence' },
                minConfidence: { $min: '$detections.confidence' },
                maxConfidence: { $max: '$detections.confidence' },
              },
            },
          ],
          recentAnalyses: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $project: {
                filename: 1, imageCategory: 1, status: 1,
                detectedObjectsCount: 1, aiSummary: 1, createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    return {
      totalUploads: stats.totalUploads[0]?.count || 0,
      activeAnalyses: stats.statusBreakdown.find((s) => s._id === ANALYSIS_STATUS.COMPLETED)?.count || 0,
      statusBreakdown: stats.statusBreakdown,
      categoryBreakdown: stats.categoryBreakdown,
      detectionStats: stats.detectionStats[0] || { totalDetections: 0, avgDetectionsPerImage: 0, avgProcessingTime: 0, maxDetections: 0 },
      confidenceStats: stats.confidenceStats[0] || { avgConfidence: 0, minConfidence: 0, maxConfidence: 0 },
      recentAnalyses: stats.recentAnalyses,
    };
  }

  /**
   * Get detection trends over time.
   * @param {number} days - Number of days to look back (default 30)
   */
  async getTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await ImageAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: ANALYSIS_STATUS.COMPLETED,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          uploads: { $sum: 1 },
          totalDetections: { $sum: '$detectedObjectsCount' },
          avgProcessingTime: { $avg: '$processingTime' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          uploads: 1,
          totalDetections: 1,
          avgProcessingTime: { $round: ['$avgProcessingTime', 0] },
        },
      },
    ]);

    return { period: `${days} days`, startDate, trends };
  }

  /**
   * Get most detected objects across all analyses.
   * @param {number} limit - Max number of objects to return (default 20)
   */
  async getTopObjects(limit = 20) {
    const topObjects = await ImageAnalysis.aggregate([
      { $match: { status: ANALYSIS_STATUS.COMPLETED } },
      { $unwind: '$detections' },
      {
        $group: {
          _id: '$detections.className',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$detections.confidence' },
          maxConfidence: { $max: '$detections.confidence' },
          imageCount: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          className: '$_id',
          totalDetections: '$count',
          avgConfidence: { $round: ['$avgConfidence', 3] },
          maxConfidence: { $round: ['$maxConfidence', 3] },
          appearsInImages: { $size: '$imageCount' },
        },
      },
      { $sort: { totalDetections: -1 } },
      { $limit: limit },
    ]);

    return topObjects;
  }
}

module.exports = new AnalyticsService();
