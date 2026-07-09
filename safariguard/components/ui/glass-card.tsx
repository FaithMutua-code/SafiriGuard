import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { cn } from "@/lib/utils";

interface GlassCardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
  glowColor?: string;
}

export function GlassCard({ className, children, glow = false, glowColor, style, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        glow && {
          shadowColor: glowColor || '#3B82F6',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
        style,
      ]}
      className={cn("bg-surface rounded-2xl border border-border overflow-hidden", className)}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
