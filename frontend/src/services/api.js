const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Generic fetch wrapper with auth header injection
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('volunplan_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // for httpOnly cookies (refresh token)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────

export const authApi = {
  register: (body) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  refresh: () =>
    request('/auth/refresh', { method: 'POST' }),
};

// ─── Volunteers ──────────────────────────────────────────────────────

export const volunteerApi = {
  createProfile: (body) =>
    request('/volunteer/profile', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyProfile: () => request('/volunteer/profile/me'),

  updateMyProfile: (body) =>
    request('/volunteer/profile/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

