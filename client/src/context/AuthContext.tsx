import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { AxiosError } from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string; // Required now, not optional
  bio?: string;
  links?: string[];
  createdAt?: string;
  role?: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
  connectedProviders?: {
    google: boolean;
    discord: boolean;
    itchio: boolean;
  };
  provider?: 'local' | 'google' | 'discord' | 'itchio' | 'mixed';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // Add this for real-time updates
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.me();
      if (response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Not authenticated or error - this is expected for logged out users
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh current user data (for real-time updates)
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.me();
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to refresh user data:', error);
      }
      // Don't clear user on refresh failure - might be temporary network issue
    }
  };

  const login = async (emailOrUsername: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.login({ emailOrUsername, password });

      if (response.user) {
        setUser(response.user);
      } else {
        throw new Error('Login successful but no user data received');
      }
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response?.data?.details) {
        // Validation errors
        const errorMessages = axiosError.response.data.details
          .map((err: any) => err.msg)
          .join(', ');
        setError(errorMessages);
      } else if (axiosError.response?.data?.error) {
        // API error message
        setError(axiosError.response.data.error);
      } else if (axiosError.message) {
        // Network or other errors
        setError(axiosError.message);
      } else {
        setError('Login failed. Please try again.');
      }

      throw error; // Re-throw so components can handle if needed
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<any> => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.register({ username, email, password });

      if (response.user) {
        setUser(response.user);
        return response;
      } else {
        throw new Error('Registration successful but no user data received');
      }
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response?.data?.details) {
        // Validation errors
        const errorMessages = axiosError.response.data.details
          .map((err: any) => err.msg)
          .join(', ');
        setError(errorMessages);
      } else if (axiosError.response?.data?.error) {
        // API error message
        setError(axiosError.response.data.error);
      } else if (axiosError.message) {
        // Network or other errors
        setError(axiosError.message);
      } else {
        setError('Registration failed. Please try again.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Log error but don't show to user - logout should always succeed locally
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
    } finally {
      // Always clear user state, even if API call fails
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser, // Add this to the context value
    loading,
    error,
    clearError,
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