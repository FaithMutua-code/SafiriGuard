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
    primary: "#6152FF",
    background: "#F8F9FA",
    surface: "#FFFFFF",
    foreground: "#1E293B",
    muted: "#8E8E93",
    border: "#E2E8F0",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    accent: "#FF9500",
    elevated: "#FFFFFF",
    tint: "#6152FF",
  },

  dark: {
    primary: "#6152FF",
    background: "#F8F9FA",
    surface: "#FFFFFF",
    foreground: "#1E293B",
    muted: "#8E8E93",
    border: "#E2E8F0",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    accent: "#FF9500",
    elevated: "#FFFFFF",
    tint: "#6152FF",
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
  const [colorScheme, setColorSchemeState] =
    useState<ColorScheme>("light");

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