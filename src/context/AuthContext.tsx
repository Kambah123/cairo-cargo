import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    username: profile.username,
    name: profile.name,
    role: profile.role as UserRole,
    branch: profile.branch || 'all',
    isActive: profile.is_active ?? true,
    phone: profile.phone,
    createdAt: profile.created_at,
    lastLoginAt: profile.last_login_at,
    lastLoginIp: profile.last_login_ip,
    passwordChangedAt: profile.password_changed_at,
  });

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, logout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetInactivityTimer));
    return () => {
      events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetInactivityTimer]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile && profile.is_active !== false) {
            setUser(mapProfileToUser(profile));
            resetInactivityTimer();
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile && profile.is_active !== false) {
            setUser(mapProfileToUser(profile));
            resetInactivityTimer();
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [resetInactivityTimer]);

  const login = useCallback(async (email: string, password = 'Demo123!', rememberMe = false) => {
    try {
      setIsLoading(true);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (signInData.user) {
        // Fetch IP (mocking for now as browser JS can't easily get it without external service)
        const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
        const ipData = ipResponse ? await ipResponse.json() : { ip: 'unknown' };

        await supabase.from('profiles').update({
          last_login_at: new Date().toISOString(),
          last_login_ip: ipData.ip
        }).eq('id', signInData.user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (profile) {
          if (profile.is_active === false) {
            await supabase.auth.signOut();
            throw new Error('Account is deactivated');
          }
          setUser(mapProfileToUser(profile));
          resetInactivityTimer();
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [resetInactivityTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
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
