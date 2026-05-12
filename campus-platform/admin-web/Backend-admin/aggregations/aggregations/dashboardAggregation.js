```js
// ======================================================
// IMPORTS
// ======================================================

const Student = require("../models/Student");
const LostFound = require("../models/LostFound");
const Memory = require("../models/Memory");
const Club = require("../models/Club");
const PlacementExperience = require("../models/PlacementExperience");
const Marketplace = require("../models/Marketplace");
const Canteen = require("../models/Canteen");
const User = require("../models/User");


// ======================================================
// GENERIC ANALYTICS HELPERS
// ======================================================

/**
 * Get monthly growth statistics
 * Returns document count grouped by month/year
 */
const getMonthlyGrowth = async (Model, months = 12) => {
  const startDate = new Date();

  startDate.setMonth(startDate.getMonth() - months);

  return Model.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
        },
      },
    },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },

        count: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);
};


/**
 * Get last 7 days growth statistics
 */
const getWeeklyGrowth = async (Model) => {
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - 7);

  return Model.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
        },
      },
    },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          dayOfWeek: { $dayOfWeek: "$createdAt" },
        },

        count: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ]);
};


/**
 * Get active vs inactive records
 */
const getActiveVsInactive = async (
  Model,
  field = "isActive"
) => {
  const result = await Model.aggregate([
    {
      $group: {
        _id: `$${field}`,

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const active =
    result.find((item) => item._id === true)
      ?.count || 0;

  const inactive =
    result.find((item) => item._id === false)
      ?.count || 0;

  return {
    active,
    inactive,
  };
};


// ======================================================
// LOST & FOUND ANALYTICS
// ======================================================

/**
 * Lost & Found status breakdown
 */
const getLostFoundStatusBreakdown = async () => {
  return LostFound.aggregate([
    {
      $group: {
        _id: "$status",

        count: {
          $sum: 1,
        },
      },
    },

    {
      $project: {
        _id: 0,

        label: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: ["$_id", "active"],
                },
                then: "Active",
              },

              {
                case: {
                  $eq: ["$_id", "resolved"],
                },
                then: "Resolved",
              },

              {
                case: {
                  $eq: ["$_id", "claimed"],
                },
                then: "Claimed",
              },
            ],

            default: "$_id",
          },
        },

        value: "$count",
      },
    },
  ]);
};


/**
 * Top lost & found categories
 */
const getLostFoundCategoryRanking = async (
  topN = 10
) => {
  return LostFound.aggregate([
    {
      $group: {
        _id: "$category",

        count: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        count: -1,
      },
    },

    {
      $limit: topN,
    },

    {
      $project: {
        _id: 0,
        label: "$_id",
        count: "$count",
      },
    },
  ]);
};


// ======================================================
// CLUB ANALYTICS
// ======================================================

/**
 * Get most active clubs
 */
const getMostActiveClubs = async (
  topN = 10
) => {
  return Club.aggregate([
    {
      $project: {
        clubName: 1,
        isActive: 1,

        memberCount: {
          $size: {
            $ifNull: ["$members", []],
          },
        },
      },
    },

    {
      $sort: {
        memberCount: -1,
      },
    },

    {
      $limit: topN,
    },
  ]);
};


// ======================================================
// USER ANALYTICS
// ======================================================

/**
 * Monthly user registration statistics
 */
const getMonthlyUserRegistrations = async () => {
  return getMonthlyGrowth(User, 12);
};


// ======================================================
// RECENT ACTIVITY FEED
// ======================================================

/**
 * Unified recent activity feed
 */
const getRecentActivityFeed = async (
  limit = 20
) => {
  const recentLimit =
    Math.ceil(limit / 5) + 2;

  const [
    recentMemories,
    recentLostItems,
    recentMarketplaceItems,
    recentPlacements,
    recentClubs,
  ] = await Promise.all([
    Memory.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select("title uploadedBy createdAt")
      .lean(),

    LostFound.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select(
        "itemName category status reportedBy createdAt"
      )
      .lean(),

    Marketplace.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select(
        "productName price seller status createdAt"
      )
      .lean(),

    PlacementExperience.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select(
        "companyName role createdBy createdAt"
      )
      .lean(),

    Club.find()
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select(
        "clubName isActive createdAt"
      )
      .lean(),
  ]);

  // ==============================
  // NORMALIZE ACTIVITIES
  // ==============================

  const activities = [
    ...recentMemories.map((memory) => ({
      type: "memory",

      title: `New memory uploaded: ${memory.title}`,

      user: memory.uploadedBy,

      createdAt: memory.createdAt,

      metadata: {
        memoryId: memory._id,
      },
    })),

    ...recentLostItems.map((item) => ({
      type: "lost_found",

      title: `Lost item reported: ${item.itemName}`,

      user: item.reportedBy,

      createdAt: item.createdAt,

      metadata: {
        itemId: item._id,
        category: item.category,
        status: item.status,
      },
    })),

    ...recentMarketplaceItems.map((product) => ({
      type: "marketplace",

      title: `New product listed: ${product.productName}`,

      user: product.seller,

      createdAt: product.createdAt,

      metadata: {
        productId: product._id,
        price: product.price,
        status: product.status,
      },
    })),

    ...recentPlacements.map((placement) => ({
      type: "placement",

      title: `Placement experience: ${placement.companyName} — ${placement.role}`,

      user: placement.createdBy,

      createdAt: placement.createdAt,

      metadata: {
        placementId: placement._id,
      },
    })),

    ...recentClubs.map((club) => ({
      type: "club",

      title: `Club registered: ${club.clubName}`,

      user: null,

      createdAt: club.createdAt,

      metadata: {
        clubId: club._id,
        isActive: club.isActive,
      },
    })),
  ];

  // ==============================
  // SORT & LIMIT
  // ==============================

  activities.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  return activities.slice(0, limit);
};


// ======================================================
// MARKETPLACE ANALYTICS
// ======================================================

/**
 * Marketplace status breakdown
 */
const getMarketplaceStatusBreakdown =
  async () => {
    return Marketplace.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,

          label: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ["$_id", "active"],
                  },
                  then: "Active",
                },

                {
                  case: {
                    $eq: ["$_id", "sold"],
                  },
                  then: "Sold",
                },

                {
                  case: {
                    $eq: ["$_id", "removed"],
                  },
                  then: "Removed",
                },
              ],

              default: "$_id",
            },
          },

          value: "$count",
        },
      },
    ]);
  };


// ======================================================
// EXPORTS
// ======================================================

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
```
