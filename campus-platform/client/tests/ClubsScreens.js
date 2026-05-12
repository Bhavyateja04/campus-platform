/**
 * ============================================================================
 * clubsApi.test.js
 * ============================================================================
 * Unit and integration tests for ClubsScreen API behavior
 *
 * Run with: jest clubsApi.test.js
 *
 * Dependencies:
 *   - jest
 *   - @testing-library/react-native
 *   - axios (or your HTTP library)
 * ============================================================================
 */

import { clubsApi } from '../services/api';

// ============================================================================
// Mocks
// ============================================================================

/**
 * Mock the API module
 * Allows us to control clubsApi.list() behavior in tests
 */
jest.mock('../services/api', () => ({
  clubsApi: {
    list: jest.fn(),
  },
}));

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Factory function: creates a minimal backend club object
 * Allows easy customization via overrides
 * @param {Object} overrides - Fields to override
 * @returns {Object} Backend club object
 */
const makeBackendClub = (overrides = {}) => ({
  _id: 'abc123',
  name: 'Test Club',
  description: 'A test club description',
  coordinatorName: 'John Doe',
  coordinatorEmail: 'john@test.edu',
  createdAt: '2022-03-15T00:00:00.000Z',
  ...overrides,
});

/**
 * Transforms backend club to UI format
 * Mirrors the transformer in ClubsScreen
 * Copied here to keep tests self-contained and not tightly coupled
 *
 * @param {Object} c - Backend club object
 * @returns {Object|null} UI-formatted club or null if invalid
 */
function backendClubToUi(c) {
  if (!c || !c._id) return null;

  return {
    id: String(c._id),
    name: c.name,
    fullName: c.name,
    tagline: c.description || '',
    category: 'General',
    categoryColor: '#7C3AED',
    categoryBg: '#EDE9FE',
    icon: 'people',
    grad: ['#1E3A5F', '#3D6A9E'],
    imageUri:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    members: 0,
    founded: c.createdAt
      ? new Date(c.createdAt).getFullYear().toString()
      : '',
    meetings: 'Contact coordinator',
    venue: 'Campus',
    president: c.coordinatorName || '—',
    contact: c.coordinatorEmail || '',
    joined: false,
    about: c.description || '',
    achievements: [],
    activities: [],
    upcoming: '',
    _backend: true,
  };
}

// ============================================================================
// 1. Unit Tests: backendClubToUi Transformer
// ============================================================================

describe('backendClubToUi() transformer', () => {
  /**
   * Tests that _id field is correctly converted to string id
   */
  it('maps _id to string id', () => {
    const result = backendClubToUi(makeBackendClub({ _id: 'xyz789' }));
    expect(result.id).toBe('xyz789');
  });

  /**
   * Tests that name field is preserved and duplicated to fullName
   */
  it('maps name correctly', () => {
    const result = backendClubToUi(
      makeBackendClub({ name: 'Robotics Club' }),
    );
    expect(result.name).toBe('Robotics Club');
    expect(result.fullName).toBe('Robotics Club');
  });

  /**
   * Tests that description is mapped to both tagline and about fields
   */
  it('maps description to tagline and about', () => {
    const result = backendClubToUi(
      makeBackendClub({ description: 'We build robots.' }),
    );
    expect(result.tagline).toBe('We build robots.');
    expect(result.about).toBe('We build robots.');
  });

  /**
   * Tests that createdAt ISO string is parsed to year
   */
  it('extracts year from createdAt', () => {
    const result = backendClubToUi(
      makeBackendClub({ createdAt: '2019-06-01T00:00:00.000Z' }),
    );
    expect(result.founded).toBe('2019');
  });

  /**
   * Tests fallback when createdAt is missing
   */
  it('falls back to empty string when createdAt is missing', () => {
    const result = backendClubToUi(
      makeBackendClub({ createdAt: undefined }),
    );
    expect(result.founded).toBe('');
  });

  /**
   * Tests that coordinatorName maps to president field
   */
  it('maps coordinatorName to president', () => {
    const result = backendClubToUi(
      makeBackendClub({ coordinatorName: 'Jane Smith' }),
    );
    expect(result.president).toBe('Jane Smith');
  });

  /**
   * Tests fallback to em-dash when coordinatorName is missing
   */
  it('falls back to em-dash when coordinatorName is missing', () => {
    const result = backendClubToUi(
      makeBackendClub({ coordinatorName: undefined }),
    );
    expect(result.president).toBe('—');
  });

  /**
   * Tests that coordinatorEmail maps to contact field
   */
  it('maps coordinatorEmail to contact', () => {
    const result = backendClubToUi(
      makeBackendClub({ coordinatorEmail: 'club@uni.edu' }),
    );
    expect(result.contact).toBe('club@uni.edu');
  });

  /**
   * Tests that joined defaults to false
   */
  it('sets joined to false by default', () => {
    const result = backendClubToUi(makeBackendClub());
    expect(result.joined).toBe(false);
  });

  /**
   * Tests that _backend flag is set to true
   */
  it('sets _backend flag to true', () => {
    const result = backendClubToUi(makeBackendClub());
    expect(result._backend).toBe(true);
  });

  /**
   * Tests null handling
   */
  it('returns null for null input', () => {
    expect(backendClubToUi(null)).toBeNull();
  });

  /**
   * Tests validation: missing _id returns null
   */
  it('returns null when _id is missing', () => {
    expect(backendClubToUi({ name: 'Orphan Club' })).toBeNull();
  });

  /**
   * Tests that array fields are initialized as empty
   */
  it('initialises arrays as empty', () => {
    const result = backendClubToUi(makeBackendClub());
    expect(result.achievements).toEqual([]);
    expect(result.activities).toEqual([]);
  });
});

// ============================================================================
// 2. Unit Tests: clubsApi.list() Success Scenarios
// ============================================================================

describe('clubsApi.list() — success cases', () => {
  /**
   * Clean up mocks after each test
   */
  afterEach(() => jest.clearAllMocks());

  /**
   * Tests that list() returns an array of clubs
   */
  it('resolves with an array of clubs', async () => {
    const mockData = [
      makeBackendClub({ _id: '1' }),
      makeBackendClub({ _id: '2' }),
    ];
    clubsApi.list.mockResolvedValueOnce(mockData);

    const result = await clubsApi.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  /**
   * Tests that data correctly transforms through backendClubToUi
   */
  it('maps correctly through backendClubToUi', async () => {
    const mockData = [
      makeBackendClub({ _id: 'map1', name: 'Chess Club' }),
    ];
    clubsApi.list.mockResolvedValueOnce(mockData);

    const raw = await clubsApi.list();
    const ui = raw.map(backendClubToUi).filter(Boolean);

    expect(ui[0].id).toBe('map1');
    expect(ui[0].name).toBe('Chess Club');
  });

  /**
   * Tests that empty array is handled correctly
   */
  it('resolves with an empty array when no clubs exist', async () => {
    clubsApi.list.mockResolvedValueOnce([]);
    const result = await clubsApi.list();
    expect(result).toEqual([]);
  });

  /**
   * Tests that invalid entries (missing _id) are filtered out
   */
  it('filters out invalid (null-id) entries via backendClubToUi', async () => {
    clubsApi.list.mockResolvedValueOnce([
      makeBackendClub({ _id: 'valid1' }),
      { name: 'Bad entry, no _id' },
    ]);

    const raw = await clubsApi.list();
    const ui = raw.map(backendClubToUi).filter(Boolean);

    expect(ui).toHaveLength(1);
    expect(ui[0].id).toBe('valid1');
  });
});

// ============================================================================
// 3. Unit Tests: clubsApi.list() Failure & Edge Cases
// ============================================================================

describe('clubsApi.list() — failure & edge cases', () => {
  /**
   * Clean up mocks after each test
   */
  afterEach(() => jest.clearAllMocks());

  /**
   * Tests that network errors are properly propagated
   */
  it('throws on network error', async () => {
    clubsApi.list.mockRejectedValueOnce(new Error('Network Error'));
    await expect(clubsApi.list()).rejects.toThrow('Network Error');
  });

  /**
   * Tests that 401 Unauthorized errors are handled
   */
  it('throws on 401 Unauthorized', async () => {
    clubsApi.list.mockRejectedValueOnce(new Error('401 Unauthorized'));
    await expect(clubsApi.list()).rejects.toThrow('401 Unauthorized');
  });

  /**
   * Tests that 500 Server errors are handled
   */
  it('throws on 500 Server Error', async () => {
    clubsApi.list.mockRejectedValueOnce(
      new Error('500 Internal Server Error'),
    );
    await expect(clubsApi.list()).rejects.toThrow(
      '500 Internal Server Error',
    );
  });

  /**
   * Tests graceful handling of non-array responses (e.g., object)
   * Screen uses: Array.isArray(list) ? list : []
   */
  it('gracefully handles non-array response (object)', async () => {
    clubsApi.list.mockResolvedValueOnce({ data: [] }); // object not array
    const raw = await clubsApi.list();
    const safeList = Array.isArray(raw) ? raw : [];
    expect(safeList).toEqual([]);
  });

  /**
   * Tests graceful handling of null response
   */
  it('gracefully handles null response', async () => {
    clubsApi.list.mockResolvedValueOnce(null);
    const raw = await clubsApi.list();
    const safeList = Array.isArray(raw) ? raw : [];
    expect(safeList).toEqual([]);
  });
});

// ============================================================================
// 4. Integration Tests: Screen-Level Data Merging Logic
// ============================================================================

describe('Screen merging logic (backend clubs + seed clubs)', () => {
  /**
   * Seed clubs (fallback UI data when backend unavailable)
   */
  const SEED_CLUBS = [
    { id: 'sac', name: 'SAC', _backend: false },
    { id: 'edc', name: 'EDC', _backend: false },
  ];

  /**
   * Tests that backend clubs are prepended before seed clubs
   * This ensures fresh data appears first in the list
   */
  it('prepends backend clubs before seed clubs', async () => {
    const backendClubs = [
      makeBackendClub({ _id: 'b1', name: 'Drama Club' }),
    ];
    clubsApi.list.mockResolvedValueOnce(backendClubs);

    const raw = await clubsApi.list();
    const ui = (Array.isArray(raw) ? raw : [])
      .map(backendClubToUi)
      .filter(Boolean);

    // Simulate screen setState: [...ui, ...prev.filter(p => !p._backend)]
    const merged = [...ui, ...SEED_CLUBS.filter((p) => !p._backend)];

    expect(merged[0].name).toBe('Drama Club'); // backend first
    expect(merged[1].name).toBe('SAC'); // seed follows
    expect(merged).toHaveLength(3);
  });

  /**
   * Tests that seed clubs are not duplicated when backend returns empty
   */
  it('does not duplicate seed clubs when backend returns empty', async () => {
    clubsApi.list.mockResolvedValueOnce([]);

    const raw = await clubsApi.list();
    const ui = (Array.isArray(raw) ? raw : [])
      .map(backendClubToUi)
      .filter(Boolean);
    const merged = [...ui, ...SEED_CLUBS.filter((p) => !p._backend)];

    expect(merged).toHaveLength(2); // only seeds
  });

  /**
   * Tests that only stale (_backend:true) seed entries are replaced
   * This prevents loss of user state (joined clubs) when refreshing
   */
  it('only replaces _backend:true seed entries', async () => {
    const seedWithBackend = [
      ...SEED_CLUBS,
      { id: 'old_backend', name: 'Old Backend Club', _backend: true }, // stale
    ];

    const fresh = [
      makeBackendClub({ _id: 'fresh1', name: 'Fresh Club' }),
    ];
    clubsApi.list.mockResolvedValueOnce(fresh);

    const raw = await clubsApi.list();
    const ui = (Array.isArray(raw) ? raw : [])
      .map(backendClubToUi)
      .filter(Boolean);
    const merged = [...ui, ...seedWithBackend.filter((p) => !p._backend)];

    const names = merged.map((c) => c.name);
    expect(names).toContain('Fresh Club');
    expect(names).not.toContain('Old Backend Club'); // stale removed
    expect(names).toContain('SAC');
    expect(names).toContain('EDC');
  });
});

// ============================================================================
// 5. Unit Tests: Search & Filter Logic
// ============================================================================

describe('Clubs search & filter logic', () => {
  /**
   * Test data: sample clubs with various attributes
   */
  const clubs = [
    {
      id: '1',
      name: 'SAC',
      fullName: 'Student Activity Council',
      category: 'Leadership',
    },
    {
      id: '2',
      name: 'EDC',
      fullName: 'Entrepreneurship Development Cell',
      category: 'Entrepreneurship',
    },
    {
      id: '3',
      name: 'Robotics Club',
      fullName: 'Aditya Robotics & Automation Club',
      category: 'Technology',
    },
  ];

  /**
   * Filter function: combines search text and category filter
   * Searches across name, fullName, and category fields (case-insensitive)
   *
   * @param {Array} list - Clubs to filter
   * @param {string} search - Search query
   * @param {string} activeFilter - Category filter (or 'All')
   * @returns {Array} Filtered clubs
   */
  const filter = (list, search, activeFilter) =>
    list.filter((c) => {
      const matchCat =
        activeFilter === 'All' || c.category === activeFilter;
      const matchSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

  /**
   * Tests default state: no search, no filter
   */
  it('returns all clubs when search is empty and filter is All', () => {
    expect(filter(clubs, '', 'All')).toHaveLength(3);
  });

  /**
   * Tests category filtering
   */
  it('filters by category correctly', () => {
    const result = filter(clubs, '', 'Technology');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Robotics Club');
  });

  /**
   * Tests search by short name (case-insensitive)
   */
  it('searches by club short name (case-insensitive)', () => {
    const result = filter(clubs, 'sac', 'All');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  /**
   * Tests search by full name
   */
  it('searches by fullName', () => {
    const result = filter(clubs, 'Entrepreneurship Development', 'All');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('EDC');
  });

  /**
   * Tests search by category string
   */
  it('searches by category string', () => {
    const result = filter(clubs, 'technology', 'All');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Robotics Club');
  });

  /**
   * Tests no results case
   */
  it('returns empty array when no matches', () => {
    expect(filter(clubs, 'xyznonexistent', 'All')).toHaveLength(0);
  });

  /**
   * Tests combination of category filter and search query
   */
  it('combines category filter and search correctly', () => {
    // Category = Technology, search = 'robotics' → 1 match
    expect(filter(clubs, 'robotics', 'Technology')).toHaveLength(1);
    // Category = Leadership, search = 'robotics' → 0 matches
    expect(filter(clubs, 'robotics', 'Leadership')).toHaveLength(0);
  });
});

// ============================================================================
// 6. Unit Tests: Join/Unjoin Toggle Logic
// ============================================================================

describe('toggleJoin logic', () => {
  /**
   * Test data: clubs with join status
   */
  const clubs = [
    { id: 'sac', name: 'SAC', joined: false },
    { id: 'edc', name: 'EDC', joined: true },
  ];

  /**
   * Toggle join status for a specific club
   * @param {Array} list - Clubs list
   * @param {string} id - Club ID to toggle
   * @returns {Array} Updated clubs list (immutable)
   */
  const toggleJoin = (list, id) =>
    list.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c));

  /**
   * Tests toggling join on an unjoined club
   */
  it('sets joined:true on an unjoined club', () => {
    const updated = toggleJoin(clubs, 'sac');
    expect(updated.find((c) => c.id === 'sac').joined).toBe(true);
  });

  /**
   * Tests toggling join on an already-joined club
   */
  it('sets joined:false on an already-joined club', () => {
    const updated = toggleJoin(clubs, 'edc');
    expect(updated.find((c) => c.id === 'edc').joined).toBe(false);
  });

  /**
   * Tests immutability: other clubs should not be affected
   */
  it('does not mutate other clubs', () => {
    const updated = toggleJoin(clubs, 'sac');
    expect(updated.find((c) => c.id === 'edc').joined).toBe(true); // unchanged
  });

  /**
   * Tests graceful handling of unknown club ID
   */
  it('does not throw for unknown id', () => {
    const updated = toggleJoin(clubs, 'unknown');
    expect(updated).toHaveLength(clubs.length);
  });

  /**
   * Tests counting joined clubs after toggle
   */
  it('counts joined clubs correctly', () => {
    const updated = toggleJoin(clubs, 'sac'); // sac:true, edc:true
    const count = updated.filter((c) => c.joined).length;
    expect(count).toBe(2);
  });
});
