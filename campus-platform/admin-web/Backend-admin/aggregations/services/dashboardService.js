const Student = require('../models/Student');
const LostFound = require('../models/LostFound');
const Memory = require('../models/Memory');
const Club = require('../models/Club');
const PlacementExperience = require('../models/PlacementExperience');
const Marketplace = require('../models/Marketplace');
const Canteen = require('../models/Canteen');
const User = require('../models/User');

const aggregation = require('../aggregations/dashboardAggregation');
const {
  formatMonthlyData,
  fillMissingMonths,
  formatWeeklyData,
  safeCount,
  buildPaginationMeta,
} = require('../helpers/analyticsHelper');

/**
 * GET DASHBOARD SUMMARY
 * 14 count queries executed in parallel via Promise.all()
 */
const getSummary = async () => {
  const [
    totalStudents,
    totalLostFound,
    activeLostItems,
    resolvedLostItems,
    totalMemories,
    activeMemories,
    totalClubs,
    activeClubs,
    placementPosts,
    totalMarketplace,
    activeMarketplace,
    totalCanteens,
    totalAdmins,
    totalUsers,
  ] = await Promise.all([
    Student.countDocuments(),
    LostFound.countDocuments(),
    LostFound.countDocuments({ status: 'active' }),
    LostFound.countDocuments({ status: 'resolved' }),
    Memory.countDocuments(),
    Memory.countDocuments({ isActive: true }),
    Club.countDocuments(),
    Club.countDocuments({ isActive: true }),
    PlacementExperience.countDocuments(),
    Marketplace.countDocuments(),
    Marketplace.countDocuments({ status: 'active' }),
    Canteen.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments(),
  ]);

  return {
    totalStudents: safeCount(totalStudents),
    totalLostFound: safeCount(totalLostFound),
    activeLostItems: safeCount(activeLostItems),
    resolvedLostItems: safeCount(resolvedLostItems),
    totalMemories: safeCount(totalMemories),
    activeMemories: safeCount(activeMemories),
    totalClubs: safeCount(totalClubs),
    activeClubs: safeCount(activeClubs),
    placementPosts: safeCount(placementPosts),
    totalMarketplace: safeCount(totalMarketplace),
    activeMarketplace: safeCount(activeMarketplace),
    totalCanteens: safeCount(totalCanteens),
    totalAdmins: safeCount(totalAdmins),
    totalUsers: safeCount(totalUsers),
  };
};

/**
 * GET CHART DATA
 * All aggregation pipelines executed in parallel
 */
const getChartData = async () => {
  const [
    monthlyUsersRaw,
    monthlyStudentsRaw,
    monthlyMarketplaceRaw,
    monthlyMemoriesRaw,
    weeklyActivityRaw,
    lostFoundStats,
    topLostCategories,
    mostActiveClubs,
    marketplaceStats,
    studentsAVI,
    clubsAVI,
    memoriesAVI,
  ] = await Promise.all([
    aggregation.getMonthlyGrowth(User),
    aggregation.getMonthlyGrowth(Student),
    aggregation.getMonthlyGrowth(Marketplace),
    aggregation.getMonthlyGrowth(Memory),
    aggregation.getWeeklyGrowth(User),
    aggregation.getLostFoundStatusBreakdown(),
    aggregation.getLostFoundCategoryRanking(10),
    aggregation.getMostActiveClubs(10),
    aggregation.getMarketplaceStatusBreakdown(),
    aggregation.getActiveVsInactive(Student, 'isActive'),
    aggregation.getActiveVsInactive(Club, 'isActive'),
    aggregation.getActiveVsInactive(Memory, 'isActive'),
  ]);

  return {
    monthlyUsers: fillMissingMonths(monthlyUsersRaw, 12),
    weeklyActivity: formatWeeklyData(weeklyActivityRaw),
    lostFoundStats,
    topLostCategories,
    mostActiveClubs,
    marketplaceStats,
    activeVsInactive: {
      students: studentsAVI,
      clubs: clubsAVI,
      memories: memoriesAVI,
    },
    monthlyGrowth: {
      students: fillMissingMonths(monthlyStudentsRaw, 12),
      marketplace: fillMissingMonths(monthlyMarketplaceRaw, 12),
      memories: fillMissingMonths(monthlyMemoriesRaw, 12),
    },
  };
};

/**
 * GET RECENT ACTIVITIES (paginated)
 */
const getRecentActivities = async (page = 1, limit = 20) => {
  const activities = await aggregation.getRecentActivityFeed(limit * page);
  const paginated = activities.slice((page - 1) * limit, page * limit);
  const pagination = buildPaginationMeta(page, limit, activities.length);
  return { activities: paginated, pagination };
};

/**
 * GET LATEST MEMORIES (paginated)
 */
const getLatestMemories = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [memories, total] = await Promise.all([
    Memory.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title images uploadedBy isActive createdAt')
      .lean(),
    Memory.countDocuments(),
  ]);
  return { memories, pagination: buildPaginationMeta(page, limit, total) };
};

/**
 * GET LATEST MARKETPLACE LISTINGS (paginated)
 */
const getLatestMarketplace = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Marketplace.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('productName price seller status createdAt')
      .lean(),
    Marketplace.countDocuments(),
  ]);
  return { products, pagination: buildPaginationMeta(page, limit, total) };
};

/**
 * GET LATEST PLACEMENT POSTS (paginated)
 */
const getLatestPlacements = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    PlacementExperience.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('companyName role createdBy createdAt')
      .lean(),
    PlacementExperience.countDocuments(),
  ]);
  return { posts, pagination: buildPaginationMeta(page, limit, total) };
};

module.exports = {
  getSummary,
  getChartData,
  getRecentActivities,
  getLatestMemories,
  getLatestMarketplace,
  getLatestPlacements,
};
