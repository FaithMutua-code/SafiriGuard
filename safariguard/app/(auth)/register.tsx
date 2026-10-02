// app/(auth)/register.tsx — Vehicle Owner registration only
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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

export default function RegisterScreen() {
  const { registerOwner } = useAppAuth();

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await registerOwner({
        name,
        email,
        phone: phone || undefined,
        password,
      });
      router.replace("/onboarding/add-vehicle");
    } catch (e: any) {
      const responseData = e?.response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;

      const firstFieldError = responseData?.errors
        ? Object.values(responseData.errors)[0]?.[0]
        : undefined;

      setError(
        responseData?.message ||
          firstFieldError ||
          "Registration failed. Please try again."
      );
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

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <IconSymbol name="arrow.left" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🛡</Text>
          </View>
          <Text style={styles.heroTitle}>Create Account</Text>
          <Text style={styles.heroSubtitle}>
            Register as a Vehicle Owner on SafariGuard
          </Text>
        </LinearGradient>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionText}>Personal Details</Text>
          </View>

          <View style={styles.group}>
            <AuthInput
              label="Full name *"
              icon="person.fill"
              placeholder="Jane Wanjiru"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
            <AuthInput
              ref={emailRef}
              label="Email address *"
              icon="envelope.fill"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
            />
            <AuthInput
              ref={phoneRef}
              label="Phone number"
              icon="phone.fill"
              placeholder="07XX XXX XXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View style={[styles.sectionHeader, { marginTop: 28 }]}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionText}>Security</Text>
          </View>

          <View style={styles.group}>
            <AuthInput
              ref={passwordRef}
              label="Password *"
              icon="lock.fill"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
            />
            <AuthInput
              ref={confirmRef}
              label="Confirm password *"
              icon="lock.fill"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="xmark.circle.fill" size={15} color="#E5484D" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleRegister}
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
                  <Text style={styles.buttonText}>Create Account</Text>
                  <IconSymbol name="chevron.right" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    paddingTop: 60,
    paddingBottom: 68,
    paddingHorizontal: 24,
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
  backButton: {
    alignSelf: "flex-start",
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 30 },
  heroTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    flex: 1,
    marginTop: -32,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6152FF",
  },
  sectionText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#6152FF",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  group: { gap: 16 },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#FBD5D5",
    marginTop: 20,
  },
  errorText: { color: "#C93B3B", fontSize: 13, flex: 1, fontWeight: "500" },

  buttonShadow: {
    borderRadius: 18,
    marginTop: 28,
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
    marginTop: 24,
  },
  footerText: { color: "#7A839C", fontSize: 14 },
  footerLink: { color: "#6152FF", fontSize: 14, fontWeight: "700" },
});