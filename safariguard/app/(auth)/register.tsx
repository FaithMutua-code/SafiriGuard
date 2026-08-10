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



          <View style={[styles.sectionLabel, { marginTop: 8 }]}>
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

          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.85}
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            disabled={loading}
          >
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
  return (
    <View style={styles.inputWrapper}>
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
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  header: { marginBottom: 28 },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
    shadowColor: "#6152FF", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  logoRow: { alignItems: "center", marginBottom: 16 },
  shieldOuter: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: "#6152FF15", borderWidth: 1, borderColor: "#6152FF33",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#6152FF", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  shieldInner: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: "#6152FF22", alignItems: "center", justifyContent: "center",
  },
  shieldIcon: { fontSize: 22 },
  title: { fontSize: 26, fontWeight: "800", color: "#1E293B", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 6, textAlign: "center", lineHeight: 19 },

  sectionLabel: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 10, marginTop: 4,
  },
  sectionDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#6152FF" },
  sectionLabelText: {
    fontSize: 11, fontWeight: "700", color: "#6152FF",
    textTransform: "uppercase", letterSpacing: 0.8,
  },

  form: { gap: 10, marginBottom: 24 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 14,
    borderWidth: 1, borderColor: "#E8ECF4",
    paddingHorizontal: 14, height: 54,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { color: "#1E293B", fontSize: 15, height: "100%" },
  eyeButton: { padding: 4 },
  errorContainer: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1 },
  registerButton: {
    backgroundColor: "#6152FF", borderRadius: 16, height: 56,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginTop: 8,
    shadowColor: "#6152FF", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.4 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginText: { color: "#64748B", fontSize: 14 },
  loginLink: { color: "#6152FF", fontSize: 14, fontWeight: "700" },
});