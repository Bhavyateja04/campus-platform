// ============================================================================
// Test API - Canteen Menu
// ============================================================================
// Mock API for CanteenMenuScreen development and testing
// Supports two backend shapes: nested menu arrays and flat menu items
// Replace with real API calls when backend is ready
// ============================================================================

// ============================================================================
// Utilities
// ============================================================================

/**
 * Simulates network delay for realistic async behavior
 * @param {number} ms - Delay in milliseconds (default: 400)
 * @returns {Promise<void>}
 */
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// ============================================================================
// Backend Data Shapes
// ============================================================================

/**
 * The screen supports TWO backend shapes:
 *
 * SHAPE A: Canteen document with nested menu array
 *   - Structure: canteen._id, canteen.menu[...]
 *   - Normalizer: backendCanteenToMenuRow expands nested array
 *   - Use case: Single API call returns canteen + all menu items
 *
 * SHAPE B: Flat individual menu item documents
 *   - Structure: flat menu items with canteen name as string
 *   - Normalizer: backendCanteenToMenuRow wraps individual items
 *   - Use case: Separate API calls or document per item
 *
 * Both shapes are tested here to verify the normalizer works correctly.
 */

// ============================================================================
// In-Memory Store
// ============================================================================

/**
 * Mock canteen and menu data (mutable for testing)
 * Includes both Shape A (nested) and Shape B (flat) for testing
 */
let _canteens = [
  // ═══════════════════════════════════════════════════════════════════
  // Shape A: Canteen with nested menu array
  // ═══════════════════════════════════════════════════════════════════

  {
    _id: 'c1',
    name: 'Satya Canteen',
    location: 'Main Block Ground Floor',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    menu: [
      {
        name: 'Veg Biryani',
        price: 90,
        available: true,
        image:
          'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
      },
      {
        name: 'Paneer Roll',
        price: 70,
        available: false,
        image:
          'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
      },
      {
        name: 'Veg Sandwich',
        price: 45,
        available: true,
        image:
          'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&q=80',
      },
      {
        name: 'Tea',
        price: 15,
        available: true,
        image:
          'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
      },
    ],
  },

  {
    _id: 'c2',
    name: 'Pencil Canteen',
    location: 'Near Library',
    image:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    menu: [
      {
        name: 'Masala Dosa',
        price: 60,
        available: true,
        image:
          'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      },
      {
        name: 'Idli Sambar',
        price: 40,
        available: true,
        image:
          'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
      },
      {
        name: 'Veg Noodles',
        price: 75,
        available: false,
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Shape B: Flat individual menu item documents
  // ═══════════════════════════════════════════════════════════════════

  {
    _id: 'm10',
    name: 'Chicken Biryani',
    canteen: 'Aparna Canteen',
    price: 120,
    available: true,
    image:
      'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80',
  },
  {
    _id: 'm11',
    name: 'Egg Fried Rice',
    canteen: 'Aparna Canteen',
    price: 85,
    available: true,
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  },
  {
    _id: 'm12',
    name: 'Chicken Burger',
    canteen: 'Aparna Canteen',
    price: 95,
    available: false,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  },
];

// ============================================================================
// Canteens API
// ============================================================================

/**
 * Mock Canteens API
 * Returns mixed Shape A and Shape B data to test normalizer
 */
export const canteensApi = {
  /**
   * Fetches all canteens and menu items
   * Returns mixed Shape A (nested) and Shape B (flat) data
   *
   * Shape A response:
   *   [{_id, name, location, image, menu: [{name, price, available, image}]}]
   *
   * Shape B response:
   *   [{_id, name, canteen, price, available, image}]
   *
   * @returns {Promise<Array>} Array of canteen documents (mixed shapes)
   */
  list: async () => {
    await delay(600);
    return _canteens;
  },
};

// ============================================================================
// Testing & Debugging Helpers
// ============================================================================

/**
 * Adds a canteen with nested menu (Shape A)
 * @param {Object} canteen - Canteen data
 * @param {string} canteen.name - Canteen name
 * @param {string} canteen.location - Canteen location
 * @param {string} canteen.image - Canteen image URL
 * @param {Array} canteen.menu - Array of menu items
 * @returns {Object} Created canteen
 */
export function addMockCanteen(canteen) {
  const newCanteen = {
    _id: `c_${Date.now()}`,
    ...canteen,
    menu: canteen.menu || [],
  };
  _canteens.unshift(newCanteen);
  return newCanteen;
}

/**
 * Adds a flat menu item (Shape B)
 * @param {Object} item - Menu item data
 * @param {string} item.name - Item name
 * @param {string} item.canteen - Canteen name
 * @param {number} item.price - Item price
 * @param {boolean} item.available - Availability status
 * @param {string} item.image - Item image URL
 * @returns {Object} Created menu item
 */
export function addMockMenuItem(item) {
  const newItem = {
    _id: `m_${Date.now()}`,
    ...item,
  };
  _canteens.push(newItem);
  return newItem;
}

/**
 * Resets the mock canteen store to initial state
 * Useful for testing fresh app state
 */
export function resetMockCanteens() {
  _canteens = [
    {
      _id: 'c1',
      name: 'Satya Canteen',
      location: 'Main Block Ground Floor',
      image:
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
      menu: [
        {
          name: 'Veg Biryani',
          price: 90,
          available: true,
          image:
            'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
        },
        {
          name: 'Paneer Roll',
          price: 70,
          available: false,
          image:
            'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
        },
        {
          name: 'Veg Sandwich',
          price: 45,
          available: true,
          image:
            'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&q=80',
        },
        {
          name: 'Tea',
          price: 15,
          available: true,
          image:
            'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
        },
      ],
    },
    {
      _id: 'c2',
      name: 'Pencil Canteen',
      location: 'Near Library',
      image:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      menu: [
        {
          name: 'Masala Dosa',
          price: 60,
          available: true,
          image:
            'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
        },
        {
          name: 'Idli Sambar',
          price: 40,
          available: true,
          image:
            'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
        },
        {
          name: 'Veg Noodles',
          price: 75,
          available: false,
          image:
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
        },
      ],
    },
    {
      _id: 'm10',
      name: 'Chicken Biryani',
      canteen: 'Aparna Canteen',
      price: 120,
      available: true,
      image:
        'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80',
    },
    {
      _id: 'm11',
      name: 'Egg Fried Rice',
      canteen: 'Aparna Canteen',
      price: 85,
      available: true,
      image:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    },
    {
      _id: 'm12',
      name: 'Chicken Burger',
      canteen: 'Aparna Canteen',
      price: 95,
      available: false,
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    },
  ];
}

/**
 * Gets current mock canteen/menu count
 * @returns {number} Total items in store
 */
export function getMockCanteenCount() {
  return _canteens.length;
}

/**
 * Clears all canteen data from the mock store
 * Useful for testing empty state UI
 */
export function clearAllMockCanteens() {
  _canteens = [];
}

/**
 * Gets available items count
 * @returns {number} Number of available menu items
 */
export function getAvailableItemsCount() {
  return _canteens.filter(
    (item) =>
      item.available === true ||
      (item.menu && item.menu.some((m) => m.available === true)),
  ).length;
}

/**
 * Gets unavailable items count
 * @returns {number} Number of unavailable menu items
 */
export function getUnavailableItemsCount() {
  return _canteens.filter(
    (item) =>
      item.available === false ||
      (item.menu && item.menu.some((m) => m.available === false)),
  ).length;
}

/**
 * Gets total price of all available items
 * @returns {number} Sum of all available item prices
 */
export function getTotalAvailablePrice() {
  let total = 0;

  _canteens.forEach((item) => {
    if (item.menu) {
      // Shape A: canteen with nested menu
      item.menu.forEach((menuItem) => {
        if (menuItem.available) total += menuItem.price;
      });
    } else if (item.available) {
      // Shape B: flat menu item
      total += item.price;
    }
  });

  return total;
}
