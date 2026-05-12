const Student = require('../models/Student');
const LostFound = require('../models/LostFound');
const Memory = require('../models/Memory');
const Club = require('../models/Club');
const PlacementExperience = require('../models/PlacementExperience');
const Marketplace = require('../models/Marketplace');
const Canteen = require('../models/Canteen');
const User = require('../models/User');

/**
 * ─────────────────────────────────────────────────────
 *  MONTHLY GROWTH (Generic — works for any model)
 * ─────────────────────────────────────────────────────
 * Returns monthly document counts for the last 12 months.
 * Output: [{ _id: { year, month }, count }]
 */
const getMonthlyGrowth = async (Model, months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return Model.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);
};

/**
 * ─────────────────────────────────────────────────────
 *  WEEKLY GROWTH (Last 7 days, daily counts)
 * ─────────────────────────────────────────────────────
 */
const getWeeklyGrowth = async (Model) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  return Model.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
    },
  ]);
};

/**
 * ─────────────────────────────────────────────────────
 *  LOST & FOUND — Status Breakdown (Pie Chart)
 * ─────────────────────────────────────────────────────
 * Output: [{ _id: "active", count: 34 }, { _id: "resolved", count: 55 }]
 */
const getLostFoundStatusBreakdown = async () => {
  return LostFound.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        label: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 'active'] }, then: 'Active' },
              { case: { $eq: ['$_id', 'resolved'] }, then: 'Resolved' },
              { case: { $eq: ['$_id', 'claimed'] }, then: 'Claimed' },
            ],
            default: '$_id',
          },
        },
        value: '$count',
      },
    },
  ]);
};

/**
 * ─────────────────────────────────────────────────────
 *  LOST & FOUND — Top Categories (Bar Chart)
 * ─────────────────────────────────────────────────────
 * Output: [{ label: "Electronics", count: 25 }]
 */
const getLostFoundCategoryRanking = async (topN = 10) => {
  return LostFound.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: topN },
    {
      $project: {
        _id: 0,
        label: '$_id',
        count: '$count',
      },
    },
  ]);
};

/**
 * ─────────────────────────────────────────────────────
 *  ACTIVE vs INACTIVE (Generic — works for any model)
 * ─────────────────────────────────────────────────────
 * Output: { active: N, inactive: M }
 */
const getActiveVsInactive = async (Model, field = 'isActive') => {
  const result = await Model.aggregate([
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
  ]);

  const active = result.find((r) => r._id === true)?.count || 0;
  const inactive = result.find((r) => r._id === false)?.count || 0;

  return { active, inactive };
};

/**
 * ─────────────────────────────────────────────────────
 *  MOST ACTIVE CLUBS (by member count)
 * ─────────────────────────────────────────────────────
 * Output: [{ clubName, memberCount, isActive }]
 */
const getMostActiveClubs = async (topN = 10) => {
  return Club.aggregate([
    {
      $project: {
        clubName: 1,
        isActive: 1,
        memberCount: { $size: { $ifNull: ['$members', []] } },
      },
    },
    { $sort: { memberCount: -1 } },
    { $limit: topN },
  ]);
};

/**
 * ─────────────────────────────────────────────────────
 *  MONTHLY USER REGISTRATIONS (Time Series)
 * ─────────────────────────────────────────────────────
 */
const getMonthlyUserRegistrations = async () => {
  return getMonthlyGrowth(User, 12);
};

/**
 * ─────────────────────────────────────────────────────
 *  UNIFIED RECENT ACTIVITY FEED
 * ─────────────────────────────────────────────────────
 * Merges latest docs from 5 collections into one sorted feed.
 * Uses individual queries + manual merge (more flexible than $unionWith
 * which requires same DB). Each query is lightweight with lean + select.
 */
const getRecentActivityFeed = async (limit = 20) => {
  const recentLimit = Math.ceil(limit / 5) + 2; // fetch slightly more per collection

  const [memories, lostItems, marketplace, placements, clubs] = await Promise.all([
    Memory.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select('title uploadedBy createdAt')
      .lean(),

    LostFound.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select('itemName category status reportedBy createdAt')
      .lean(),

    Marketplace.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select('productName price seller status createdAt')
      .lean(),

    PlacementExperience.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select('companyName role createdBy createdAt')
      .lean(),

    Club.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select('clubName isActive createdAt')
      .lean(),
  ]);

  // Transform each into a unified activity shape
  const activities = [
    ...memories.map((doc) => ({
      type: 'memory',
      title: `New memory uploaded: ${doc.title}`,
      user: doc.uploadedBy,
      createdAt: doc.createdAt,
      metadata: { memoryId: doc._id },
    })),
    ...lostItems.map((doc) => ({
      type: 'lost_found',
      title: `Lost item reported: ${doc.itemName}`,
      user: doc.reportedBy,
      createdAt: doc.createdAt,
      metadata: { category: doc.category, status: doc.status, itemId: doc._id },
    })),
    ...marketplace.map((doc) => ({
      type: 'marketplace',
      title: `New product listed: ${doc.productName}`,
      user: doc.seller,
      createdAt: doc.createdAt,
      metadata: { price: doc.price, status: doc.status, productId: doc._id },
    })),
    ...placements.map((doc) => ({
      type: 'placement',
      title: `Placement experience: ${doc.companyName} — ${doc.role}`,
      user: doc.createdBy,
      createdAt: doc.createdAt,
      metadata: { placementId: doc._id },
    })),
    ...clubs.map((doc) => ({
      type: 'club',
      title: `Club registered: ${doc.clubName}`,
      user: null,
      createdAt: doc.createdAt,
      metadata: { clubId: doc._id, isActive: doc.isActive },
    })),
  ];

  // Sort by createdAt descending and limit
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return activities.slice(0, limit);
};

/**
 * ─────────────────────────────────────────────────────
 *  MARKETPLACE STATUS BREAKDOWN (Pie Chart)
 * ─────────────────────────────────────────────────────
 */
const getMarketplaceStatusBreakdown = async () => {
  return Marketplace.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        label: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 'active'] }, then: 'Active' },
              { case: { $eq: ['$_id', 'sold'] }, then: 'Sold' },
              { case: { $eq: ['$_id', 'removed'] }, then: 'Removed' },
            ],
            default: '$_id',
          },
        },
        value: '$count',
      },
    },
  ]);
};

module.exports = {
  getMonthlyGrowth,
  getWeeklyGrowth,
  getLostFoundStatusBreakdown,
  getLostFoundCategoryRanking,
  getActiveVsInactive,
  getMostActiveClubs,
  getMonthlyUserRegistrations,
  getRecentActivityFeed,
  getMarketplaceStatusBreakdown,
};
