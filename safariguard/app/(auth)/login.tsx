// app/login.tsx  (or wherever your login route lives)
import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Animated, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppAuth } from  "@/context/AuthContext"

export default function LoginScreen() {
  const { login } = useAppAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.shieldOuter}>
              <View style={styles.shieldInner}>
                <Text style={styles.shieldIcon}>🛡</Text>
              </View>
            </View>
          </View>
          <Text style={styles.appName}>SafariGuard</Text>
          <Text style={styles.tagline}>Intelligent Fleet Management</Text>
        </View>

        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <IconSymbol name="envelope.fill" size={16} color="#64748B" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <IconSymbol name="lock.fill" size={16} color="#64748B" />
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/reset-password" as any)}
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} style={[styles.loginButton, loading && styles.loginButtonDisabled]} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <IconSymbol name="chevron.right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>New to SafariGuard? </Text>
          <TouchableOpacity onPress={() => router.push("/register" as any)}>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 36 },
  logoContainer: { marginBottom: 16 },
  shieldOuter: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#6152FF15", borderWidth: 1, borderColor: "#6152FF33", alignItems: "center", justifyContent: "center", shadowColor: "#6152FF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  shieldInner: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#6152FF22", alignItems: "center", justifyContent: "center" },
  shieldIcon: { fontSize: 28 },
  appName: { fontSize: 28, fontWeight: "800", color: "#1E293B", letterSpacing: 1 },
  tagline: { fontSize: 13, color: "#64748B", marginTop: 4, letterSpacing: 0.5 },
  form: { gap: 12, marginBottom: 24 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#1E293B", fontSize: 15, height: "100%" },
  eyeButton: { padding: 4 },
  forgotButton: { alignSelf: "flex-end", marginTop: -2 },
  forgotText: { color: "#6152FF", fontSize: 13, fontWeight: "600" },
  errorContainer: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EF444411", borderRadius: 8, padding: 10 },
  errorText: { color: "#EF4444", fontSize: 13 },
  loginButton: { backgroundColor: "#6152FF", borderRadius: 14, height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, shadowColor: "#6152FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  registerText: { color: "#64748B", fontSize: 14 },
  registerLink: { color: "#6152FF", fontSize: 14, fontWeight: "600" },
});