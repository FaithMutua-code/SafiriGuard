// components/auth/AuthHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MatatuIllustration } from "./MatatuIllustration";
import { COLORS } from "./tokens";

// The card below uses marginTop: -CARD_OVERLAP so it covers the matatu's wheels.
export const CARD_OVERLAP = 44;

export function AuthHeader({ onBack }: { onBack?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#F7F4FF", "#E7E0FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[styles.hero, { height: insets.top + 196 }]}
    >
      <View pointerEvents="none" style={[styles.circle, { top: insets.top + 6 }]} />
      <View pointerEvents="none" style={styles.illo}>
        <MatatuIllustration width={206} />
      </View>

      <View style={[styles.topRow, { paddingTop: insets.top + 18 }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={8}>
            <IconSymbol name="arrow.left" size={19} color={COLORS.ink} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.brand}>
          SafariGuard<Text style={styles.dot}>.</Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: "hidden" },
  circle: {
    position: "absolute",
    right: -50,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#FFFFFF",
    opacity: 0.65,
  },
  illo: { position: "absolute", right: 6, bottom: 14 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -0.6,
  },
  dot: { color: COLORS.primary },
});