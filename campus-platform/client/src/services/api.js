// ============================================================================
// API Wrapper
// ============================================================================
// Thin fetch wrapper around the campus-platform backend.
// - Prepends API_BASE_URL
// - Adds Authorization header if a token is stored in AsyncStorage
// - Throws an Error with helpful message on non-2xx responses
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// ============================================================================
// Constants
// ============================================================================

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';
const USER_KEY = 'auth_user';

// ============================================================================
// Session Management
// ============================================================================

/**
 * Retrieves the stored authentication token
 * @returns {Promise<string|null>} The auth token or null if not found
 */
export async function getToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Retrieves the stored user role
 * @returns {Promise<string|null>} The user role or null if not found
 */
export async function getRole() {
  try {
    return await AsyncStorage.getItem(ROLE_KEY);
  } catch {
    return null;
  }
}

/**
 * Retrieves the stored user data
 * @returns {Promise<Object|null>} The user object or null if not found
 */
export async function getUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Stores session data in AsyncStorage
 * @param {Object} session - Session data
 * @param {string} session.token - Authentication token
 * @param {string} session.role - User role
 * @param {Object} session.user - User data
 */
export async function setSession({ token, role, user }) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  if (role) await AsyncStorage.setItem(ROLE_KEY, role);
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clears all session data from AsyncStorage
 */
export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY, USER_KEY]);
}

/**
 * Best-effort logout: revokes JWT server-side and clears local credentials
 * @returns {Promise<{revoked: boolean, error?: Error}>}
 */
export async function logout() {
  const token = await getToken();
  let revoked = false;
  let error;

  if (token) {
    try {
      await request('/api/auth/logout', { method: 'POST', auth: true });
      revoked = true;
    } catch (err) {
      error = err;
    }
  }

  await clearSession();
  return { revoked, error };
}

// ============================================================================
// Core Request Function
// ============================================================================

/**
 * Core fetch wrapper for API requests
 * @param {string} path - API endpoint path
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {Object} options.body - Request body
 * @param {boolean} options.auth - Add Authorization header
 * @param {Object} options.headers - Custom headers
 * @returns {Promise<any>} Response data
 * @throws {Error} On network error or non-2xx response
 */
async function request(
  path,
  { method = 'GET', body, auth = false, headers = {} } = {},
) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  // Add authorization header if requested
  if (auth) {
    const token = await getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  // Make the request
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(`Network error reaching ${url}: ${err?.message || err}`);
  }

  // Parse response
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text();

  // Handle errors
  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with ${response.status} ${response.statusText || ''}`.trim();
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ============================================================================
// HTTP Method Helpers
// ============================================================================

export const api = {
  get: (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts = {}) =>
    request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts = {}) =>
    request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts = {}) =>
    request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts = {}) => request(path, { ...opts, method: 'DELETE' }),
};

// ============================================================================
// Feature-Specific API Clients
// ============================================================================

export const healthApi = {
  ping: () => api.get('/api/health'),
};

export const authApi = {
  login: ({ email, password }) =>
    api.post('/api/auth/login', { email, password }),
  register: (payload) => api.post('/api/auth/register', payload),
  logout: () => api.post('/api/auth/logout', {}, { auth: true }),
};

export const usersApi = {
  me: () => api.get('/api/users/me', { auth: true }),
  updateMe: (patch) => api.put('/api/users/me', patch, { auth: true }),
  updatePassword: ({ oldPassword, newPassword }) =>
    api.put(
      '/api/users/update-password',
      { oldPassword, newPassword },
      { auth: true },
    ),
};

export const lostFoundApi = {
  list: () => api.get('/api/lostitems', { auth: true }),
  create: (item) => api.post('/api/lostitems', item, { auth: true }),
  update: (id, patch) =>
    api.put(`/api/lostitems/${id}`, patch, { auth: true }),
  remove: (id) => api.delete(`/api/lostitems/${id}`, { auth: true }),
  markFound: (id) =>
    api.patch(`/api/lostitems/${id}/found`, {}, { auth: true }),
  markResolved: (id) =>
    api.patch(`/api/lostitems/${id}/resolved`, {}, { auth: true }),
};

export const goodsApi = {
  list: () => api.get('/api/goods', { auth: true }),
  create: (item) => api.post('/api/goods', item, { auth: true }),
  update: (id, patch) => api.put(`/api/goods/${id}`, patch, { auth: true }),
  remove: (id) => api.delete(`/api/goods/${id}`, { auth: true }),
  markAsSold: (id) =>
    api.put(`/api/goods/markassold/${id}`, {}, { auth: true }),
};

export const memoriesApi = {
  list: () => api.get('/api/college-memories/all-memories'),
  create: (memory) =>
    api.post('/api/college-memories/add-memory', memory, { auth: true }),
  update: (id, patch) =>
    api.put(`/api/college-memories/edit-memory/${id}`, patch, { auth: true }),
  remove: (id) =>
    api.delete(`/api/college-memories/delete-memory/${id}`, { auth: true }),
};

export const clubsApi = {
  list: () => api.get('/api/clubs/all-clubs'),
  get: (id) => api.get(`/api/clubs/club/${id}`),
  create: (club) => api.post('/api/clubs/add-club', club),
  update: (id, patch) => api.put(`/api/clubs/edit-club/${id}`, patch),
  remove: (id) => api.delete(`/api/clubs/delete-club/${id}`),
};

export const placementsApi = {
  list: () => api.get('/api/placements', { auth: true }),
  create: (item) => api.post('/api/placements', item, { auth: true }),
  update: (id, patch) =>
    api.put(`/api/placements/${id}`, patch, { auth: true }),
  remove: (id) => api.delete(`/api/placements/${id}`, { auth: true }),
};

export const canteensApi = {
  list: () => api.get('/api/canteens/all-canteens'),
  get: (id) => api.get(`/api/canteens/canteen/${id}`),
  create: (canteen) => api.post('/api/canteens/add-canteen', canteen),
  update: (id, patch) =>
    api.put(`/api/canteens/edit-canteen/${id}`, patch),
  remove: (id) => api.delete(`/api/canteens/delete-canteen/${id}`),
};

export const notificationsApi = {
  list: () => api.get('/api/notifications', { auth: true }),
  markRead: (id) =>
    api.put(`/api/notifications/${id}/read`, {}, { auth: true }),
  markAllRead: () =>
    api.put('/api/notifications/read-all', {}, { auth: true }),
};

// ============================================================================
// Content Moderation API
// ============================================================================

export const moderationApi = {
  /**
   * Moderates text content
   * @param {string} text - Text to moderate
   * @returns {Promise<{safe: boolean, reason: string|null, source: string}>}
   */
  text: async (text) => {
    try {
      return await api.post('/api/moderate/text', { text });
    } catch {
      return { safe: true, source: 'fallback', reason: null };
    }
  },

  /**
   * Moderates memory content (text + image)
   * @param {Object} memory - Memory data
   * @param {string} memory.description - Memory text
   * @param {string} memory.imageUri - Image URI (optional)
   * @returns {Promise<{safe: boolean, reason: string|null, source: string}>}
   */
  memory: async ({ description = '', imageUri = null }) => {
    try {
      const formData = new FormData();
      formData.append('text', description);

      if (imageUri) {
        formData.append('image', {
          uri: imageUri,
          name: 'memory.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/api/moderate/memory`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { safe: true, source: 'fallback', reason: null };
      }

      return {
        safe: data.safe !== false,
        reason: data.reason || null,
        source: data.source || 'ai-service',
      };
    } catch {
      return moderationApi.text(description);
    }
  },
};
