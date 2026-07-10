import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";

// ---- Placeholder auth (replace with real backend) ----
export type UserRole = 'manager' | 'owner' | 'driver';

function useAppAuth() {
  return {
    login: async (email: string, password: string, role: UserRole) => {
      // TODO: replace with real login call
      return true;
    },
  };
}
// --------------------------------------------------------

const ROLES: { id: UserRole; label: string; icon: any; description: string }[] = [
  { id: 'manager', label: 'SACCO Manager', icon: 'shield.fill', description: 'Full fleet oversight' },
  { id: 'owner', label: 'Vehicle Owner', icon: 'car.fill', description: 'Manage your vehicles' },
  { id: 'driver', label: 'Driver', icon: 'person.fill', description: 'View your performance' },
];

export default function LoginScreen() {
  const { login } = useAppAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      shake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        router.replace('/(tabs)');
      }
    } catch {
      setError('Login failed. Please try again.');
      shake();
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
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.shieldOuter}>
              <View style={styles.shieldInner}>
                <Text style={styles.shieldIcon}>🛡</Text>
              </View>
            </View>
          </View>
          <Text style={styles.appName}>SafariGuard</Text>
          <Text style={styles.tagline}>Intelligent Fleet Management</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sign in as</Text>
          <View style={styles.roleGrid}>
            {ROLES.map(role => (
              <TouchableOpacity
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.8}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardActive,
                ]}
              >
                <IconSymbol
                  name={role.icon}
                  size={20}
                  color={selectedRole === role.id ? '#6152FF' : '#64748B'}
                />
                <Text style={[styles.roleLabel, selectedRole === role.id && styles.roleLabelActive]}>
                  {role.label}
                </Text>
                <Text style={styles.roleDesc}>{role.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
          {/* Email */}
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
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <IconSymbol name="lock.fill" size={16} color="#64748B" />
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <IconSymbol
                name={showPassword ? "eye.slash.fill" : "eye.fill"}
                size={16}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <IconSymbol name="chevron.right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Demo hint */}
          <Text style={styles.demoHint}>
            Demo: Enter any email & password to continue
          </Text>
        </Animated.View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>New to SafariGuard? </Text>
          <TouchableOpacity onPress={() => router.push('/register' as any)}>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 16,
  },
  shieldOuter: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#6152FF15',
    borderWidth: 1,
    borderColor: '#6152FF33',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6152FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  shieldInner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6152FF22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 28,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleCardActive: {
    borderColor: '#6152FF',
    backgroundColor: '#6152FF11',
    shadowColor: '#6152FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  roleLabelActive: {
    color: '#6152FF',
  },
  roleDesc: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1E293B',
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF444411',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#6152FF',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#6152FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  demoHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#64748B',
    fontSize: 14,
  },
  registerLink: {
    color: '#6152FF',
    fontSize: 14,
    fontWeight: '600',
  },
});