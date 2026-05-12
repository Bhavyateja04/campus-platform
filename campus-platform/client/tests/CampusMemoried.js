// ============================================================================
// Test API - Campus Memories
// ============================================================================
// Mock API for CampusMemoriesScreen development and testing
// Includes in-memory memory store and content moderation mock
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
// Configuration
// ============================================================================

/**
 * Toggle to simulate content moderation rejections in test mode
 * When true, posts containing "bad" or "hate" will be rejected
 */
const SIMULATE_MODERATION_REJECTION = false;

// ============================================================================
// In-Memory Store
// ============================================================================

/**
 * Mock memory store (mutable for testing)
 * Each memory has: _id, title, description, imageUrl, authorId, createdAt
 */
let _memories = [
  {
    _id: 'b1',
    title: 'Graduation',
    description:
      "Graduation day — the moment we've all been waiting for! 🎓 Four years of hard work, late nights, and unforgettable memories. So proud of our batch! #AdityaUniversity #Class2025",
    imageUrl:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    authorId: { name: 'Arjun Mehta', rollNumber: '21CSE4501' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'b2',
    title: 'Friends',
    description:
      "Squad goals 🔥 College would be nothing without these people. Every laugh, every chai break — all with my favourites! ❤️ #SquadForLife #CollegeDays",
    imageUrl:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    authorId: { name: 'Sneha Reddy', rollNumber: '22ECE3302' },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'b3',
    title: 'Sports',
    description:
      'Inter-college cricket tournament 🏏 We brought the trophy home!! CHAMPIONS! 🏆 #Cricket #AdityaSports #Champions',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    authorId: { name: 'Kiran Babu', rollNumber: '21CSE7701' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// Memories API
// ============================================================================

/**
 * Mock Memories API
 * Mirrors the real api shape used in CampusMemoriesScreen
 */
export const memoriesApi = {
  /**
   * Fetches all memories
   * @returns {Promise<Array>} Array of memory objects
   */
  list: async () => {
    await delay(600);
    return [..._memories];
  },

  /**
   * Creates a new memory
   * @param {Object} data - Memory data
   * @param {string} data.title - Memory title
   * @param {string} data.description - Memory description/caption
   * @param {string} data.imageUrl - Memory image URL (optional)
   * @returns {Promise<{memory: Object}>} Created memory object
   */
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

  /**
   * Updates a memory
   * @param {string} id - Memory ID
   * @param {Object} data - Update data
   * @param {string} data.description - Updated description
   * @returns {Promise<{memory: Object}>} Updated memory object
   */
  update: async (id, { description }) => {
    await delay(300);
    _memories = _memories.map((m) =>
      String(m._id) === String(id) ? { ...m, description } : m,
    );
    const updated = _memories.find((m) => String(m._id) === String(id));
    return { memory: updated };
  },

  /**
   * Deletes a memory
   * @param {string} id - Memory ID
   * @returns {Promise<{success: boolean}>}
   */
  remove: async (id) => {
    await delay(300);
    _memories = _memories.filter((m) => String(m._id) !== String(id));
    return { success: true };
  },
};

// ============================================================================
// User API
// ============================================================================

/**
 * Fetches current logged-in user information
 * @returns {Promise<{name: string, rollNumber: string, avatar: string}>}
 */
export const getUser = async () => {
  await delay(200);
  return {
    name: 'Varshitha',
    rollNumber: '22BCE7890',
    avatar: 'V',
  };
};

// ============================================================================
// Content Moderation API
// ============================================================================

/**
 * Mock Content Moderation API
 * Tests content safety before posting
 * Set SIMULATE_MODERATION_REJECTION to true to test rejection flow
 */
export const moderationApi = {
  /**
   * Checks if memory content is safe to post
   * @param {Object} data - Content to moderate
   * @param {string} data.description - Memory description/caption text
   * @param {string} data.imageUri - Memory image URI (optional)
   * @returns {Promise<{safe: boolean, reason: string}>}
   *   - safe: true  → Content is allowed, post proceeds
   *   - safe: false → Content rejected, show reason to user
   */
  memory: async ({ description, imageUri }) => {
    // Simulate AI moderation latency
    await delay(800);

    // Test rejection scenario
    if (SIMULATE_MODERATION_REJECTION) {
      const lowerDescription = (description || '').toLowerCase();
      if (
        lowerDescription.includes('bad') ||
        lowerDescription.includes('hate')
      ) {
        return {
          safe: false,
          reason:
            'This content contains language that violates our community guidelines. Please keep posts positive and respectful.',
        };
      }
    }

    // Content passed moderation
    return { safe: true, reason: '' };
  },
};

// ============================================================================
// Testing & Debugging Helpers
// ============================================================================

/**
 * Adds a custom memory to the mock store
 * Useful for manual testing of specific scenarios
 * @param {Object} memory - Memory object
 */
export function addMockMemory(memory) {
  const newMemory = {
    _id: `b_${Date.now()}`,
    createdAt: new Date().toISOString(),
    authorId: { name: 'Test User', rollNumber: '00TST0000' },
    ...memory,
  };
  _memories.unshift(newMemory);
  return newMemory;
}

/**
 * Resets the mock memory store to initial state
 * Useful for testing fresh app state
 */
export function resetMockMemories() {
  _memories = [
    {
      _id: 'b1',
      title: 'Graduation',
      description:
        "Graduation day — the moment we've all been waiting for! 🎓 Four years of hard work, late nights, and unforgettable memories. So proud of our batch! #AdityaUniversity #Class2025",
      imageUrl:
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
      authorId: { name: 'Arjun Mehta', rollNumber: '21CSE4501' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'b2',
      title: 'Friends',
      description:
        "Squad goals 🔥 College would be nothing without these people. Every laugh, every chai break — all with my favourites! ❤️ #SquadForLife #CollegeDays",
      imageUrl:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
      authorId: { name: 'Sneha Reddy', rollNumber: '22ECE3302' },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'b3',
      title: 'Sports',
      description:
        'Inter-college cricket tournament 🏏 We brought the trophy home!! CHAMPIONS! 🏆 #Cricket #AdityaSports #Champions',
      imageUrl:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      authorId: { name: 'Kiran Babu', rollNumber: '21CSE7701' },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

/**
 * Gets current mock memory count (for debugging)
 * @returns {number} Number of memories in store
 */
export function getMockMemoryCount() {
  return _memories.length;
}

/**
 * Clears all memories from the mock store
 * Useful for testing empty state UI
 */
export function clearAllMockMemories() {
  _memories = [];
}

/**
 * Enables moderation rejection for testing
 * Posts containing "bad" or "hate" will be rejected
 */
export function enableModerationRejection() {
  // This would need to be a mutable config, but for now
  // we can document it requires changing SIMULATE_MODERATION_REJECTION
  console.log('Set SIMULATE_MODERATION_REJECTION = true to test rejection');
}

/**
 * Gets a memory by ID
 * @param {string} id - Memory ID
 * @returns {Object|null} Memory object or null if not found
 */
export function getMockMemoryById(id) {
  return _memories.find((m) => String(m._id) === String(id)) || null;
}
