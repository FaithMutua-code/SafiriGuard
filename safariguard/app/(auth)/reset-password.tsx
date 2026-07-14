// app/(auth)/reset-password.tsx
import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppAuth } from "@/context/AuthContext";

const PURPLE = "#6152FF";
type Step = "email" | "otp" | "password";

export default function ResetPasswordScreen() {
  const { resetPassword, verifyOtp, confirmPasswordReset } = useAppAuth();

  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const startTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) { setError("Please enter your email address"); return; }
    setError(""); setLoading(true);
    try {
      await resetPassword(email);
      setStep("otp");
      startTimer();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) { setError("Please enter the complete 6-digit code"); return; }
    setError(""); setLoading(true);
    try {
      await verifyOtp(email, otpString);
      setStep("password");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Invalid or expired code");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      await confirmPasswordReset(email, otp.join(""), password, confirmPassword);
      router.replace("/(auth)/login" as any);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (!value && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const stepContent = {
    email:    { title: "Reset Password", subtitle: "Enter the email linked to your account and we'll send you a code." },
    otp:      { title: "Check Your Email", subtitle: `We sent a 6-digit code to\n${email}` },
    password: { title: "New Password", subtitle: "Create a strong new password for your account." },
  };

  const handleBack = () => {
    if (step === "email") router.back();
    else if (step === "otp") setStep("email");
    else setStep("otp");
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="arrow.left" size={20} color="#1E293B" />
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {(["email", "otp", "password"] as Step[]).map((s, i) => {
              const stepIndex = { email: 0, otp: 1, password: 2 }[step];
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <View key={s} style={styles.stepRow}>
                  <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
                    {done ? (
                      <IconSymbol name="checkmark" size={12} color="#fff" />
                    ) : (
                      <Text style={[styles.stepNum, active && { color: "#fff" }]}>{i + 1}</Text>
                    )}
                  </View>
                  {i < 2 && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
                </View>
              );
            })}
          </View>

          <View style={[styles.iconCircle, step === "otp" && styles.iconCircleOtp]}>
            <IconSymbol
              name={step === "email" ? "envelope.fill" : step === "otp" ? "lock.fill" : "lock.fill"}
              size={26} color={PURPLE}
            />
          </View>
          <Text style={styles.title}>{stepContent[step].title}</Text>
          <Text style={styles.subtitle}>{stepContent[step].subtitle}</Text>
        </View>

        {/* ── Step 1: Email ── */}
        {step === "email" && (
          <View style={styles.form}>
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
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={handleSendOtp} activeOpacity={0.85} style={[styles.submitButton, loading && styles.buttonDisabled]} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Send Code</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 2: OTP ── */}
        {step === "otp" && (
          <View style={styles.form}>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpRefs.current[index] = ref; }}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val.slice(-1), index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>

            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>{"Didn't"} get it? </Text>
              <TouchableOpacity onPress={() => resendTimer === 0 && handleSendOtp()} disabled={resendTimer > 0}>
                <Text style={[styles.resendLink, resendTimer > 0 && { color: "#94A3B8" }]}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={handleVerifyOtp} activeOpacity={0.85} style={[styles.submitButton, loading && styles.buttonDisabled]} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Verify Code</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 3: New Password ── */}
        {step === "password" && (
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <IconSymbol name="lock.fill" size={16} color="#64748B" />
              </View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="New password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <IconSymbol name="lock.fill" size={16} color="#64748B" />
              </View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirm password"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                <IconSymbol name={showConfirm ? "eye.slash.fill" : "eye.fill"} size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={handleResetPassword} activeOpacity={0.85} style={[styles.submitButton, loading && styles.buttonDisabled]} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Reset Password</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === "email" && (
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Remembered your password? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 32 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  stepIndicator: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 26, height: 26, borderRadius: 9, backgroundColor: "#6152FF15", alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: PURPLE },
  stepDotDone: { backgroundColor: "#10B981" },
  stepNum: { fontSize: 12, fontWeight: "700", color: "#6152FF88" },
  stepLine: { width: 32, height: 2, marginHorizontal: 4, backgroundColor: "#E2E8F0" },
  stepLineDone: { backgroundColor: "#10B981" },
  iconCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#6152FF11", borderWidth: 1, borderColor: "#6152FF22", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  iconCircleOtp: { backgroundColor: "#6152FF15" },
  title: { fontSize: 26, fontWeight: "800", color: "#1E293B", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#8E8E93", lineHeight: 20 },
  form: { gap: 12, marginBottom: 24 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#1E293B", fontSize: 15, height: "100%" },
  eyeButton: { padding: 4 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  otpInput: { width: 46, height: 54, borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF", fontSize: 22, fontWeight: "700", color: "#1E293B" },
  otpInputFilled: { borderColor: PURPLE },
  resendRow: { flexDirection: "row", justifyContent: "center", marginBottom: 4 },
  resendLabel: { color: "#8E8E93", fontSize: 13 },
  resendLink: { color: PURPLE, fontSize: 13, fontWeight: "600" },
  errorContainer: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EF444411", borderRadius: 8, padding: 10 },
  errorText: { color: "#EF4444", fontSize: 13 },
  submitButton: { backgroundColor: PURPLE, borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center", marginTop: 4, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 },
  loginText: { color: "#8E8E93", fontSize: 14 },
  loginLink: { color: PURPLE, fontSize: 14, fontWeight: "600" },
});