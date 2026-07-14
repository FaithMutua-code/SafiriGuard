// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '@/api/client';

export type UserRole = 'sacco_manager' | 'vehicle_owner' | 'driver';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  sacco?: { id: number; name: string };
  vehicle_owner?: { id: number };
  driver?: { id: number };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerOwner: (payload: Record<string, any>) => Promise<void>;
  registerManager: (payload: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  confirmPasswordReset: (
    email: string,
    otp: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        try {
          const { data } = await api.get('/me');
          setUser(data);
        } catch {
          await SecureStore.deleteItemAsync('auth_token');
        }
      }
      setLoading(false);
    })();
  }, []);

  const persistSession = async (token: string, userData: AuthUser) => {
    await SecureStore.setItemAsync('auth_token', token);
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/login', { email, password });
    await persistSession(data.token, data.user);
  };

  const registerOwner = async (payload: Record<string, any>) => {
    const { data } = await api.post('/register/owner', payload); // payload includes sacco_id from dropdown
    await persistSession(data.token, data.user);
  };

  const registerManager = async (payload: Record<string, any>) => {
    const { data } = await api.post('/register/manager', payload);
    await persistSession(data.token, data.user);
  };

  const resetPassword = async (email: string) => {
    await api.post('/forgot-password', { email });
  };

  const verifyOtp = async (email: string, otp: string) => {
    await api.post('/verify-otp', { email, otp });
  };

  const confirmPasswordReset = async (
    email: string,
    otp: string,
    password: string,
    password_confirmation: string
  ) => {
    await api.post('/reset-password', { email, otp, password, password_confirmation });
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    await SecureStore.deleteItemAsync('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerOwner,
        registerManager,
        logout,
        resetPassword,
        verifyOtp,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAppAuth must be used within AuthProvider');
  return ctx;
}