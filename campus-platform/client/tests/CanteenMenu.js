// ─────────────────────────────────────────
//  test-api.js  →  CanteenMenuScreen
// ─────────────────────────────────────────

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// ── Mock canteen data ────────────────────
//
//  The screen supports TWO backend shapes:
//    Shape A: canteen document with a nested `menu` array  → backendCanteenToMenuRow expands it
//    Shape B: flat individual menu item documents           → backendCanteenToMenuRow wraps it
//
//  Both are tested here so you can verify the normalizer works.

const _canteens = [

  // ── Shape A: canteen with nested menu array ──
  {
    _id: 'c1',
    name: 'Satya Canteen',
    location: 'Main Block Ground Floor',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    menu: [
      {
        name: 'Veg Biryani',
        price: 90,
        available: true,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
      },
      {
        name: 'Paneer Roll',
        price: 70,
        available: false,
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
      },
      {
        name: 'Veg Sandwich',
        price: 45,
        available: true,
        image: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&q=80',
      },
      {
        name: 'Tea',
        price: 15,
        available: true,
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
      },
    ],
  },

  // ── Shape A: another canteen with nested menu ──
  {
    _id: 'c2',
    name: 'Pencil Canteen',
    location: 'Near Library',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    menu: [
      {
        name: 'Masala Dosa',
        price: 60,
        available: true,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      },
      {
        name: 'Idli Sambar',
        price: 40,
        available: true,
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
      },
      {
        name: 'Veg Noodles',
        price: 75,
        available: false,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
      },
    ],
  },

  // ── Shape B: flat individual menu item documents ──
  {
    _id: 'm10',
    name: 'Chicken Biryani',
    canteen: 'Aparna Canteen',
    price: 120,
    available: true,
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80',
  },
  {
    _id: 'm11',
    name: 'Egg Fried Rice',
    canteen: 'Aparna Canteen',
    price: 85,
    available: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  },
  {
    _id: 'm12',
    name: 'Chicken Burger',
    canteen: 'Aparna Canteen',
    price: 95,
    available: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  },
];

// ── canteensApi (mirrors real api shape used in screen) ──
export const canteensApi = {

  // GET /canteens  →  array (Shape A or B or mixed)
  list: async () => {
    await delay(600);
    return _canteens;
  },
};