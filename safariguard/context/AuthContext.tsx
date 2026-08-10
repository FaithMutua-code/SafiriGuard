// context/AuthContext.tsx — Vehicle Owner only
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '@/api/client';

export type UserRole = 'vehicle_owner';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  sacco?: { id: number; name: string };
  vehicle_owner?: { id: number; id_number?: string };
}

interface RegisterOwnerPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  id_number: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerOwner: (payload: RegisterOwnerPayload) => Promise<void>;
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
          // Only allow vehicle_owner role in the mobile app
          if (data.role === 'vehicle_owner') {
            setUser(data);
          } else {
            // Non-owner accounts should not use the mobile app
            await SecureStore.deleteItemAsync('auth_token');
          }
        } catch (err) {
          console.error('Session restore failed:', err);
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

    if (data.user.role !== 'vehicle_owner') {
      throw new Error('This app is for Vehicle Owners only. Please use the appropriate platform.');
    }

    await persistSession(data.token, data.user);
  };

  const registerOwner = async (payload: RegisterOwnerPayload) => {
    const { data } = await api.post('/register/owner', payload);
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
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
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