// app/register.tsx
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
import SaccoDropdown, { Sacco } from "@/components/SaccoDropdown";

type RegisterRole = "manager" | "owner";

const ROLES: { id: RegisterRole; label: string }[] = [
  { id: "manager", label: "SACCO Manager" },
  { id: "owner", label: "Vehicle Owner" },
];

export default function RegisterScreen() {
  const { registerOwner, registerManager } = useAppAuth();

  const [selectedRole, setSelectedRole] = useState<RegisterRole>("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Owner-only
  const [selectedSacco, setSelectedSacco] = useState<Sacco | null>(null);
  const [idNumber, setIdNumber] = useState("");

  // Manager-only (creates the SACCO)
  const [saccoName, setSaccoName] = useState("");
  const [saccoAddress, setSaccoAddress] = useState("");

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
    if (selectedRole === "owner" && !selectedSacco) {
      setError("Please select your SACCO");
      return;
    }
    if (selectedRole === "owner" && !idNumber.trim()) {
      setError("ID number is required");
      return;
    }
    if (selectedRole === "manager" && !saccoName.trim()) {
      setError("SACCO name is required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      if (selectedRole === "manager") {
        await registerManager({
          name,
          email,
          phone: phone || undefined,
          password,
          sacco_name: saccoName,
          address: saccoAddress || undefined,
        });
        router.replace("/(tabs)");
      } else {
        await registerOwner({
          name,
          email,
          phone: phone || undefined,
          password,
          sacco_id: selectedSacco!.id,
          id_number: idNumber,
        });
        router.replace("/onboarding/add-vehicle");
      }
    } catch (e: any) {
      const responseData = e?.response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;

      const firstFieldError = responseData?.errors
        ? Object.values(responseData.errors)[0]?.[0]
        : undefined;

      setError(responseData?.message || firstFieldError || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow.left" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SafariGuard today</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>I am a</Text>
          <View style={styles.roleRow}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.8}
                style={[styles.roleChip, selectedRole === role.id && styles.roleChipActive]}
              >
                <Text style={[styles.roleChipText, selectedRole === role.id && styles.roleChipTextActive]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>
            Drivers {"don't"} register here — your vehicle owner will invite you once you have an account with them.
          </Text>
        </View>

        <View style={styles.form}>
          <InputField icon="person.fill" placeholder="Full Name *" value={name} onChangeText={setName} autoCapitalize="words" />
          <InputField icon="envelope.fill" placeholder="Email Address *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputField icon="phone.fill" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          {selectedRole === "owner" && (
            <>
              <SaccoDropdown value={selectedSacco} onSelect={setSelectedSacco} />
              <InputField icon="person.text.rectangle.fill" placeholder="National ID Number *" value={idNumber} onChangeText={setIdNumber} keyboardType="number-pad" />
            </>
          )}

          {selectedRole === "manager" && (
            <>
              <InputField icon="building.2.fill" placeholder="SACCO Name *" value={saccoName} onChangeText={setSaccoName} autoCapitalize="words" />
              <InputField icon="mappin.and.ellipse" placeholder="SACCO Address" value={saccoAddress} onChangeText={setSaccoAddress} />
            </>
          )}

          <InputField icon="lock.fill" placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />
          <InputField icon="lock.fill" placeholder="Confirm Password *" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

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
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.registerButtonText}>Create Account</Text>}
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

function InputField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: any) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon}>
        <IconSymbol name={icon} size={16} color="#64748B" />
      </View>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={16} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 32 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#1E293B" },
  subtitle: { fontSize: 14, color: "#8E8E93", marginTop: 4 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, color: "#8E8E93", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  roleRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  roleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
  roleChipActive: { borderColor: "#6152FF", backgroundColor: "#6152FF11" },
  roleChipText: { fontSize: 13, color: "#8E8E93", fontWeight: "500" },
  roleChipTextActive: { color: "#6152FF" },
  hint: { fontSize: 12, color: "#94A3B8", marginTop: 8, lineHeight: 16 },
  form: { gap: 12, marginBottom: 24 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { color: "#1E293B", fontSize: 15, height: "100%" },
  eyeButton: { padding: 4 },
  errorContainer: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EF444411", borderRadius: 8, padding: 10 },
  errorText: { color: "#EF4444", fontSize: 13 },
  registerButton: { backgroundColor: "#6152FF", borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center", marginTop: 4, shadowColor: "#6152FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  buttonDisabled: { opacity: 0.7 },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginText: { color: "#8E8E93", fontSize: 14 },
  loginLink: { color: "#6152FF", fontSize: 14, fontWeight: "600" },
});