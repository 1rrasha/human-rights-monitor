import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { AuthResponse, UserResponse } from '../services/auth.service';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setUser(user);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      setUser(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during login');
      throw err;
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      setError(null);
      await authService.signup({ email, username, password });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during signup');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 