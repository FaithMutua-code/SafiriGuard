// app/onboarding/add-vehicle.tsx
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
import api from "@/api/client";

export default function AddVehicleScreen() {
  const [numberPlate, setNumberPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!numberPlate.trim()) {
      setError("Number plate is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/vehicles", {
        number_plate: numberPlate,
        make: make || undefined,
        model: model || undefined,
        year: year ? Number(year) : undefined,
      });
      router.replace("/(tabs)");
    } catch (e: any) {
      const responseData = e?.response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;
      const firstFieldError = responseData?.errors
        ? Object.values(responseData.errors)[0]?.[0]
        : undefined;
      setError(responseData?.message || firstFieldError || "Could not add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <IconSymbol name="car.fill" size={26} color="#6152FF" />
          </View>
          <Text style={styles.title}>Register Your First Vehicle</Text>
          <Text style={styles.subtitle}>
            Add your {"matatu/nganya's "}details to start monitoring it with SafariGuard.
          </Text>
        </View>

        <View style={styles.form}>
          <InputField icon="number" placeholder="Number Plate *" value={numberPlate} onChangeText={setNumberPlate} autoCapitalize="characters" />
          <InputField icon="car.fill" placeholder="Make (e.g. Toyota)" value={make} onChangeText={setMake} autoCapitalize="words" />
          <InputField icon="car.fill" placeholder="Model (e.g. Hiace)" value={model} onChangeText={setModel} autoCapitalize="words" />
          <InputField icon="calendar" placeholder="Year (e.g. 2019)" value={year} onChangeText={setYear} keyboardType="number-pad" />

          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Add Vehicle</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ icon, placeholder, value, onChangeText, keyboardType, autoCapitalize }: any) {
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon}>
        <IconSymbol name={icon} size={16} color="#64748B" />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 32 },
  iconCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#6152FF11", borderWidth: 1, borderColor: "#6152FF22", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#1E293B", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#8E8E93", marginTop: 8, textAlign: "center", lineHeight: 20 },
  form: { gap: 12 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#1E293B", fontSize: 15, height: "100%" },
  errorContainer: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EF444411", borderRadius: 8, padding: 10 },
  errorText: { color: "#EF4444", fontSize: 13 },
  submitButton: { backgroundColor: "#6152FF", borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center", marginTop: 4, shadowColor: "#6152FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  skipButton: { alignItems: "center", marginTop: 12 },
  skipText: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
});