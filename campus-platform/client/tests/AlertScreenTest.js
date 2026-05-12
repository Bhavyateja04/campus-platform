// ─────────────────────────────────────────
//  test-api.js  →  AlertsScreen
// ─────────────────────────────────────────

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// ── Mock notification store (mutable in-memory) ──
let _notifications = [
  {
    id: '1',
    type: 'Academic',
    icon: 'book-outline',
    color: '#4A6FA5',
    title: 'Mid Semester Exams',
    body: 'Mid semester exams scheduled from Nov 18–24. Hall tickets available in Exam Locator.',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),       // 2 min ago
    unread: true,
  },
  {
    id: '2',
    type: 'Events',
    icon: 'trophy-outline',
    color: '#E07B3A',
    title: 'Hackathon 2025 — Registration Open!',
    body: 'Register before Nov 15 for the Annual University Hackathon. Prizes worth ₹2 Lakh.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),  // 1 hr ago
    unread: true,
  },
  {
    id: '3',
    type: 'Clubs',
    icon: 'people-outline',
    color: '#6A1B9A',
    title: 'Coding Club — Weekly Meet',
    body: 'This Saturday at 10AM in Lab 3. Topic: Competitive Programming with C++.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),  // 3 hrs ago
    unread: true,
  },
  {
    id: '4',
    type: 'Academic',
    icon: 'document-text-outline',
    color: '#4A6FA5',
    title: 'Assignment Deadline Reminder',
    body: 'DS Lab assignment due tomorrow 11:59 PM. Submit via the college portal.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),  // 5 hrs ago
    unread: false,
  },
  {
    id: '5',
    type: 'System',
    icon: 'settings-outline',
    color: '#00796B',
    title: 'Campix Update Available',
    body: 'New version 1.1.0 is ready. Includes Campus Memories, improved Lost & Found.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    unread: false,
  },
  {
    id: '6',
    type: 'Events',
    icon: 'musical-notes-outline',
    color: '#E07B3A',
    title: 'Cultural Fest — Aditya Mahotsav',
    body: 'Three-day cultural fest kicks off Nov 22. Registrations close Nov 19.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    unread: false,
  },
  {
    id: '7',
    type: 'Academic',
    icon: 'library-outline',
    color: '#4A6FA5',
    title: 'Library Hours Extended',
    body: 'Library will remain open till 10 PM during exam season (Nov 14–24).',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    unread: false,
  },
  {
    id: '8',
    type: 'Clubs',
    icon: 'camera-outline',
    color: '#6A1B9A',
    title: 'Photography Club: Campus Walk',
    body: 'Join us Sunday 7AM for the golden hour campus photography session.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    unread: false,
  },
];

// ── notificationsApi (mirrors real api shape used in screen) ──
export const notificationsApi = {

  // GET /notifications  →  { data: [...] }
  list: async () => {
    await delay(500);
    return { data: _notifications };
  },

  // PATCH /notifications/:id/read
  markRead: async (id) => {
    await delay(200);
    _notifications = _notifications.map(n =>
      n.id === id ? { ...n, unread: false } : n
    );
    return { success: true, id };
  },

  // PATCH /notifications/read-all
  markAllRead: async () => {
    await delay(250);
    _notifications = _notifications.map(n => ({ ...n, unread: false }));
    return { success: true };
  },
};

// ── Simulated socket (mirrors getSocket() used in screen) ──
//    In test mode this is a lightweight EventEmitter so real-time
//    listeners inside the screen don't crash.
const _listeners = {};

export const getSocket = () => ({
  on: (event, cb) => {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(cb);
  },
  off: (event, cb) => {
    if (_listeners[event]) {
      _listeners[event] = _listeners[event].filter(fn => fn !== cb);
    }
  },
  // Helper: call this in dev/test to simulate a real-time push
  emit: (event, payload) => {
    (_listeners[event] || []).forEach(fn => fn(payload));
  },
});

// ── Optional: simulate a new notification push after 8s ──
//    Uncomment to test real-time UI refresh in dev mode.
//
// setTimeout(() => {
//   _notifications.unshift({
//     id: String(Date.now()),
//     type: 'System',
//     icon: 'flash-outline',
//     color: '#FFB300',
//     title: 'Test Push Notification',
//     body: 'This was pushed via the mock socket.',
//     createdAt: new Date().toISOString(),
//     unread: true,
//   });
//   getSocket().emit('notifications:changed');
// }, 8000);