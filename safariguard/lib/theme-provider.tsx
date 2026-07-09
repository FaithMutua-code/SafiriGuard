import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Appearance,
  View,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

export type ColorScheme = "light" | "dark";

const SchemeColors = {
  light: {
    primary: "#3B82F6",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    foreground: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    accent: "#8B5CF6",
    elevated: "#FFFFFF",
    tint: "#2563EB",
  },

  dark: {
    primary: "#3B82F6",
    background: "#0F172A",
    surface: "#162032",
    foreground: "#F8FAFC",
    muted: "#94A3B8",
    border: "#334155",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    accent: "#8B5CF6",
    elevated: "#1E293B",
    tint: "#60A5FA",
  },
};

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useSystemColorScheme() ?? "light";

  const [colorScheme, setColorSchemeState] =
    useState<ColorScheme>(systemScheme);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);

    Appearance.setColorScheme?.(scheme);
  }, []);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      applyScheme(scheme);
    },
    [applyScheme]
  );

  useEffect(() => {
    applyScheme(colorScheme);
  }, [colorScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
        "color-accent": SchemeColors[colorScheme].accent,
        "color-elevated": SchemeColors[colorScheme].elevated,
        "color-tint": SchemeColors[colorScheme].tint,
      }),
    [colorScheme]
  );

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        setColorScheme,
      }}
    >
      <View
        style={[
          {
            flex: 1,
          },
          themeVariables,
        ]}
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useThemeContext must be used within ThemeProvider"
    );
  }

  return context;
}