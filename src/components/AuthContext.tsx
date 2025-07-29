import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@prisma/client';

interface AuthUser extends Omit<User, 'passwordHash'> {}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Helper functions for cookie management
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string, user: AuthUser) => {
    // Store token in both localStorage (for API calls) and cookie (for middleware)
    localStorage.setItem('auth_token', token);
    setCookie('auth_token', token, 7);
    setUser(user);
    // Use a small delay to ensure state is updated before redirect
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 100);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    deleteCookie('auth_token');
    setUser(null);
    // Redirect to auth page using window.location for Astro routing
    window.location.href = '/auth';
  };

  const checkAuth = async (): Promise<boolean> => {
    // Check both localStorage and cookie for token
    let token = localStorage.getItem('auth_token') || getCookie('auth_token');
    
    if (!token) {
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setUser(result.user);
        setIsLoading(false);
        return true;
      } else {
        logout();
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 