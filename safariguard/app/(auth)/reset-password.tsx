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

// ---- Placeholder auth (replace with real backend) ----
function useAppAuth() {
  return {
    resetPassword: async (email: string) => {
      // TODO: replace with real password reset call
      return true;
    },
  };
}
// --------------------------------------------------------

export default function ResetPasswordScreen() {
  const { resetPassword } = useAppAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
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

          {!sent ? (
            <>
              <View style={styles.iconCircle}>
                <IconSymbol name="lock.fill" size={26} color="#6152FF" />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the email address linked to your account and {"we'll"} send you a reset link.
              </Text>
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
                <IconSymbol name="checkmark.circle.fill" size={26} color="#10B981" />
              </View>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
               {"We've "} sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
            </>
          )}
        </View>

        {!sent ? (
          <>
            {/* Form */}
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
                  onSubmitEditing={handleReset}
                />
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.85}
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Success state */}
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login' as any)}
              activeOpacity={0.85}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Back to Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleReset} style={styles.resendButton}>
              <Text style={styles.resendText}>{"Didn't"} get it? Resend email</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Login link */}
        {!sent && (
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 32 },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#6152FF11', borderWidth: 1, borderColor: '#6152FF22',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  iconCircleSuccess: {
    backgroundColor: '#10B98122', borderColor: '#10B98144',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8E8E93', lineHeight: 20 },
  emailHighlight: { color: '#1E293B', fontWeight: '600' },
  form: { gap: 12, marginBottom: 24 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1E293B', fontSize: 15, height: '100%' },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EF444411', borderRadius: 8, padding: 10,
  },
  errorText: { color: '#EF4444', fontSize: 13 },
  submitButton: {
    backgroundColor: '#6152FF', borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: '#6152FF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  resendButton: { alignItems: 'center', marginTop: 16 },
  resendText: { color: '#6152FF', fontSize: 13, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  loginText: { color: '#8E8E93', fontSize: 14 },
  loginLink: { color: '#6152FF', fontSize: 14, fontWeight: '600' },
});