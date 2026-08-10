import { ColorScheme } from "@/lib/theme-provider";

export type ThemeColorPalette = {
  primary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  accent: string;
  elevated: string;
  tint: string;
};

export const Colors = {
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

export { ColorScheme };
export const Fonts = {};
export const SchemeColors = Colors;
export const ThemeColors = Colors;
