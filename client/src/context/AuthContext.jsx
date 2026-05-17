import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, attempt to restore session via the refresh token cookie
  useEffect(() => {
    const restore = async () => {
      try {
        const savedToken = localStorage.getItem('accessToken');
        if (!savedToken) return;

        // Verify the token by fetching own bookmarks (lightweight check)
        // Alternatively, we could have a /auth/me endpoint — using refresh here
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);

        // Decode user from token payload (base64)
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        // We need the full user object — call profile if available, or store in localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {
        // Refresh failed — clear state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  // Update local user state (e.g., after profile update)
  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
