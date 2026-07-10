import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { GlassCard } from "./glass-card";
import { IconSymbol } from "./icon-symbol";
import { SymbolViewProps } from "expo-symbols";

type IconName = SymbolViewProps["name"];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  iconColor: string;
  trend?: number;
  subtitle?: string;
  glow?: boolean;
  glowColor?: string;
}

export function StatCard({ label, value, icon, iconColor, trend, subtitle, glow, glowColor }: StatCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <GlassCard glow={glow} glowColor={glowColor} className="p-4 flex-1">
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.iconRow}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '22' }]}>
            <IconSymbol name={icon} size={18} color={iconColor} />
          </View>
          {trend !== undefined && (
            <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? '#10B98122' : '#EF444422' }]}>
              <Text style={[styles.trendText, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
});
