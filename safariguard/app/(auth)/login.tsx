// app/login.tsx (or wherever your login route lives)
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppAuth } from "@/context/AuthContext";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthHeader, CARD_OVERLAP } from "@/components/auth/AuthHeader";
import { GradientButton } from "@/components/auth/GradientButton";
import { COLORS } from "@/components/auth/tokens";

export default function LoginScreen() {
  const { login } = useAppAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shakeAnim] = useState(() => new Animated.Value(0));
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      shake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Invalid email or password");
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AuthHeader />

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to keep an eye on your fleet.
          </Text>

          <Animated.View
            style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}
          >
            <AuthInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
            />

            <AuthInput
              ref={passwordRef}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/reset-password" as any)}
              style={styles.forgotButton}
              hitSlop={8}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorContainer}>
                <IconSymbol name="xmark.circle.fill" size={15} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <GradientButton title="Sign In" onPress={handleLogin} loading={loading} />
          </Animated.View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to SafariGuard? </Text>
            <TouchableOpacity onPress={() => router.push("/register" as any)}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1 },

  card: {
    flex: 1,
    zIndex: 1,
    marginTop: -CARD_OVERLAP,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14.5,
    color: COLORS.muted,
    marginTop: 6,
    marginBottom: 26,
  },

  form: { gap: 18, marginBottom: 28 },
  forgotButton: { alignSelf: "flex-end", marginTop: -6 },
  forgotText: { color: COLORS.primary, fontSize: 13.5, fontWeight: "700" },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#FBD5D5",
  },
  errorText: { color: "#C93B3B", fontSize: 13, flex: 1, fontWeight: "500" },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: COLORS.muted, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: "800" },
});