// Utility to hash passwords using standard Web Crypto API (SHA-256)
// This ensures NO plain-text passwords are ever stored in localStorage or sessionStorage
export async function hashPassword(plainPassword) {
  const msgUint8 = new TextEncoder().encode(plainPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_USERS_KEY = 'vsg_mock_users_db_v1';
const STORAGE_SESSION_KEY = 'vsg_mock_session_v1';

// Seed initial default accounts representing the three roles: admin, coordinator, volunteer
export async function initializeMockDatabase() {
  const existing = localStorage.getItem(STORAGE_USERS_KEY);
  if (!existing) {
    const demoPasswordHash = await hashPassword('Password123!');
    
    const initialUsers = [
      {
        fullName: 'Elena Vance',
        email: 'admin@skillgap.org',
        passwordHash: demoPasswordHash,
        role: 'admin',
        createdAt: new Date('2025-01-15T09:00:00Z').toISOString()
      },
      {
        fullName: 'Marcus Chen',
        email: 'coordinator@skillgap.org',
        passwordHash: demoPasswordHash,
        role: 'coordinator',
        createdAt: new Date('2025-02-10T11:30:00Z').toISOString()
      },
      {
        fullName: 'Sarah Jenkins',
        email: 'volunteer@skillgap.org',
        passwordHash: demoPasswordHash,
        role: 'volunteer',
        createdAt: new Date('2025-03-01T14:20:00Z').toISOString()
      }
    ];

    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initialUsers));
  }
}

// Get all mock users
export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse users from storage:', e);
    return [];
  }
}

// Validation helpers
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return 'Please enter a valid email address (e.g. name@domain.com).';
  }
  return null;
}

export function validateFullName(name) {
  if (!name || !name.trim()) {
    return 'Full name is required.';
  }
  if (name.trim().length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

// Calculate password strength for animated meter
export function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score === 2 || score === 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', width: '50%' };
  if (score === 4) return { score: 3, label: 'Good', color: 'bg-teal-500', width: '75%' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
}

// Registration: attempts backend API first, falls back to local storage
export async function mockRegister({ fullName, email, password }) {
  // Normalize fields
  const trimmedName = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // Validate
  const nameErr = validateFullName(trimmedName);
  if (nameErr) throw new Error(nameErr);

  const emailErr = validateEmail(normalizedEmail);
  if (emailErr) throw new Error(emailErr);

  const passErr = validatePassword(password);
  if (passErr) throw new Error(passErr);

  // Attempt backend API registration if backend is available
  if (typeof fetch !== 'undefined') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: trimmedName, email: normalizedEmail, password, role: 'volunteer' }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        return {
          fullName: json.data?.fullName || trimmedName,
          email: json.data?.email || normalizedEmail,
          role: json.data?.role || 'volunteer',
          createdAt: new Date().toISOString()
        };
      } else if (res.status === 400) {
        throw new Error(json?.message || 'An account with this email address already exists.');
      }
    } catch (apiErr) {
      if (apiErr.message && (apiErr.message.includes('already exists') || apiErr.message.includes('User already exists'))) {
        throw apiErr;
      }
      // Otherwise backend is offline or unreachable; fall back to local mock storage
    }
  }

  const users = getStoredUsers();
  const userExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
  if (userExists) {
    throw new Error('An account with this email address already exists.');
  }

  const passwordHash = await hashPassword(password);

  const newUser = {
    fullName: trimmedName,
    email: normalizedEmail,
    passwordHash: passwordHash,
    role: 'volunteer',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  return {
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt
  };
}

// Login: attempts backend API first, falls back to local storage
export async function mockLogin({ email, password, rememberMe = false }) {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  
  const emailErr = validateEmail(normalizedEmail);
  if (emailErr) {
    const err = new Error(emailErr);
    err.field = 'email';
    throw err;
  }

  if (!password) {
    const err = new Error('Password is required.');
    err.field = 'password';
    throw err;
  }

  // Attempt backend API login if available
  if (typeof fetch !== 'undefined') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        const sessionData = {
          fullName: json.data?.fullName || 'User',
          email: json.data?.email || normalizedEmail,
          role: json.data?.role || 'volunteer',
          token: json.accessToken || 'mock-token',
          loginTime: new Date().toISOString()
        };
        if (rememberMe && typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
        } else if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
        }
        return sessionData;
      } else if (res.status === 401 || res.status === 400) {
        const err = new Error(json?.message || 'Wrong email ID or password.');
        err.field = 'form';
        throw err;
      }
    } catch (apiErr) {
      if (apiErr.field) throw apiErr;
      // Backend is offline or fetch aborted; proceed with local mock auth
    }
  }

  const users = getStoredUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!foundUser) {
    const err = new Error('Wrong email ID or password.');
    err.field = 'email';
    err.fieldMessage = 'Wrong email ID. No account found with this email.';
    throw err;
  }

  const incomingHash = await hashPassword(password);
  if (foundUser.passwordHash !== incomingHash) {
    const err = new Error('Wrong email ID or password.');
    err.field = 'password';
    err.fieldMessage = 'Wrong password. Please check and try again.';
    throw err;
  }

  const sessionData = {
    fullName: foundUser.fullName,
    email: foundUser.email,
    role: foundUser.role,
    token: 'mock-jwt-vsg-' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    loginTime: new Date().toISOString()
  };

  if (rememberMe && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
  } else if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
  }

  return sessionData;
}

// Get Active Session
export function getActiveSession() {
  try {
    const fromLocal = localStorage.getItem(STORAGE_SESSION_KEY);
    if (fromLocal) return JSON.parse(fromLocal);

    const fromSession = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (fromSession) return JSON.parse(fromSession);

    return null;
  } catch (e) {
    return null;
  }
}

// Logout
export function mockLogout() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  sessionStorage.removeItem(STORAGE_SESSION_KEY);
}

