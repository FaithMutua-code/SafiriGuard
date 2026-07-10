import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GlassCard } from "@/components/ui/glass-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { RoleBadge } from "@/components/ui/badges";

// ---- Placeholder data (replace with real API / auth / store data) ----
type Vehicle = {
  id: string;
  regNumber: string;
  route: string;
  status: 'active' | 'idle' | 'offline';
  totalTripsToday: number;
};

type Driver = {
  id: string;
  name: string;
  status: 'on_duty' | 'off_duty';
};

type AppUser = {
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'owner' | 'driver';
};

const MOCK_USER: AppUser = {
  name: "User",
  email: "",
  phone: "+254 700 000 000",
  role: "manager",
};

const MOCK_VEHICLES: Vehicle[] = [
  { id: "1", regNumber: "KXX 000X", route: "Route A", status: "active", totalTripsToday: 0 },
  { id: "2", regNumber: "KXX 001X", route: "Route B", status: "idle", totalTripsToday: 0 },
];

const MOCK_DRIVERS: Driver[] = [
  { id: "1", name: "Driver One", status: "on_duty" },
  { id: "2", name: "Driver Two", status: "off_duty" },
];

function useAppAuth() {
  return {
    user: MOCK_USER,
    logout: () => {
      // TODO: wire up real logout logic
    },
  };
}
// -----------------------------------------------------------------

interface SettingRowProps {
  icon: any;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
}

function SettingRow({ icon, iconColor, label, value, onPress, toggle, toggleValue, onToggle, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.settingRow}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '22' }]}>
        <IconSymbol name={icon} size={16} color={danger ? '#EF4444' : iconColor} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: '#EF4444' }]}>{label}</Text>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#E2E8F0', true: '#6152FF44' }}
          thumbColor={toggleValue ? '#6152FF' : '#FFFFFF'}
        />
      ) : value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : onPress ? (
        <IconSymbol name="chevron.right" size={16} color="#64748B" />
      ) : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAppAuth();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of SafariGuard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const assignedVehicles = user?.role === 'manager'
    ? MOCK_VEHICLES
    : user?.role === 'owner'
    ? MOCK_VEHICLES.slice(0, 3)
    : MOCK_VEHICLES.slice(0, 1);

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <GlassCard className="p-5 mb-4" glow glowColor="#6152FF">
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
              <View style={{ marginTop: 8 }}>
                {user && <RoleBadge role={user.role} />}
              </View>
            </View>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{assignedVehicles.length}</Text>
              <Text style={styles.profileStatLabel}>Vehicles</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {MOCK_DRIVERS.filter(d => d.status === 'on_duty').length}
              </Text>
              <Text style={styles.profileStatLabel}>Active Drivers</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {MOCK_VEHICLES.reduce((s, v) => s + v.totalTripsToday, 0)}
              </Text>
              <Text style={styles.profileStatLabel}>Trips Today</Text>
            </View>
          </View>
        </GlassCard>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <GlassCard className="mb-4 overflow-hidden">
          <SettingRow
            icon="person.fill"
            iconColor="#6152FF"
            label="Personal Information"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="phone.fill"
            iconColor="#10B981"
            label="Phone Number"
            value={user?.phone ?? '+254 700 000 000'}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock.fill"
            iconColor="#F59E0B"
            label="Change Password"
            onPress={() => {}}
          />
        </GlassCard>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <GlassCard className="mb-4 overflow-hidden">
          <SettingRow
            icon="bell.fill"
            iconColor="#6152FF"
            label="Push Notifications"
            toggle
            toggleValue={pushNotifs}
            onToggle={setPushNotifs}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="bolt.fill"
            iconColor="#EF4444"
            label="Critical Alerts"
            toggle
            toggleValue={true}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chart.bar.fill"
            iconColor="#10B981"
            label="Daily Reports"
            toggle
            toggleValue={false}
          />
        </GlassCard>

        {/* Security */}
        <Text style={styles.sectionTitle}>Security</Text>
        <GlassCard className="mb-4 overflow-hidden">
          <SettingRow
            icon="lock.fill"
            iconColor="#A855F7"
            label="Biometric Authentication"
            toggle
            toggleValue={biometrics}
            onToggle={setBiometrics}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="location.fill"
            iconColor="#6152FF"
            label="Location Tracking"
            toggle
            toggleValue={locationTracking}
            onToggle={setLocationTracking}
          />
        </GlassCard>

        {/* Assigned Vehicles */}
        <Text style={styles.sectionTitle}>Assigned Vehicles</Text>
        <GlassCard className="p-4 mb-4">
          {assignedVehicles.map((v, i) => (
            <View key={v.id}>
              <TouchableOpacity
                onPress={() => router.push(`/vehicle/${v.id}` as any)}
                style={styles.vehicleRow}
                activeOpacity={0.8}
              >
                <View style={styles.vehicleIcon}>
                  <IconSymbol name="car.fill" size={16} color="#6152FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleReg}>{v.regNumber}</Text>
                  <Text style={styles.vehicleRoute}>{v.route}</Text>
                </View>
                <View style={[styles.vehicleStatusDot, {
                  backgroundColor: v.status === 'active' ? '#10B981' : v.status === 'idle' ? '#F59E0B' : '#EF4444',
                }]} />
              </TouchableOpacity>
              {i < assignedVehicles.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </GlassCard>

        {/* App Info */}
        <Text style={styles.sectionTitle}>App</Text>
        <GlassCard className="mb-4 overflow-hidden">
          <SettingRow
            icon="info.circle.fill"
            iconColor="#64748B"
            label="App Version"
            value="1.0.0"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="doc.text.fill"
            iconColor="#64748B"
            label="Terms of Service"
            onPress={() => {}}
          />
        </GlassCard>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={styles.logoutButton}>
          <IconSymbol name="arrow.right.square.fill" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>SafariGuard v1.0.0 · Made in Kenya 🇰🇪</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  profileHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  avatarContainer: { position: 'relative' },
  avatarText: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#6152FF22', borderWidth: 2, borderColor: '#6152FF44',
    textAlign: 'center', lineHeight: 64, fontSize: 26, fontWeight: '700', color: '#6152FF',
    overflow: 'hidden',
  },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF',
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  userEmail: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  profileStats: { flexDirection: 'row', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  profileStatLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  profileStatDivider: { width: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500' },
  settingValue: { fontSize: 13, color: '#8E8E93' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginLeft: 62 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  vehicleIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#6152FF22', alignItems: 'center', justifyContent: 'center',
  },
  vehicleReg: { fontSize: 14, fontWeight: '600', color: '#1E293B', fontFamily: 'monospace' },
  vehicleRoute: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  vehicleStatusDot: { width: 8, height: 8, borderRadius: 4 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#EF444411', borderRadius: 14, height: 52,
    borderWidth: 1, borderColor: '#EF444433', marginBottom: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  footer: { textAlign: 'center', fontSize: 12, color: '#8E8E93', marginBottom: 8 },
});