import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Create endpoint to check auth status (due to storing in httpOnly cookies)
      const response = await authAPI.me();
      setUser(response.data.user);
    } catch (error) {
      // Not authenticated or error
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      setUser(response.data.user);
    } catch (error: any) {
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map((err: any) => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.error || 'Login failed');
      }
      throw error; // Re-throw so components can handle if needed
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await authAPI.register({ username, email, password });
      setUser(response.data.user);
    } catch (error: any) {
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map((err: any) => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.error || 'Registration failed');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      // Clear local state even if logout fails
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



