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
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { ownerApi } from "@/api/owner";

export default function AddVehicleScreen() {
  const { theme, isDark } = useTheme();
  const s = makeStyles(theme);

  const [numberPlate, setNumberPlate] = useState("");
  const [seatCapacity, setSeatCapacity] = useState("");
  const [fareAmount, setFareAmount] = useState("");
  const [routeName, setRouteName] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!numberPlate.trim()) {
      setError("Number plate is required (e.g. KCA 123A)");
      return;
    }
    if (!seatCapacity.trim() || isNaN(Number(seatCapacity)) || Number(seatCapacity) <= 0) {
      setError("Seat capacity is required (e.g. 14 or 33)");
      return;
    }
    if (!fareAmount.trim() || isNaN(Number(fareAmount)) || Number(fareAmount) <= 0) {
      setError("Fare per passenger (KES) is required (e.g. 100)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await ownerApi.createVehicle({
        number_plate: numberPlate.trim().toUpperCase(),
        seat_capacity: Number(seatCapacity),
        fare_amount: Number(fareAmount),
        route_name: routeName.trim() || undefined,
        make: make.trim() || undefined,
        model: model.trim() || undefined,
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
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.iconCircle}>
            <IconSymbol name="car.fill" size={28} color={theme.primary} />
          </View>
          <Text style={s.title}>Register Your Vehicle</Text>
          <Text style={s.subtitle}>
            Add your matatu or bus details to start monitoring operations with SafariGuard.
          </Text>
        </View>

        <View style={s.form}>
          <Text style={s.sectionHeader}>REQUIRED DETAILS</Text>
          <InputField
            theme={theme}
            icon="number"
            placeholder="Number Plate (e.g. KCA 123A) *"
            value={numberPlate}
            onChangeText={setNumberPlate}
            autoCapitalize="characters"
          />
          <InputField
            theme={theme}
            icon="person.3.fill"
            placeholder="Seat Capacity (e.g. 14, 33) *"
            value={seatCapacity}
            onChangeText={setSeatCapacity}
            keyboardType="number-pad"
          />
          <InputField
            theme={theme}
            icon="banknote.fill"
            placeholder="Fare per Passenger (KES) *"
            value={fareAmount}
            onChangeText={setFareAmount}
            keyboardType="decimal-pad"
          />

          <Text style={[s.sectionHeader, { marginTop: 8 }]}>OPTIONAL VEHICLE INFO</Text>
          <InputField
            theme={theme}
            icon="map.fill"
            placeholder="Route Name (e.g. Route 111: CBD - Ngong)"
            value={routeName}
            onChangeText={setRouteName}
            autoCapitalize="words"
          />
          <InputField
            theme={theme}
            icon="car.fill"
            placeholder="Make (e.g. Toyota, Isuzu)"
            value={make}
            onChangeText={setMake}
            autoCapitalize="words"
          />
          <InputField
            theme={theme}
            icon="car.fill"
            placeholder="Model (e.g. Hiace, NQR)"
            value={model}
            onChangeText={setModel}
            autoCapitalize="words"
          />
          <InputField
            theme={theme}
            icon="calendar"
            placeholder="Year (e.g. 2021)"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
          />

          {error ? (
            <View style={s.errorContainer}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={theme.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={[s.submitButton, loading && s.buttonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.submitButtonText}>Add Vehicle</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={s.skipButton}>
            <Text style={s.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({
  theme,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
}: {
  theme: ThemeColors;
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  const s = makeStyles(theme);
  return (
    <View style={s.inputWrapper}>
      <View style={s.inputIcon}>
        <IconSymbol name={icon} size={16} color={theme.textSecondary} />
      </View>
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false}
      />
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 50, paddingBottom: 40 },
    header: { alignItems: "center", marginBottom: 28 },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: { fontSize: 24, fontWeight: "800", color: theme.textPrimary, textAlign: "center" },
    subtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 6,
      textAlign: "center",
      lineHeight: 19,
    },
    form: { gap: 10 },
    sectionHeader: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 2,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingHorizontal: 14,
      height: 52,
    },
    inputIcon: { marginRight: 10 },
    // Compliant with rule: no height: "100%", use flex: 1, paddingVertical: 0
    input: {
      flex: 1,
      paddingVertical: 0,
      color: theme.textPrimary,
      fontSize: 14.5,
      fontWeight: "500",
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.dangerSoft,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.danger + "33",
    },
    errorText: { color: theme.danger, fontSize: 13, fontWeight: "500", flex: 1 },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },
    buttonDisabled: { opacity: 0.6 },
    submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
    skipButton: { alignItems: "center", marginTop: 12, paddingVertical: 8 },
    skipText: { color: theme.textSecondary, fontSize: 13, fontWeight: "600" },
  });