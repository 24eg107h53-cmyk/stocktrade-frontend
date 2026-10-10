import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, walletService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('stocktrade_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('stocktrade_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token changes to localStorage
  const handleAuthSuccess = (authData) => {
    const jwt = authData.token;
    const userData = {
      id: authData.id,
      username: authData.username,
      email: authData.email,
      name: authData.name,
      role: authData.role,
      walletBalance: authData.walletBalance,
      status: authData.status,
    };
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('stocktrade_token', jwt);
    localStorage.setItem('stocktrade_user', JSON.stringify(userData));
  };

  const login = async (usernameOrEmail, password) => {
    const res = await authService.login({ usernameOrEmail, password });
    handleAuthSuccess(res.data);
    return res.data;
  };

  const register = async (name, email, username, password) => {
    await authService.register({ name, email, username, password });
    // After registration, auto-login
    return await login(username, password);
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('stocktrade_token');
    localStorage.removeItem('stocktrade_user');
  }, []);

  const refreshUserWallet = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await walletService.getWallet(user.id);
      if (res.data) {
        setUser((prev) => {
          if (!prev) return null;
          const updated = { ...prev, walletBalance: res.data.balance };
          localStorage.setItem('stocktrade_user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to refresh wallet:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    setLoading(false);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [logout]);

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUserWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
