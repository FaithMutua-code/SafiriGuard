// components/auth/GradientButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLORS } from "./tokens";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function GradientButton({ title, onPress, loading, disabled }: Props) {
  const inactive = loading || disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={inactive}
      style={[styles.shadow, inactive && styles.inactive]}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.violet, COLORS.lilac]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.text}>{title}</Text>
            <View style={styles.iconCircle}>
              <IconSymbol name="arrow.right" size={15} color={COLORS.primary} />
            </View>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  inactive: { opacity: 0.7 },
  button: {
    height: 58,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});