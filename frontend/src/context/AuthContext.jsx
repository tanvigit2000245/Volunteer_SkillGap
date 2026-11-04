import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi, volunteerApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('volunplan_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('volunplan_token') || null);
  const [loading, setLoading] = useState(false);

  // Persist on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('volunplan_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('volunplan_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('volunplan_token', token);
    } else {
      localStorage.removeItem('volunplan_token');
    }
  }, [token]);

  // ─── Register ─────────────────────────────────────────────────────

  const register = useCallback(async ({ fullName, email, password }) => {
    setLoading(true);
    try {
      // 1. Register the auth account (role is always 'volunteer' for self-registration)
      await authApi.register({ fullName, email, password, role: 'volunteer' });

      // 2. Auto-login after registration
      const loginRes = await authApi.login({ email, password });
      const { accessToken, data } = loginRes;

      setToken(accessToken);
      setUser(data);

      // 3. Auto-create volunteer profile
      try {
        await volunteerApi.createProfile({
          mobilityLevel: 'Medium',
          experienceYears: 0,
          skills: [],
          languages: [],
          availability: [],
        });
      } catch (profileErr) {
        // Profile creation may fail if it already exists — that's fine
        console.warn('Volunteer profile creation skipped:', profileErr.message);
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Login ────────────────────────────────────────────────────────

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { accessToken, data } = res;
      setToken(accessToken);
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('volunplan_user');
    localStorage.removeItem('volunplan_token');
  }, []);

  // ─── Context value ────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      register,
      login,
      logout,
    }),
    [user, token, loading, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

