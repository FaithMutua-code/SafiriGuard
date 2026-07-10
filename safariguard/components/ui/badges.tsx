import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

// Placeholder type (replace with your actual type later)
export type UserRole = "manager" | "owner" | "driver" | "admin";

// Role Badge
interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const config = {
    manager: {
      label: "SACCO Manager",
      color: "#3B82F6",
      bg: "#3B82F622",
    },
    owner: {
      label: "Vehicle Owner",
      color: "#10B981",
      bg: "#10B98122",
    },
    driver: {
      label: "Driver",
      color: "#F59E0B",
      bg: "#F59E0B22",
    },
    admin: {
      label: "Administrator",
      color: "#A855F7",
      bg: "#A855F722",
    },
  }[role] ?? {
    label: "Unknown Role",
    color: "#6B7280",
    bg: "#6B728022",
  };

  const fontSize = size === "sm" ? 9 : 11;
  const paddingH = size === "sm" ? 6 : 8;
  const paddingV = size === "sm" ? 2 : 3;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: config.color,
            fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

// Vehicle Status Badge
interface StatusBadgeProps {
  status: "active" | "idle" | "offline" | "maintenance";
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  const config = {
    active: {
      label: "Active",
      color: "#10B981",
      bg: "#10B98122",
      dot: "#10B981",
    },
    idle: {
      label: "Idle",
      color: "#F59E0B",
      bg: "#F59E0B22",
      dot: "#F59E0B",
    },
    offline: {
      label: "Offline",
      color: "#EF4444",
      bg: "#EF444422",
      dot: "#EF4444",
    },
    maintenance: {
      label: "Maintenance",
      color: "#64748B",
      bg: "#64748B22",
      dot: "#64748B",
    },
  }[status];

  const fontSize = size === "sm" ? 9 : 11;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingHorizontal: 8,
          paddingVertical: 3,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text
        style={[
          styles.badgeText,
          {
            color: config.color,
            fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

// Alert Severity Badge
interface SeverityBadgeProps {
  severity: "critical" | "warning" | "info";
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = {
    critical: {
      label: "Critical",
      color: "#EF4444",
      bg: "#EF444422",
    },
    warning: {
      label: "Warning",
      color: "#F59E0B",
      bg: "#F59E0B22",
    },
    info: {
      label: "Info",
      color: "#3B82F6",
      bg: "#3B82F622",
    },
  }[severity];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: config.color,
            fontSize: 10,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

// Shimmer Loader
interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function ShimmerLoader({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: ShimmerProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#E2E8F0",
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});