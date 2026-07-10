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
          shadowColor: glowColor || '#6152FF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 6,
        },
        style,
      ]}
      className={cn("bg-surface rounded-[24px] overflow-hidden", className)}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
});
