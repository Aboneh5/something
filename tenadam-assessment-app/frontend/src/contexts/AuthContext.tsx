'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  organization: string;
  phoneNumber: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  validateCode: (code: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (code: string, fullName: string, email: string, organization: string, phoneNumber: string) => Promise<{ success: boolean; message: string; user?: User; sessionToken?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to check localStorage

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (storedUser && sessionToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('sessionToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setUser(result.user);

        // Store session for middleware
        document.cookie = `tenadam_session_token=${result.sessionToken}; path=/; max-age=86400`;

        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const validateCode = async (code: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      return { success: result.success, message: result.message };
    } catch (error) {
      console.error('Code validation error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const registerUser = async (code: string, fullName: string, email: string, organization: string, phoneNumber: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, fullName, email, organization, phoneNumber }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setUser(result.data.user);
        
        // Store session for middleware and localStorage
        document.cookie = `tenadam_session_token=${result.data.sessionToken}; path=/; max-age=86400`;
        localStorage.setItem('sessionToken', result.data.sessionToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        return { 
          success: true, 
          message: result.message,
          user: result.data.user,
          sessionToken: result.data.sessionToken
        };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    document.cookie = 'tenadam_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    adminLogin,
    validateCode,
    registerUser,
    logout,
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