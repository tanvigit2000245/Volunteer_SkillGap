import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../routes/auth';
import { volunteerApi } from '../routes/volunteer';

export const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const item = localStorage.getItem('volunplan_user');
    if (!item || item === 'undefined' || item === 'null') return null;
    return JSON.parse(item);
  } catch (e) {
    return null;
  }
};

const getStoredToken = () => {
  try {
    const item = localStorage.getItem('volunplan_token');
    if (!item || item === 'undefined' || item === 'null') return null;
    return item;
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  // Persist to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('volunplan_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('volunplan_user');
      localStorage.removeItem('user');
    }

    if (token) {
      localStorage.setItem('volunplan_token', token);
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('volunplan_token');
      localStorage.removeItem('accessToken');
    }
  }, [user, token]);

  // Refresh token on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.refresh();
        if (res && res.accessToken) {
          setToken(res.accessToken);
          const refreshedUser = res.user || res.data;
          if (refreshedUser) {
            setUser(refreshedUser);
          }
        }
      } catch (_) {
        // Token refresh failed or no cookie; user remains logged in if local session exists
      }
    })();
  }, []);

  const register = async (data) => {
    const res = await authApi.register(data);
    const accessToken = res.accessToken;
    const newUser = res.user || res.data;
    if (accessToken) setToken(accessToken);
    if (newUser) setUser(newUser);
    // auto-create volunteer profile
    try {
      if (newUser?.id) {
        await volunteerApi.createProfile({ userId: newUser.id }, accessToken);
      }
    } catch (e) {
      console.warn('Profile creation failed', e);
    }
    return res;
  };

  const login = async (creds) => {
    const res = await authApi.login(creds);
    const accessToken = res.accessToken;
    const loggedUser = res.user || res.data;
    setToken(accessToken);
    setUser(loggedUser);
    return { accessToken, user: loggedUser };
  };

  const setAuthSession = (loggedUser, accessToken) => {
    setUser(loggedUser);
    if (accessToken) {
      setToken(accessToken);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('volunplan_user');
    localStorage.removeItem('volunplan_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, setAuthSession }}>
      {children}
    </AuthContext.Provider>
  );
};
