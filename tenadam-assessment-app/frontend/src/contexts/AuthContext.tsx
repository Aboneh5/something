'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    code: string,
    fullName: string,
    email: string,
    organization: string,
    phoneNumber: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  validateCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      if (AuthService.isAuthenticated()) {
        const result = await AuthService.validateSession();
        if (result.success && result.data?.user) {
          setUser(result.data.user);
        } else {
          AuthService.clearSession();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      AuthService.clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCode = async (code: string) => {
    try {
      const result = await AuthService.validateAccessCode(code);
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  };

  const login = async (
    code: string,
    fullName: string,
    email: string,
    organization: string,
    phoneNumber: string
  ) => {
    try {
      setIsLoading(true);
      const result = await AuthService.register(
        code,
        fullName,
        email,
        organization,
        phoneNumber
      );

      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return {
          success: true,
          message: 'Registration successful! Welcome to the assessment.',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed. Please try again.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    validateCode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}