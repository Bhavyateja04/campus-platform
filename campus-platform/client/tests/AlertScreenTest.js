// ============================================================================
// Test API - Notifications/Alerts
// ============================================================================
// Mock API for AlertsScreen development and testing
// Includes in-memory notification store and simulated socket
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
// In-Memory Store
// ============================================================================

/**
 * Mock notification store (mutable for testing)
 * Each notification has: id, type, icon, color, title, body, createdAt, unread
 */
let _notifications = [
  {
    id: '1',
    type: 'Academic',
    icon: 'book-outline',
    color: '#4A6FA5',
    title: 'Mid Semester Exams',
    body: 'Mid semester exams scheduled from Nov 18–24. Hall tickets available in Exam Locator.',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: '2',
    type: 'Events',
    icon: 'trophy-outline',
    color: '#E07B3A',
    title: 'Hackathon 2025 — Registration Open!',
    body: 'Register before Nov 15 for the Annual University Hackathon. Prizes worth ₹2 Lakh.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: '3',
    type: 'Clubs',
    icon: 'people-outline',
    color: '#6A1B9A',
    title: 'Coding Club — Weekly Meet',
    body: 'This Saturday at 10AM in Lab 3. Topic: Competitive Programming with C++.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: '4',
    type: 'Academic',
    icon: 'document-text-outline',
    color: '#4A6FA5',
    title: 'Assignment Deadline Reminder',
    body: 'DS Lab assignment due tomorrow 11:59 PM. Submit via the college portal.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unread: false,
  },
  {
    id: '5',
    type: 'System',
    icon: 'settings-outline',
    color: '#00796B',
    title: 'Campix Update Available',
    body: 'New version 1.1.0 is ready. Includes Campus Memories, improved Lost & Found.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unread: false,
  },
  {
    id: '6',
    type: 'Events',
    icon: 'musical-notes-outline',
    color: '#E07B3A',
    title: 'Cultural Fest — Aditya Mahotsav',
    body: 'Three-day cultural fest kicks off Nov 22. Registrations close Nov 19.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unread: false,
  },
  {
    id: '7',
    type: 'Academic',
    icon: 'library-outline',
    color: '#4A6FA5',
    title: 'Library Hours Extended',
    body: 'Library will remain open till 10 PM during exam season (Nov 14–24).',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unread: false,
  },
  {
    id: '8',
    type: 'Clubs',
    icon: 'camera-outline',
    color: '#6A1B9A',
    title: 'Photography Club: Campus Walk',
    body: 'Join us Sunday 7AM for the golden hour campus photography session.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    unread: false,
  },
];

// ============================================================================
// Notifications API
// ============================================================================

/**
 * Mock Notifications API
 * Mirrors the real api shape used in AlertsScreen
 */
export const notificationsApi = {
  /**
   * Fetches all notifications
   * @returns {Promise<{data: Array}>} Object containing notifications array
   */
  list: async () => {
    await delay(500);
    return { data: _notifications };
  },

  /**
   * Marks a single notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<{success: boolean, id: string}>}
   */
  markRead: async (id) => {
    await delay(200);
    _notifications = _notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n,
    );
    return { success: true, id };
  },

  /**
   * Marks all notifications as read
   * @returns {Promise<{success: boolean}>}
   */
  markAllRead: async () => {
    await delay(250);
    _notifications = _notifications.map((n) => ({ ...n, unread: false }));
    return { success: true };
  },
};

// ============================================================================
// Socket.IO Mock
// ============================================================================

/**
 * Lightweight EventEmitter implementation for testing
 * Mirrors the getSocket() interface used in AlertsScreen
 */
const _listeners = {};

/**
 * Gets a mock socket instance for testing
 * Prevents crashes when real-time listeners are used in dev mode
 * @returns {Object} Mock socket object with on, off, emit methods
 */
export const getSocket = () => ({
  /**
   * Registers an event listener
   * @param {string} event - Event name (e.g., 'notifications:changed')
   * @param {Function} cb - Callback function
   */
  on: (event, cb) => {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(cb);
  },

  /**
   * Removes an event listener
   * @param {string} event - Event name
   * @param {Function} cb - Callback function to remove
   */
  off: (event, cb) => {
    if (_listeners[event]) {
      _listeners[event] = _listeners[event].filter((fn) => fn !== cb);
    }
  },

  /**
   * Helper method to emit events (for testing real-time behavior)
   * @param {string} event - Event name
   * @param {any} payload - Event payload
   */
  emit: (event, payload) => {
    (_listeners[event] || []).forEach((fn) => fn(payload));
  },
});

// ============================================================================
// Testing Helpers
// ============================================================================

/**
 * Optional: Simulates a new notification push after delay
 * Uncomment in test/dev mode to verify real-time UI refresh
 * Emits 'notifications:changed' event via mock socket
 *
 * Usage:
 *   simulateNewNotificationPush(8000);  // Push after 8 seconds
 */
export function simulateNewNotificationPush(delayMs = 8000) {
  setTimeout(() => {
    _notifications.unshift({
      id: String(Date.now()),
      type: 'System',
      icon: 'flash-outline',
      color: '#FFB300',
      title: 'Test Push Notification',
      body: 'This was pushed via the mock socket.',
      createdAt: new Date().toISOString(),
      unread: true,
    });
    getSocket().emit('notifications:changed', {
      id: _notifications[0].id,
      action: 'new',
    });
  }, delayMs);
}

/**
 * Adds a custom notification to the mock store
 * Useful for manual testing of specific scenarios
 * @param {Object} notification - Notification object
 */
export function addMockNotification(notification) {
  _notifications.unshift({
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    unread: true,
    ...notification,
  });
  getSocket().emit('notifications:changed', {
    id: _notifications[0].id,
    action: 'new',
  });
}

/**
 * Resets the mock notification store to initial state
 * Useful for testing fresh app state
 */
export function resetMockNotifications() {
  _notifications = [
    {
      id: '1',
      type: 'Academic',
      icon: 'book-outline',
      color: '#4A6FA5',
      title: 'Mid Semester Exams',
      body: 'Mid semester exams scheduled from Nov 18–24. Hall tickets available in Exam Locator.',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      unread: true,
    },
    {
      id: '2',
      type: 'Events',
      icon: 'trophy-outline',
      color: '#E07B3A',
      title: 'Hackathon 2025 — Registration Open!',
      body: 'Register before Nov 15 for the Annual University Hackathon. Prizes worth ₹2 Lakh.',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      unread: true,
    },
    {
      id: '3',
      type: 'Clubs',
      icon: 'people-outline',
      color: '#6A1B9A',
      title: 'Coding Club — Weekly Meet',
      body: 'This Saturday at 10AM in Lab 3. Topic: Competitive Programming with C++.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      unread: true,
    },
  ];
}

/**
 * Gets current mock notification count (for debugging)
 * @returns {number} Number of notifications in store
 */
export function getMockNotificationCount() {
  return _notifications.length;
}

/**
 * Gets unread notification count
 * @returns {number} Number of unread notifications
 */
export function getUnreadCount() {
  return _notifications.filter((n) => n.unread).length;
}
