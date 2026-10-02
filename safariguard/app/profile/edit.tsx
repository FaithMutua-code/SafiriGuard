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
  Alert,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useAppAuth } from "@/context/AuthContext";
import { useOwnerProfile, useUpdateOwnerProfile } from "@/hooks/useOwnerData";

interface FormProps {
  initialUser: any;
  theme: ThemeColors;
}

function EditProfileForm({ initialUser, theme }: FormProps) {
  const s = makeStyles(theme);
  const updateMutation = useUpdateOwnerProfile();

  const [name, setName] = useState(initialUser?.name || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [idNumber, setIdNumber] = useState(initialUser?.vehicle_owner?.id_number || "");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    setError("");
    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        id_number: idNumber.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Profile Updated", "Your profile details have been saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const res = e?.response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;
      const firstError = res?.errors ? Object.values(res.errors)[0]?.[0] : undefined;
      setError(firstError || res?.message || "Could not update profile. Please try again.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {error ? (
        <View style={[s.errorBox, { backgroundColor: theme.dangerSoft }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={16} color={theme.danger} />
          <Text style={[s.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Form Card */}
      <View style={s.card}>
        {/* Full Name */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Full Name *</Text>
          <View style={s.inputWrapper}>
            <View style={s.inputIcon}>
              <IconSymbol name="person.fill" size={16} color={theme.textSecondary} />
            </View>
            <TextInput
              style={s.input}
              placeholder="e.g. John Kamau"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Phone Number</Text>
          <View style={s.inputWrapper}>
            <View style={s.inputIcon}>
              <IconSymbol name="phone.fill" size={16} color={theme.textSecondary} />
            </View>
            <TextInput
              style={s.input}
              placeholder="e.g. +254 712 345 678"
              placeholderTextColor={theme.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* National ID Number */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>National ID / ID Number</Text>
          <View style={s.inputWrapper}>
            <View style={s.inputIcon}>
              <IconSymbol name="creditcard.fill" size={16} color={theme.textSecondary} />
            </View>
            <TextInput
              style={s.input}
              placeholder="e.g. 12345678"
              placeholderTextColor={theme.textSecondary}
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Email Address */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Email Address</Text>
          <View style={s.inputWrapper}>
            <View style={s.inputIcon}>
              <IconSymbol name="envelope.fill" size={16} color={theme.textSecondary} />
            </View>
            <TextInput
              style={s.input}
              placeholder="e.g. owner@safariguard.ke"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[
          s.saveBtn,
          { backgroundColor: theme.primary },
          updateMutation.isPending && { opacity: 0.75 },
        ]}
        activeOpacity={0.85}
        onPress={handleSave}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" />
            <Text style={s.saveBtnText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={s.cancelBtn}
        activeOpacity={0.7}
        onPress={() => router.back()}
      >
        <Text style={s.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();
  const s = makeStyles(theme);
  const { user: authUser } = useAppAuth();
  const { data: profileUser, isLoading: isProfileLoading } = useOwnerProfile();

  const currentUser = profileUser || authUser;

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.primary, theme.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <View style={s.navRow}>
            <TouchableOpacity
              style={s.backBtn}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={s.headerSubtitle}>Keep your owner contact and identification details up to date.</Text>
        </LinearGradient>

        {isProfileLoading && !currentUser ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={theme.primary} size="large" />
          </View>
        ) : (
          <EditProfileForm
            key={currentUser?.id || "default"}
            initialUser={currentUser}
            theme={theme}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 13,
      color: "rgba(255, 255, 255, 0.8)",
      lineHeight: 18,
    },
    scrollContent: {
      padding: 18,
      paddingBottom: 40,
    },
    loadingWrap: {
      paddingVertical: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
      gap: 10,
    },
    errorText: {
      fontSize: 13,
      fontWeight: "500",
      flex: 1,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginBottom: 20,
    },
    fieldGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.textSecondary,
      marginBottom: 6,
      letterSpacing: 0.3,
      textTransform: "uppercase",
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
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.textPrimary,
      paddingVertical: 0,
    },
    saveBtn: {
      height: 52,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },
    saveBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    cancelBtn: {
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
    },
  });
