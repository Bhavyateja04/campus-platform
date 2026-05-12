// ─────────────────────────────────────────
//  test-api.js  →  CampusMemoriesScreen
// ─────────────────────────────────────────

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// ── In-memory store (mutable) ────────────
let _memories = [
  {
    _id: 'b1',
    title: 'Graduation',
    description:
      "Graduation day — the moment we've all been waiting for! 🎓 Four years of hard work, late nights, and unforgettable memories. So proud of our batch! #AdityaUniversity #Class2025",
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    authorId: { name: 'Arjun Mehta', rollNumber: '21CSE4501' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'b2',
    title: 'Friends',
    description:
      "Squad goals 🔥 College would be nothing without these people. Every laugh, every chai break — all with my favourites! ❤️ #SquadForLife #CollegeDays",
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    authorId: { name: 'Sneha Reddy', rollNumber: '22ECE3302' },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'b3',
    title: 'Sports',
    description:
      "Inter-college cricket tournament 🏏 We brought the trophy home!! CHAMPIONS! 🏆 #Cricket #AdityaSports #Champions",
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    authorId: { name: 'Kiran Babu', rollNumber: '21CSE7701' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── memoriesApi (mirrors real api shape used in screen) ──
export const memoriesApi = {

  // GET /memories  →  array of memory objects
  list: async () => {
    await delay(600);
    return [..._memories];
  },

  // POST /memories  →  { memory: {...} }
  create: async ({ title, description, imageUrl }) => {
    await delay(500);
    const newMemory = {
      _id: `b_${Date.now()}`,
      title: title || 'Memory',
      description: description || '',
      imageUrl: imageUrl || null,
      authorId: { name: 'Varshitha', rollNumber: '22BCE7890' },
      createdAt: new Date().toISOString(),
    };
    _memories.unshift(newMemory);
    return { memory: newMemory };
  },

  // PATCH /memories/:id  →  { memory: {...} }
  update: async (id, { description }) => {
    await delay(300);
    _memories = _memories.map(m =>
      String(m._id) === String(id) ? { ...m, description } : m
    );
    const updated = _memories.find(m => String(m._id) === String(id));
    return { memory: updated };
  },

  // DELETE /memories/:id  →  { success: true }
  remove: async (id) => {
    await delay(300);
    _memories = _memories.filter(m => String(m._id) !== String(id));
    return { success: true };
  },
};

// ── getUser (returns logged-in user info) ──
export const getUser = async () => {
  await delay(200);
  return {
    name: 'Varshitha',
    rollNumber: '22BCE7890',
    avatar: 'V',
  };
};

// ── moderationApi (mirrors real moderation route) ──
//
//  safe: true  →  post is allowed
//  safe: false →  ModerationModal fires with `reason`
//
//  To test rejection: set SIMULATE_REJECTION = true
//  and any post with the word "bad" in description will be blocked.

const SIMULATE_REJECTION = false;

export const moderationApi = {

  // POST /moderation/memory  →  { safe: bool, reason: string }
  memory: async ({ description, imageUri }) => {
    await delay(800); // simulate AI latency

    if (SIMULATE_REJECTION) {
      const lower = (description || '').toLowerCase();
      if (lower.includes('bad') || lower.includes('hate')) {
        return {
          safe: false,
          reason:
            'This content contains language that violates our community guidelines. Please keep posts positive and respectful.',
        };
      }
    }

    return { safe: true, reason: '' };
  },
};