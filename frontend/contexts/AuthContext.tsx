'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { UserResponse } from '../services/auth.service';

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean; // Initial user fetch loading
  isLoading: boolean; // Operation loading (login/signup)
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('[AuthContext] Fetching current user');
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
      console.log('[AuthContext] User fetched:', currentUser?.email || 'none');
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] Login attempt with email:', email);
    setIsLoading(true);
    try {
      setError(null);
      await authService.login({ email, password });
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Failed to fetch user details after login');
      }
      setUser(currentUser);
      console.log('[AuthContext] Login successful, user:', currentUser.full_name);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'An error occurred during login';
      setError(errorMessage);
      console.error('[AuthContext] Login failed:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    console.log('[AuthContext] Signup attempt with email:', email);
    setIsLoading(true);
    try {
      setError(null);
      await authService.signup({ email, full_name: username, password });
      console.log('[AuthContext] Signup successful');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'An error occurred during signup';
      setError(errorMessage);
      console.error('[AuthContext] Signup failed:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out');
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};