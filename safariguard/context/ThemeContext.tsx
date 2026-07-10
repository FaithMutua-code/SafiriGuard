// contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = 'light' | 'dark';

const lightColors = {
  mode: 'light' as ThemeMode,
  primary: '#4B3F8F',
  primaryDeep: '#382F70',
  primaryLight: '#6C5DD3',
  accent: '#FF8A65',
  accentDeep: '#FF7043',
  accentSoft: '#FFE8DE',
  bg: '#F8F6FB',
  card: '#FFFFFF',
  cardBorder: '#EDE9F7',
  textPrimary: '#2B2440',
  textSecondary: '#8B84A3',
  textOnDark: 'rgba(255,255,255,0.92)',
  textOnDarkMuted: 'rgba(255,255,255,0.62)',
  emerald: '#2ECC8F',
  emeraldSoft: '#E1F9EF',
  electric: '#3E8FFF',
  electricSoft: '#E5EFFF',
  amber: '#F5A623',
  amberSoft: '#FFF3DE',
  danger: '#FF6B6B',
  dangerSoft: '#FFE7E7',
  track: '#ECE8F7',
  divider: '#EDE9F7',
};

const darkColors = {
  mode: 'dark' as ThemeMode,
  primary: '#6C5DD3',
  primaryDeep: '#382F70',
  primaryLight: '#8A7BE0',
  accent: '#FF8A65',
  accentDeep: '#FF7043',
  accentSoft: 'rgba(255,138,101,0.16)',
  bg: '#0A0F1E',
  card: '#111827',
  cardBorder: 'rgba(255,255,255,0.09)',
  textPrimary: '#F3F6FC',
  textSecondary: '#8A92A6',
  textOnDark: 'rgba(255,255,255,0.92)',
  textOnDarkMuted: 'rgba(255,255,255,0.62)',
  emerald: '#10E39F',
  emeraldSoft: 'rgba(16,227,159,0.14)',
  electric: '#3E8FFF',
  electricSoft: 'rgba(62,143,255,0.14)',
  amber: '#FFB648',
  amberSoft: 'rgba(255,182,72,0.14)',
  danger: '#FF5C7A',
  dangerSoft: 'rgba(255,92,122,0.14)',
  track: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.08)',
};

export type ThemeColors = typeof lightColors;

interface ThemeContextValue {
  theme: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'safariguard:theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark') {
        setModeState(saved);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  };

  const toggleTheme = () => setMode(mode === 'light' ? 'dark' : 'light');

  const value = useMemo<ThemeContextValue>(() => ({
    theme: mode === 'dark' ? darkColors : lightColors,
    mode,
    isDark: mode === 'dark',
    toggleTheme,
    setMode,
  }), [mode]);

  // Avoid flash of wrong theme before AsyncStorage resolves
  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}