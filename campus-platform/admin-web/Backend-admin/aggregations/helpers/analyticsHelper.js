```js id="jlwmrr"
// ======================================================
// ANALYTICS HELPERS
// Utility Functions for Dashboard Formatting
// ======================================================


// ======================================================
// CONSTANTS
// ======================================================

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];


// ======================================================
// MONTHLY DATA FORMATTERS
// ======================================================

/**
 * Format monthly aggregation response
 */
const formatMonthlyData = (
  aggregationResult
) => {
  if (
    !aggregationResult ||
    !aggregationResult.length
  ) {
    return [];
  }

  return aggregationResult.map((item) => ({
    month:
      MONTH_NAMES[item._id.month - 1] ||
      "Unknown",

    year: item._id.year,

    count: item.count,
  }));
};


/**
 * Fill missing months with zero counts
 */
const fillMissingMonths = (
  data,
  monthsBack = 12
) => {
  const currentDate = new Date();

  const filledMonths = [];

  for (
    let index = monthsBack - 1;
    index >= 0;
    index--
  ) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - index,
      1
    );

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const existingMonth = data.find(
      (item) =>
        item._id.year === year &&
        item._id.month === month
    );

    filledMonths.push({
      month: MONTH_NAMES[month - 1],

      year,

      count: existingMonth
        ? existingMonth.count
        : 0,
    });
  }

  return filledMonths;
};


// ======================================================
// WEEKLY DATA FORMATTERS
// ======================================================

/**
 * Format weekly aggregation response
 */
const formatWeeklyData = (
  aggregationResult
) => {
  if (
    !aggregationResult ||
    !aggregationResult.length
  ) {
    return [];
  }

  return aggregationResult.map((item) => ({
    day:
      DAY_NAMES[item._id.dayOfWeek - 1] ||
      "Unknown",

    date: `${item._id.day} ${
      MONTH_NAMES[item._id.month - 1]
    }`,

    count: item.count,
  }));
};


// ======================================================
// CHART FORMATTERS
// ======================================================

/**
 * Format pie chart data
 */
const formatPieChart = (
  data,
  labelKey = "label",
  valueKey = "value"
) => {
  if (!data || !data.length) {
    return [];
  }

  return data.map((item) => ({
    label: item[labelKey] || "Unknown",

    value: item[valueKey] || 0,
  }));
};


/**
 * Format bar chart data
 */
const formatBarChart = (
  data,
  labelKey = "label",
  countKey = "count"
) => {
  if (!data || !data.length) {
    return [];
  }

  return data.map((item) => ({
    label: item[labelKey] || "Unknown",

    count: item[countKey] || 0,
  }));
};


// ======================================================
// GENERIC HELPERS
// ======================================================

/**
 * Safely return numeric count
 */
const safeCount = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  return typeof value === "number"
    ? value
    : 0;
};


/**
 * Build pagination metadata object
 */
const buildPaginationMeta = (
  page,
  limit,
  totalDocs
) => {
  const totalPages = Math.ceil(
    totalDocs / limit
  );

  return {
    currentPage: page,

    totalPages,

    totalDocs,

    limit,

    hasNextPage: page < totalPages,

    hasPrevPage: page > 1,
  };
};


// ======================================================
// EXPORTS
// ======================================================

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
```
