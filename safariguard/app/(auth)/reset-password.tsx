// app/(auth)/reset-password.tsx
import React, { useState, useRef, useEffect } from "react";
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

type Step = "email" | "otp" | "password";
const STEPS: Step[] = ["email", "otp", "password"];
const EMPTY_OTP = ["", "", "", "", "", ""];

export default function ResetPasswordScreen() {
  const { resetPassword, verifyOtp, confirmPasswordReset } = useAppAuth();

  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [focusedOtp, setFocusedOtp] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const confirmRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop the resend countdown if the screen unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(60);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword(email.trim());
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
    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email.trim(), otpString);
      setStep("password");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Invalid or expired code");
      setOtp(EMPTY_OTP);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await confirmPasswordReset(email.trim(), otp.join(""), password, confirmPassword);
      router.replace("/(auth)/login" as any);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handles typing one digit, and pasting / SMS autofill of the whole code
  const handleOtpChange = (raw: string, index: number) => {
    const digits = raw.replace(/\D/g, "");
    const next = [...otp];

    if (!digits) {
      next[index] = "";
      setOtp(next);
      return;
    }
    if (digits.length > 1) {
      digits
        .slice(0, 6 - index)
        .split("")
        .forEach((d, i) => {
          next[index + i] = d;
        });
      setOtp(next);
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    next[index] = digits;
    setOtp(next);
    if (index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const content = {
    email: {
      title: "Reset password",
      subtitle: "Enter the email linked to your account and we'll send you a code.",
    },
    otp: { title: "Check your email", subtitle: `We sent a 6-digit code to ${email.trim()}` },
    password: { title: "New password", subtitle: "Create a strong new password for your account." },
  }[step];

  const stepIndex = STEPS.indexOf(step);

  const handleBack = () => {
    setError("");
    if (step === "email") router.back();
    else if (step === "otp") setStep("email");
    else setStep("otp");
  };

  const primary = {
    email: { title: "Send code", onPress: handleSendOtp },
    otp: { title: "Verify code", onPress: handleVerifyOtp },
    password: { title: "Reset password", onPress: handleResetPassword },
  }[step];

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
        <AuthHeader onBack={handleBack} />

        <View style={styles.card}>
          {/* Progress */}
          <View style={styles.progressRow}>
            {STEPS.map((s, i) => (
              <View
                key={s}
                style={[styles.progressBar, i <= stepIndex && styles.progressBarOn]}
              />
            ))}
          </View>
          <Text style={styles.stepLabel}>Step {stepIndex + 1} of 3</Text>

          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          <View style={styles.form}>
            {step === "email" && (
              <AuthInput
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
              />
            )}

            {step === "otp" && (
              <>
                <View style={styles.otpRow}>
                  {otp.map((digit, index) => {
                    const active = focusedOtp === index || !!digit;
                    return (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          otpRefs.current[index] = ref;
                        }}
                        style={[styles.otpInput, active && styles.otpInputActive]}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e.nativeEvent.key, index)}
                        onFocus={() => setFocusedOtp(index)}
                        onBlur={() => setFocusedOtp(null)}
                        keyboardType="number-pad"
                        textAlign="center"
                        selectTextOnFocus
                        textContentType="oneTimeCode"
                        autoComplete={index === 0 ? "sms-otp" : "off"}
                      />
                    );
                  })}
                </View>

                <View style={styles.resendRow}>
                  <Text style={styles.resendLabel}>{"Didn't"} get it? </Text>
                  <TouchableOpacity
                    onPress={() => resendTimer === 0 && handleSendOtp()}
                    disabled={resendTimer > 0}
                  >
                    <Text
                      style={[styles.resendLink, resendTimer > 0 && styles.resendDisabled]}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === "password" && (
              <>
                <AuthInput
                  label="New password"
                  placeholder="Create a new password"
                  hint="At least 8 characters"
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
                  label="Confirm password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
              </>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <IconSymbol name="xmark.circle.fill" size={15} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <GradientButton title={primary.title} onPress={primary.onPress} loading={loading} />
          </View>

          {step === "email" && (
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remembered your password? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 26,
    paddingBottom: 40,
  },

  progressRow: { flexDirection: "row", gap: 6 },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E9E4FF",
  },
  progressBarOn: { backgroundColor: COLORS.primary },
  stepLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.label,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 14,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORS.muted,
    marginTop: 6,
    marginBottom: 26,
  },

  form: { gap: 18, marginBottom: 26 },

  otpRow: { flexDirection: "row", gap: 8 },
  otpInput: {
    flex: 1,
    height: 60,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.ink,
    paddingVertical: 0,
  },
  otpInputActive: { borderColor: COLORS.primary, backgroundColor: "#FBFAFF" },
  resendRow: { flexDirection: "row", justifyContent: "center" },
  resendLabel: { color: COLORS.muted, fontSize: 13.5 },
  resendLink: { color: COLORS.primary, fontSize: 13.5, fontWeight: "800" },
  resendDisabled: { color: "#A9A5C9" },

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