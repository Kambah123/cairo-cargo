import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('cargoflow_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((username: string, role: UserRole) => {
    const names: Record<UserRole, string> = {
      cairo_staff: 'Cairo Staff',
      nigeria_staff: 'Nigeria Staff',
      admin: 'Administrator',
    };
    const userObj: User = {
      username,
      role,
      name: username || names[role],
    };
    setUser(userObj);
    localStorage.setItem('cargoflow_user', JSON.stringify(userObj));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cargoflow_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
