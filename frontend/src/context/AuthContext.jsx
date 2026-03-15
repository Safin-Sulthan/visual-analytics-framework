import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vaf_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('vaf_user');
      if (stored) setUser(JSON.parse(stored));
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('vaf_token', data.token);
      localStorage.setItem('vaf_user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(name, email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('vaf_token', data.token);
      localStorage.setItem('vaf_user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vaf_token');
    localStorage.removeItem('vaf_user');
    authService.logout();
  }, []);

  const value = { user, token, loading, error, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
