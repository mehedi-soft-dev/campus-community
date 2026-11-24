import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The cookie is the source of truth, so ask the API who we are on load rather
  // than trusting a stale value in localStorage.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setCurrentUser(data);
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setCurrentUser(data);
    return data;
  }, []);

  // Registration no longer signs you in: new accounts are pending until a
  // moderator approves them, so logging in here would fail with ACCOUNT_PENDING.
  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({ currentUser, loading, login, register, logout }),
    [currentUser, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
