/**
 * Analytics Helper — Utility / Formatting Functions
 */

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatMonthlyData = (aggregationResult) => {
  if (!aggregationResult || !aggregationResult.length) return [];
  return aggregationResult.map((item) => ({
    month: MONTH_NAMES[item._id.month - 1] || 'Unknown',
    year: item._id.year,
    count: item.count,
  }));
};

const fillMissingMonths = (data, monthsBack = 12) => {
  const now = new Date();
  const filled = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const existing = data.find(
      (d) => d._id.year === year && d._id.month === month
    );
    filled.push({
      month: MONTH_NAMES[month - 1],
      year,
      count: existing ? existing.count : 0,
    });
  }
  return filled;
};

const formatWeeklyData = (aggregationResult) => {
  if (!aggregationResult || !aggregationResult.length) return [];
  return aggregationResult.map((item) => ({
    day: DAY_NAMES[item._id.dayOfWeek - 1] || 'Unknown',
    date: `${item._id.day} ${MONTH_NAMES[item._id.month - 1]}`,
    count: item.count,
  }));
};

const formatPieChart = (data, labelKey = 'label', valueKey = 'value') => {
  if (!data || !data.length) return [];
  return data.map((item) => ({
    label: item[labelKey] || 'Unknown',
    value: item[valueKey] || 0,
  }));
};

const formatBarChart = (data, labelKey = 'label', countKey = 'count') => {
  if (!data || !data.length) return [];
  return data.map((item) => ({
    label: item[labelKey] || 'Unknown',
    count: item[countKey] || 0,
  }));
};

const safeCount = (value) => {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : 0;
};

const buildPaginationMeta = (page, limit, totalDocs) => {
  const totalPages = Math.ceil(totalDocs / limit);
  return {
    currentPage: page,
    totalPages,
    totalDocs,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  MONTH_NAMES,
  DAY_NAMES,
  formatMonthlyData,
  fillMissingMonths,
  formatWeeklyData,
  formatPieChart,
  formatBarChart,
  safeCount,
  buildPaginationMeta,
};
