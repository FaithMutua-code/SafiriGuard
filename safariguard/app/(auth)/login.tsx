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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppAuth } from "@/context/AuthContext";
import { AuthInput } from "@/components/auth/AuthInput";

export default function LoginScreen() {
  const { login } = useAppAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FIX: lazy useState instead of useRef(...).current (react-hooks/refs lint)
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
      await login(email, password);
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
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#17104F", "#3426C4", "#6152FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View pointerEvents="none" style={styles.orbLarge} />
          <View pointerEvents="none" style={styles.orbSmall} />

          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🛡</Text>
          </View>
          <Text style={styles.appName}>SafariGuard</Text>
          <Text style={styles.tagline}>Intelligent Fleet Management</Text>
        </LinearGradient>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your fleet</Text>

          <Animated.View
            style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}
          >
            <AuthInput
              label="Email address"
              icon="envelope.fill"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <AuthInput
              ref={passwordRef}
              label="Password"
              icon="lock.fill"
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
                <IconSymbol name="xmark.circle.fill" size={15} color="#E5484D" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={loading}
              style={[styles.buttonShadow, loading && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={["#6B5CFF", "#4A3BF0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <IconSymbol name="chevron.right" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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

  hero: {
    alignItems: "center",
    paddingTop: 84,
    paddingBottom: 72,
    overflow: "hidden",
  },
  orbLarge: {
    position: "absolute",
    top: -70,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#FFFFFF",
    opacity: 0.07,
  },
  orbSmall: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FFFFFF",
    opacity: 0.06,
  },
  logoBox: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
  tagline: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
    letterSpacing: 0.6,
  },

  card: {
    flex: 1,
    marginTop: -32,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F1226",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A839C",
    marginTop: 6,
    marginBottom: 26,
  },

  form: { gap: 16, marginBottom: 28 },
  forgotButton: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { color: "#6152FF", fontSize: 13.5, fontWeight: "600" },

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

  buttonShadow: {
    borderRadius: 18,
    marginTop: 4,
    shadowColor: "#4A3BF0",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  button: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "#7A839C", fontSize: 14 },
  footerLink: { color: "#6152FF", fontSize: 14, fontWeight: "700" },
});