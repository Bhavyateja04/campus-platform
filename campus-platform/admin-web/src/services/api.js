const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

const TOKEN_STORAGE_KEY = "campus-admin-token";

const readStoredToken = () => {
  if (typeof window === "undefined") return ADMIN_TOKEN;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ADMIN_TOKEN;
};

const saveStoredToken = (token) => {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

const clearStoredToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

let tokenPromise = null;

const fetchDevToken = async () => {
  if (tokenPromise) return tokenPromise;

  tokenPromise = fetch(`${API_BASE}/api/auth/dev-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: import.meta.env.VITE_DEV_ADMIN_EMAIL,
      name: import.meta.env.VITE_DEV_ADMIN_NAME,
    }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Auth error ${res.status}`);
      }
      return data?.data?.token || data?.token || "";
    })
    .catch((error) => {
      console.warn("Dev token request failed:", error.message || error);
      return "";
    })
    .finally(() => {
      tokenPromise = null;
    });

  return tokenPromise;
};

const resolveToken = async () => {
  const token = readStoredToken();
  if (token) return token;

  const devToken = await fetchDevToken();
  if (devToken) {
    saveStoredToken(devToken);
    return devToken;
  }

  return "";
};

const requestOnce = async (path, opts = {}) => {
  const headers = {
    ...(opts.headers || {}),
  };

  const token = await resolveToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body = opts.body;

  if (body && typeof body !== "string" && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";

    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    body,
  });

  const data = await res.json().catch(() => null);

  return { res, data };
};

export const apiRequest = async (path, opts = {}) => {
  const first = await requestOnce(path, opts);

  if (first.res.status === 401) {
    clearStoredToken();
    const retry = await requestOnce(path, opts);
    if (!retry.res.ok) {
      throw new Error(retry.data?.message || `API error ${retry.res.status}`);
    }
    return retry.data;
  }

  if (!first.res.ok) {
    throw new Error(first.data?.message || `API error ${first.res.status}`);
  }

  return first.data;
};
