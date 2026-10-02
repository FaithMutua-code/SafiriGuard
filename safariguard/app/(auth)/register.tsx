// app/(auth)/register.tsx — Vehicle Owner registration only
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
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
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AuthHeader onBack={() => router.back()} />

        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Register as a vehicle owner. It takes a minute.
          </Text>

          <View style={styles.form}>
            <AuthInput
              label="Full name *"
              placeholder="Jane Wanjiru"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              submitBehavior="submit"
            />
            <AuthInput
              ref={emailRef}
              label="Email address *"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              submitBehavior="submit"
            />
            <AuthInput
              ref={phoneRef}
              label="Phone number"
              placeholder="07XX XXX XXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
            <AuthInput
              ref={passwordRef}
              label="Password *"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              submitBehavior="submit"
            />
            <AuthInput
              ref={confirmRef}
              label="Confirm password *"
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

            {error ? (
              <View style={styles.errorContainer}>
                <IconSymbol name="xmark.circle.fill" size={15} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <GradientButton
              title="Create account"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

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

  form: { gap: 18, marginBottom: 26 },

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