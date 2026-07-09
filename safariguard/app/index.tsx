import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

const { width } = Dimensions.get("window");

const FEATURES = [
  { icon: "car.2.fill", label: "Live fleet tracking" },
  { icon: "shield.fill", label: "AI-powered safety alerts" },
  { icon: "chart.bar.fill", label: "Real-time analytics" },
] as const;

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.stagger(
      120,
      featureAnims.map(anim =>
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true })
      )
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative glow circles */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoCircle}>
          <IconSymbol name="shield.fill" size={40} color="#3B82F6" />
        </View>
        <Text style={styles.title}>SafariGuard</Text>
        <Text style={styles.subtitle}>
          Smarter fleet safety for{`Kenya's `} roads — powered by AI, built for real drivers.
        </Text>
      </Animated.View>

      <View style={styles.featureList}>
        {FEATURES.map((f, i) => (
          <Animated.View
            key={f.label}
            style={[
              styles.featureRow,
              {
                opacity: featureAnims[i],
                transform: [
                  {
                    translateY: featureAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.featureIcon}>
              <IconSymbol name={f.icon} size={16} color="#3B82F6" />
            </View>
            <Text style={styles.featureText}>{f.label}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[styles.ctaContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.push("/(auth)/login" as any)}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <IconSymbol name="arrow.right" size={16} color="#F1F5F9" />
        </TouchableOpacity>

        <Text style={styles.footerNote}>Made in Kenya 🇰🇪</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1526",
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingTop: 100,
    paddingBottom: 48,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute", top: -80, left: -60,
    width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
    backgroundColor: "#3B82F6", opacity: 0.08,
  },
  glowBottom: {
    position: "absolute", bottom: -100, right: -80,
    width: width * 0.9, height: width * 0.9, borderRadius: width * 0.45,
    backgroundColor: "#A855F7", opacity: 0.06,
  },
  hero: { alignItems: "center" },
  logoCircle: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: "#3B82F622", borderWidth: 1, borderColor: "#3B82F644",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  title: { fontSize: 30, fontWeight: "800", color: "#F1F5F9", letterSpacing: 0.3, marginBottom: 10 },
  subtitle: {
    fontSize: 14, color: "#94A3B8", textAlign: "center",
    lineHeight: 20, paddingHorizontal: 12,
  },
  featureList: { gap: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#3B82F622", alignItems: "center", justifyContent: "center",
  },
  featureText: { fontSize: 14, color: "#F1F5F9", fontWeight: "500" },
  ctaContainer: { alignItems: "center", gap: 16 },
  primaryButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#3B82F6", width: "100%", height: 54, borderRadius: 16,
  },
  primaryButtonText: { fontSize: 15, fontWeight: "700", color: "#F1F5F9" },
  footerNote: { fontSize: 12, color: "#64748B" },
});