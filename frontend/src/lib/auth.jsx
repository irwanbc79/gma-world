import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './config';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.access_token) {
      window.localStorage.setItem('gma-token', data.access_token);
    }
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    window.localStorage.removeItem('gma-token');
    setUser(false);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh: check }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
