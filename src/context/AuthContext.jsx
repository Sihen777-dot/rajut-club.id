// context/AuthContext.jsx — status login global: user, token, login(), logout(), updateUser()
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { saveSession, getToken, getUser, clearSession } from '../utils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  async function login(credential, passwd) {
    const res = await api.login(credential, passwd);
    saveSession(res.token, res.data);
    setToken(res.token);
    setUser(res.data);
    return res.data;
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  /** Perbarui data user di state + localStorage (mis. setelah ganti foto) */
  function updateUser(partial) {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial };
      const t = getToken();
      if (t) saveSession(t, next);
      return next;
    });
  }

  const value = {
    user,
    token,
    loading,
    isLoggedIn: !!token,
    isAdmin: user?.role === 'admin',
    isPembeli: user?.role === 'pembeli',
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
