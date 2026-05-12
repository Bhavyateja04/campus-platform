/**
 * Application-wide constants.
 */

// Status values for image analysis
const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REJECTED: 'rejected',
};

// Valid item categories — only these are saved to MongoDB
const VALID_CATEGORIES = ['stationery', 'electronics', 'books', 'accessories'];

// Image categories
const IMAGE_CATEGORIES = {
  STATIONERY: 'stationery',
  ELECTRONICS: 'electronics',
  BOOKS: 'books',
  ACCESSORIES: 'accessories',
  UNKNOWN: 'unknown',
};

// Category keyword mapping for items
const CATEGORY_KEYWORDS = {
  [IMAGE_CATEGORIES.STATIONERY]: [
    'pen', 'pencil', 'eraser', 'ruler', 'marker', 'notebook', 'paper',
    'stapler', 'scissors', 'tape', 'glue', 'highlighter', 'folder',
    'binder', 'sticky note', 'envelope', 'clip', 'sharpener',
  ],
  [IMAGE_CATEGORIES.ELECTRONICS]: [
    'phone', 'laptop', 'tablet', 'charger', 'earphone', 'headphone',
    'power bank', 'usb', 'cable', 'keyboard', 'mouse', 'calculator',
    'smartwatch', 'speaker', 'camera', 'monitor',
  ],
  [IMAGE_CATEGORIES.BOOKS]: [
    'textbook', 'novel', 'book', 'magazine', 'journal', 'dictionary',
    'comic', 'study guide', 'reference',
  ],
  [IMAGE_CATEGORIES.ACCESSORIES]: [
    'bag', 'backpack', 'wallet', 'keychain', 'water bottle', 'lunchbox',
    'umbrella', 'glasses', 'sunglasses', 'watch', 'cap', 'scarf',
    'id card', 'lanyard',
  ],
};

// User roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp',
];

module.exports = {
  ANALYSIS_STATUS,
  VALID_CATEGORIES,
  IMAGE_CATEGORIES,
  CATEGORY_KEYWORDS,
  USER_ROLES,
  ALLOWED_IMAGE_TYPES,
};
