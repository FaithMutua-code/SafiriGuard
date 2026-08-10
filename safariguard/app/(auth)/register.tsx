// app/(auth)/register.tsx — Vehicle Owner registration only
import React, { useState } from "react";
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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppAuth } from "@/context/AuthContext";

export default function RegisterScreen() {
  const { registerOwner } = useAppAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");

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

    if (!idNumber.trim()) {
      setError("National ID number is required");
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
        id_number: idNumber,
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

      {/* Ambient background glows */}
      <View pointerEvents="none" style={styles.glowTopRight} />
      <View pointerEvents="none" style={styles.glowBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow.left" size={20} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.shieldOuter}>
              <View style={styles.shieldRing} />
              <View style={styles.shieldInner}>
                <Text style={styles.shieldIcon}>🛡</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register as a Vehicle Owner on SafariGuard
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionLabel}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabelText}>Personal Details</Text>
            </View>

            <InputField
              icon="person.fill"
              placeholder="Full Name *"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <InputField
              icon="envelope.fill"
              placeholder="Email Address *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              icon="phone.fill"
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <InputField
              icon="person.text.rectangle.fill"
              placeholder="National ID Number *"
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionLabel}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabelText}>Security</Text>
            </View>

            <InputField
              icon="lock.fill"
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <InputField
              icon="lock.fill"
              placeholder="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.88}
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            <View style={styles.buttonHighlight} />
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.registerButtonText}>Create Account</Text>
                <IconSymbol name="chevron.right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
      <View style={styles.inputIcon}>
        <IconSymbol name={icon} size={16} color="#6152FF" />
      </View>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <IconSymbol
            name={showPassword ? "eye.slash.fill" : "eye.fill"}
            size={16}
            color="#94A3B8"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  glowTopRight: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#6152FF",
    opacity: 0.07,
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: -100,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#8B7CFF",
    opacity: 0.06,
  },

  header: { marginBottom: 32 },
  backButton: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAEDF5",
    alignItems: "center", justifyContent: "center", marginBottom: 24,
    shadowColor: "#1E293B", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  logoRow: { alignItems: "center", marginBottom: 20 },
  shieldOuter: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: "#6152FF12",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#6152FF", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22, shadowRadius: 20, elevation: 10,
  },
  shieldRing: {
    position: "absolute",
    width: 72, height: 72, borderRadius: 22,
    borderWidth: 1.5, borderColor: "#6152FF2A",
  },
  shieldInner: {
    width: 48, height: 48, borderRadius: 15,
    backgroundColor: "#6152FF20", alignItems: "center", justifyContent: "center",
  },
  shieldIcon: { fontSize: 23 },
  title: {
    fontSize: 28, fontWeight: "800", color: "#161B2E",
    textAlign: "center", letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13.5, color: "#6B7280", marginTop: 8,
    textAlign: "center", lineHeight: 20, letterSpacing: 0.1,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF0F7",
    padding: 16,
    gap: 10,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  sectionLabel: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 4,
  },
  sectionDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#6152FF" },
  sectionLabelText: {
    fontSize: 11, fontWeight: "700", color: "#6152FF",
    textTransform: "uppercase", letterSpacing: 1,
  },

  form: { gap: 14, marginBottom: 28 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FBFBFE", borderRadius: 14,
    borderWidth: 1.3, borderColor: "#EAEDF5",
    paddingHorizontal: 14, height: 54,
  },
  inputWrapperFocused: {
    borderColor: "#6152FF55",
    backgroundColor: "#FFFFFF",
    shadowColor: "#6152FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  inputIcon: { marginRight: 10 },
  input: { color: "#1E293B", fontSize: 15, height: "100%" },
  eyeButton: { padding: 4 },
  errorContainer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", borderRadius: 12, padding: 13,
    borderWidth: 1, borderColor: "#FCD5D5",
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1, fontWeight: "500" },

  registerButton: {
    backgroundColor: "#5A4CFB",
    borderRadius: 17, height: 58,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginTop: 4,
    shadowColor: "#5A4CFB", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32, shadowRadius: 22, elevation: 10,
    overflow: "hidden",
  },
  buttonHighlight: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "50%",
    backgroundColor: "#FFFFFF",
    opacity: 0.08,
  },
  buttonDisabled: { opacity: 0.7 },
  registerButtonText: {
    color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3,
  },

  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 4 },
  loginText: { color: "#6B7280", fontSize: 14 },
  loginLink: { color: "#5A4CFB", fontSize: 14, fontWeight: "700" },
});