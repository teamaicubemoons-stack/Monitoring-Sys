import React, { createContext, useState, useEffect } from 'react';
import { loginUser } from '../services/api';

export const AuthContext = createContext();

const SESSION_KEY = 'monitoring_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch(_) {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.success && result.user) {
        const userData = { ...result.user, status: 'online' };
        setUser(userData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
