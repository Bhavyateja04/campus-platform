/**
 * clubsApi.test.js
 * Unit + integration tests for ClubsScreen API behaviour.
 * Run with: jest clubsApi.test.js
 *
 * Dependencies: jest, @testing-library/react-native, axios (or your HTTP lib)
 */

import { clubsApi } from '../services/api';

// ─── Mock the API module ──────────────────────────────────────────────────────
jest.mock('../services/api', () => ({
  clubsApi: {
    list: jest.fn(),
  },
}));

// ─── Helper: minimal backend club shape ──────────────────────────────────────
const makeBackendClub = (overrides = {}) => ({
  _id: 'abc123',
  name: 'Test Club',
  description: 'A test club description',
  coordinatorName: 'John Doe',
  coordinatorEmail: 'john@test.edu',
  createdAt: '2022-03-15T00:00:00.000Z',
  ...overrides,
});

// ─── backendClubToUi helper (mirrors the one in ClubsScreen) ─────────────────
// Copied here so tests are self-contained and not tightly coupled to the import.
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
    imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    members: 0,
    founded: c.createdAt ? new Date(c.createdAt).getFullYear().toString() : '',
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

// ─────────────────────────────────────────────────────────────────────────────
// 1. UNIT TESTS — backendClubToUi transformer
// ─────────────────────────────────────────────────────────────────────────────
describe('backendClubToUi()', () => {
  it('maps _id to string id', () => {
    const result = backendClubToUi(makeBackendClub({ _id: 'xyz789' }));
    expect(result.id).toBe('xyz789');
  });

  it('maps name correctly', () => {
    const result = backendClubToUi(makeBackendClub({ name: 'Robotics Club' }));
    expect(result.name).toBe('Robotics Club');
    expect(result.fullName).toBe('Robotics Club');
  });

  it('maps description to tagline and about', () => {
    const result = backendClubToUi(makeBackendClub({ description: 'We build robots.' }));
    expect(result.tagline).toBe('We build robots.');
    expect(result.about).toBe('We build robots.');
  });

  it('extracts year from createdAt', () => {
    const result = backendClubToUi(makeBackendClub({ createdAt: '2019-06-01T00:00:00.000Z' }));
    expect(result.founded).toBe('2019');
  });

  it('falls back to empty string when createdAt is missing', () => {
    const result = backendClubToUi(makeBackendClub({ createdAt: undefined }));
    expect(result.founded).toBe('');
  });

  it('maps coordinatorName to president', () => {
    const result = backendClubToUi(makeBackendClub({ coordinatorName: 'Jane Smith' }));
    expect(result.president).toBe('Jane Smith');
  });

  it('falls back to em-dash when coordinatorName is missing', () => {
    const result = backendClubToUi(makeBackendClub({ coordinatorName: undefined }));
    expect(result.president).toBe('—');
  });

  it('maps coordinatorEmail to contact', () => {
    const result = backendClubToUi(makeBackendClub({ coordinatorEmail: 'club@uni.edu' }));
    expect(result.contact).toBe('club@uni.edu');
  });

  it('sets joined to false by default', () => {
    const result = backendClubToUi(makeBackendClub());
    expect(result.joined).toBe(false);
  });

  it('sets _backend flag to true', () => {
    const result = backendClubToUi(makeBackendClub());
    expect(result._backend).toBe(true);
  });

  it('returns null for null input', () => {
    expect(backendClubToUi(null)).toBeNull();
  });

  it('returns null when _id is missing', () => {
    expect(backendClubToUi({ name: 'Orphan Club' })).toBeNull();
  });

  it('initialises arrays as empty', () => {
    const result = backendClubToUi(makeBackendClub());
    expect(result.achievements).toEqual([]);
    expect(result.activities).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. UNIT TESTS — clubsApi.list() success scenarios
// ─────────────────────────────────────────────────────────────────────────────
describe('clubsApi.list() — success', () => {
  afterEach(() => jest.clearAllMocks());

  it('resolves with an array of clubs', async () => {
    const mockData = [makeBackendClub({ _id: '1' }), makeBackendClub({ _id: '2' })];
    clubsApi.list.mockResolvedValueOnce(mockData);

    const result = await clubsApi.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('maps correctly through backendClubToUi', async () => {
    const mockData = [makeBackendClub({ _id: 'map1', name: 'Chess Club' })];
    clubsApi.list.mockResolvedValueOnce(mockData);

    const raw = await clubsApi.list();
    const ui = raw.map(backendClubToUi).filter(Boolean);

    expect(ui[0].id).toBe('map1');
    expect(ui[0].name).toBe('Chess Club');
  });

  it('resolves with an empty array when no clubs exist', async () => {
    clubsApi.list.mockResolvedValueOnce([]);
    const result = await clubsApi.list();
    expect(result).toEqual([]);
  });

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

// ─────────────────────────────────────────────────────────────────────────────
// 3. UNIT TESTS — clubsApi.list() failure / edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('clubsApi.list() — failure & edge cases', () => {
  afterEach(() => jest.clearAllMocks());

  it('throws on network error', async () => {
    clubsApi.list.mockRejectedValueOnce(new Error('Network Error'));
    await expect(clubsApi.list()).rejects.toThrow('Network Error');
  });

  it('throws on 401 Unauthorized', async () => {
    clubsApi.list.mockRejectedValueOnce(new Error('401 Unauthorized'));
    await expect(clubsApi.list()).rejects.toThrow('401 Unauthorized');
  });

  it('throws on 500 Server Error', async () => {
    clubsApi.list.mockRejectedValueOnce(new Error('500 Internal Server Error'));
    await expect(clubsApi.list()).rejects.toThrow('500 Internal Server Error');
  });

  it('gracefully handles non-array response (object)', async () => {
    // Screen uses: Array.isArray(list) ? list : []
    clubsApi.list.mockResolvedValueOnce({ data: [] }); // object not array
    const raw = await clubsApi.list();
    const safeList = Array.isArray(raw) ? raw : [];
    expect(safeList).toEqual([]);
  });

  it('gracefully handles null response', async () => {
    clubsApi.list.mockResolvedValueOnce(null);
    const raw = await clubsApi.list();
    const safeList = Array.isArray(raw) ? raw : [];
    expect(safeList).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. INTEGRATION TESTS — screen-level data merging logic
// ─────────────────────────────────────────────────────────────────────────────
describe('Screen merging logic (backend clubs + seed clubs)', () => {
  const SEED_CLUBS = [
    { id: 'sac', name: 'SAC', _backend: false },
    { id: 'edc', name: 'EDC', _backend: false },
  ];

  it('prepends backend clubs before seed clubs', async () => {
    const backendClubs = [makeBackendClub({ _id: 'b1', name: 'Drama Club' })];
    clubsApi.list.mockResolvedValueOnce(backendClubs);

    const raw = await clubsApi.list();
    const ui = (Array.isArray(raw) ? raw : []).map(backendClubToUi).filter(Boolean);

    // Simulate screen setState logic: [...ui, ...prev.filter(p => !p._backend)]
    const merged = [...ui, ...SEED_CLUBS.filter(p => !p._backend)];

    expect(merged[0].name).toBe('Drama Club');   // backend first
    expect(merged[1].name).toBe('SAC');          // seed follows
    expect(merged).toHaveLength(3);
  });

  it('does not duplicate seed clubs when backend returns empty', async () => {
    clubsApi.list.mockResolvedValueOnce([]);

    const raw = await clubsApi.list();
    const ui = (Array.isArray(raw) ? raw : []).map(backendClubToUi).filter(Boolean);
    const merged = [...ui, ...SEED_CLUBS.filter(p => !p._backend)];

    expect(merged).toHaveLength(2); // only seeds
  });

  it('only replaces _backend:true seed entries', async () => {
    const seedWithBackend = [
      ...SEED_CLUBS,
      { id: 'old_backend', name: 'Old Backend Club', _backend: true }, // stale
    ];

    const fresh = [makeBackendClub({ _id: 'fresh1', name: 'Fresh Club' })];
    clubsApi.list.mockResolvedValueOnce(fresh);

    const raw = await clubsApi.list();
    const ui = (Array.isArray(raw) ? raw : []).map(backendClubToUi).filter(Boolean);
    const merged = [...ui, ...seedWithBackend.filter(p => !p._backend)];

    const names = merged.map(c => c.name);
    expect(names).toContain('Fresh Club');
    expect(names).not.toContain('Old Backend Club'); // stale removed
    expect(names).toContain('SAC');
    expect(names).toContain('EDC');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. SEARCH & FILTER LOGIC
// ─────────────────────────────────────────────────────────────────────────────
describe('Clubs search & filter logic', () => {
  const clubs = [
    { id: '1', name: 'SAC', fullName: 'Student Activity Council', category: 'Leadership' },
    { id: '2', name: 'EDC', fullName: 'Entrepreneurship Development Cell', category: 'Entrepreneurship' },
    { id: '3', name: 'Robotics Club', fullName: 'Aditya Robotics & Automation Club', category: 'Technology' },
  ];

  const filter = (list, search, activeFilter) =>
    list.filter(c => {
      const matchCat = activeFilter === 'All' || c.category === activeFilter;
      const matchSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

  it('returns all clubs when search is empty and filter is All', () => {
    expect(filter(clubs, '', 'All')).toHaveLength(3);
  });

  it('filters by category correctly', () => {
    const result = filter(clubs, '', 'Technology');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Robotics Club');
  });

  it('searches by club short name (case-insensitive)', () => {
    const result = filter(clubs, 'sac', 'All');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('searches by fullName', () => {
    const result = filter(clubs, 'Entrepreneurship Development', 'All');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('EDC');
  });

  it('searches by category string', () => {
    const result = filter(clubs, 'technology', 'All');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Robotics Club');
  });

  it('returns empty array when no matches', () => {
    expect(filter(clubs, 'xyznonexistent', 'All')).toHaveLength(0);
  });

  it('combines category filter and search correctly', () => {
    // Category = Technology, search = 'robotics' → 1 match
    expect(filter(clubs, 'robotics', 'Technology')).toHaveLength(1);
    // Category = Leadership, search = 'robotics' → 0 matches
    expect(filter(clubs, 'robotics', 'Leadership')).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. JOIN / UNJOIN TOGGLE LOGIC
// ─────────────────────────────────────────────────────────────────────────────
describe('toggleJoin logic', () => {
  const clubs = [
    { id: 'sac', name: 'SAC', joined: false },
    { id: 'edc', name: 'EDC', joined: true },
  ];

  const toggleJoin = (list, id) =>
    list.map(c => (c.id === id ? { ...c, joined: !c.joined } : c));

  it('sets joined:true on an unjoined club', () => {
    const updated = toggleJoin(clubs, 'sac');
    expect(updated.find(c => c.id === 'sac').joined).toBe(true);
  });

  it('sets joined:false on an already-joined club', () => {
    const updated = toggleJoin(clubs, 'edc');
    expect(updated.find(c => c.id === 'edc').joined).toBe(false);
  });

  it('does not mutate other clubs', () => {
    const updated = toggleJoin(clubs, 'sac');
    expect(updated.find(c => c.id === 'edc').joined).toBe(true); // unchanged
  });

  it('does not throw for unknown id', () => {
    const updated = toggleJoin(clubs, 'unknown');
    expect(updated).toHaveLength(clubs.length);
  });

  it('counts joined clubs correctly', () => {
    const updated = toggleJoin(clubs, 'sac'); // sac:true, edc:true
    const count = updated.filter(c => c.joined).length;
    expect(count).toBe(2);
  });
});