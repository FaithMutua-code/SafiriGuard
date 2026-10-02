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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  registerPushNotificationsAsync,
  unregisterPushNotificationsAsync,
} from "@/lib/pushNotifications";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { RoleBadge } from "@/components/ui/badges";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useAppAuth } from "@/context/AuthContext";
import { useOwnerVehicles, useOwnerProfile } from "@/hooks/useOwnerData";

interface SettingRowProps {
  icon: any;
  iconColor: string;
  iconSoft: string;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
  theme: ThemeColors;
}

function SettingRow({
  icon,
  iconColor,
  iconSoft,
  label,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
  theme,
}: SettingRowProps) {
  const s = makeStyles(theme);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={s.settingRow}
    >
      <View style={[s.settingIcon, { backgroundColor: iconSoft }]}>
        <IconSymbol name={icon} size={16} color={danger ? theme.danger : iconColor} />
      </View>
      <Text style={[s.settingLabel, danger && { color: theme.danger }]}>{label}</Text>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: theme.track, true: theme.primaryLight + '88' }}
          thumbColor={toggleValue ? theme.primary : '#FFFFFF'}
        />
      ) : value ? (
        <Text style={s.settingValue}>{value}</Text>
      ) : onPress ? (
        <IconSymbol name="chevron.right" size={16} color={theme.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAppAuth();
  const { data: profileUser } = useOwnerProfile();
  const activeUser = profileUser || user;
  const { theme, isDark, toggleTheme } = useTheme();
  const s = makeStyles(theme);

  const { data: vehicles = [] } = useOwnerVehicles();

  const [pushNotifs, setPushNotifs] = useState(true);

  const handleTogglePush = async (enabled: boolean) => {
    setPushNotifs(enabled);
    if (enabled) {
      await registerPushNotificationsAsync();
    } else {
      await unregisterPushNotificationsAsync();
    }
  };

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

  // KPIs computed from real owner data
  const devicesOnlineCount = vehicles.filter(v => v.device_connected).length;
  const tripsTodayCount = vehicles.reduce((sum, v) => sum + (v.today?.trips ?? 0), 0);

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          {/* Profile Hero */}
          <LinearGradient
            colors={[theme.primary, theme.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroGlowOne} />
            <View style={s.heroGlowTwo} />

            <View style={s.profileHeader}>
              <View style={s.avatarWrap}>
                <Text style={s.avatarText}>{activeUser?.name?.charAt(0) ?? 'U'}</Text>
                <View style={s.onlineDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{activeUser?.name ?? 'User'}</Text>
                <Text style={s.userEmail}>{activeUser?.email || activeUser?.phone}</Text>
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {activeUser && <RoleBadge role={activeUser.role} />}
                  <TouchableOpacity
                    style={s.editProfileBadge}
                    activeOpacity={0.8}
                    onPress={() => router.push('/profile/edit' as any)}
                  >
                    <IconSymbol name="pencil" size={11} color="#FFFFFF" />
                    <Text style={s.editProfileBadgeText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Real KPIs — vehicles, devices online, trips today */}
            <View style={s.kpiGrid}>
              <View style={[s.kpiTile, { borderLeftColor: theme.emerald }]}>
                <Text style={s.kpiValue}>{vehicles.length}</Text>
                <Text style={s.kpiLabel}>Vehicles</Text>
              </View>
              <View style={[s.kpiTile, { borderLeftColor: theme.electric }]}>
                <Text style={s.kpiValue}>{devicesOnlineCount}</Text>
                <Text style={s.kpiLabel}>Devices Online</Text>
              </View>
              <View style={[s.kpiTile, { borderLeftColor: theme.amber }]}>
                <Text style={s.kpiValue}>{tripsTodayCount}</Text>
                <Text style={s.kpiLabel}>Trips Today</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={s.body}>
            {/* Appearance / Theme Toggle */}
            <Text style={s.sectionTitle}>Appearance</Text>
            <View style={s.card}>
              <View style={s.themeRow}>
                <View style={[s.settingIcon, { backgroundColor: isDark ? theme.electricSoft : theme.amberSoft }]}>
                  <IconSymbol
                    name={isDark ? 'moon.fill' : 'sun.max.fill'}
                    size={16}
                    color={isDark ? theme.electric : theme.amber}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.settingLabel}>Dark Mode</Text>
                  <Text style={s.settingSubLabel}>
                    {isDark ? 'Midnight theme active' : 'Light theme active'}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.track, true: theme.primaryLight + '88' }}
                  thumbColor={isDark ? theme.primary : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Account Settings */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Account</Text>
              <TouchableOpacity onPress={() => router.push('/profile/edit' as any)}>
                <Text style={s.editProfileLink}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
            <View style={s.card}>
              <SettingRow
                icon="person.fill"
                iconColor={theme.primary}
                iconSoft={theme.primarySoft}
                label="Owner Name"
                value={activeUser?.name ?? '—'}
                onPress={() => router.push('/profile/edit' as any)}
                theme={theme}
              />
              <View style={s.divider} />
              <SettingRow
                icon="phone.fill"
                iconColor={theme.emerald}
                iconSoft={theme.emeraldSoft}
                label="Phone Number"
                value={activeUser?.phone ?? 'Not set'}
                onPress={() => router.push('/profile/edit' as any)}
                theme={theme}
              />
              <View style={s.divider} />
              <SettingRow
                icon="creditcard.fill"
                iconColor={theme.electric}
                iconSoft={theme.electricSoft}
                label="National ID"
                value={activeUser?.vehicle_owner?.id_number ?? 'Not set'}
                onPress={() => router.push('/profile/edit' as any)}
                theme={theme}
              />
              <View style={s.divider} />
              <SettingRow
                icon="envelope.fill"
                iconColor={theme.amber}
                iconSoft={theme.amberSoft}
                label="Email Address"
                value={activeUser?.email ?? '—'}
                onPress={() => router.push('/profile/edit' as any)}
                theme={theme}
              />
            </View>

            {/* Notifications */}
            <Text style={s.sectionTitle}>Notifications</Text>
            <View style={s.card}>
              <SettingRow
                icon="bell.fill"
                iconColor={theme.primary}
                iconSoft={theme.primarySoft}
                label="Push Notifications"
                toggle
                toggleValue={pushNotifs}
                onToggle={handleTogglePush}
                theme={theme}
              />
            </View>

            {/* My Vehicles */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>My Vehicles</Text>
              <TouchableOpacity onPress={() => router.push('/onboarding/add-vehicle' as any)}>
                <Text style={s.addVehicleLink}>+ Add Vehicle</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.card, { padding: 14 }]}>
              {vehicles.length === 0 ? (
                <Text style={s.emptyVehiclesText}>No vehicles registered yet.</Text>
              ) : (
                vehicles.map((v, i) => {
                  const statusColor =
                    v.status === 'active'
                      ? theme.emerald
                      : v.status === 'idle'
                      ? theme.amber
                      : theme.danger;

                  return (
                    <View key={v.id}>
                      <TouchableOpacity
                        onPress={() => router.push(`/vehicle/${v.id}` as any)}
                        style={s.vehicleRow}
                        activeOpacity={0.8}
                      >
                        <View style={s.vehicleIcon}>
                          <IconSymbol name="car.fill" size={16} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.vehicleReg}>{v.number_plate}</Text>
                          <Text style={s.vehicleRoute}>{v.route_name ?? `${v.make ?? ''} ${v.model ?? ''}`.trim() ?? 'Route unassigned'}</Text>
                        </View>
                        <View style={[s.statusPill, { backgroundColor: statusColor + '1F' }]}>
                          <View style={[s.statusDotSquircle, { backgroundColor: statusColor }]} />
                          <Text style={[s.statusPillText, { color: statusColor }]}>
                            {v.status}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {i < vehicles.length - 1 && <View style={s.divider} />}
                    </View>
                  );
                })
              )}
            </View>

            {/* App Info */}
            <Text style={s.sectionTitle}>App</Text>
            <View style={s.card}>
              <SettingRow
                icon="info.circle.fill"
                iconColor={theme.textSecondary}
                iconSoft={theme.track}
                label="App Version"
                value="1.0.0"
                theme={theme}
              />
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={s.logoutButton}>
              <IconSymbol name="arrow.right.square.fill" size={18} color={theme.danger} />
              <Text style={s.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={s.footer}>SafariGuard v1.0.0 · Owner Operations 🇰🇪</Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.primary },
    content: { paddingBottom: 100 },

    hero: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
      shadowColor: theme.primaryDeep,
      shadowOpacity: 0.35,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
    heroGlowOne: {
      position: 'absolute',
      top: -70,
      right: -50,
      width: 200,
      height: 200,
      borderRadius: 40,
      backgroundColor: 'rgba(255,138,101,0.16)',
      transform: [{ rotate: '20deg' }],
    },
    heroGlowTwo: {
      position: 'absolute',
      bottom: -60,
      left: -40,
      width: 150,
      height: 150,
      borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.06)',
      transform: [{ rotate: '-15deg' }],
    },
    profileHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 },
    avatarWrap: { position: 'relative' },
    avatarText: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      textAlign: 'center',
      lineHeight: 64,
      fontSize: 26,
      fontWeight: '800',
      color: '#FFFFFF',
      overflow: 'hidden',
    },
    onlineDot: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: 5,
      backgroundColor: theme.emerald,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    userName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    userEmail: { fontSize: 13, color: theme.textOnDarkMuted, marginTop: 2 },
    editProfileBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    editProfileBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },

    kpiGrid: { flexDirection: 'row', gap: 10 },
    kpiTile: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      borderLeftWidth: 3,
      borderRadius: 16,
      padding: 12,
    },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    kpiLabel: { fontSize: 10.5, color: theme.textOnDarkMuted, marginTop: 3, fontWeight: '500' },

    body: { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: {
      fontSize: 11.5,
      fontWeight: '800',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 4,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addVehicleLink: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.primary,
      marginBottom: 10,
    },
    editProfileLink: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.primary,
      marginBottom: 10,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginBottom: 20,
      overflow: 'hidden',
      shadowColor: theme.primary,
      shadowOpacity: theme.mode === 'dark' ? 0 : 0.04,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },

    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingSubLabel: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },

    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    settingLabel: { flex: 1, fontSize: 14, color: theme.textPrimary, fontWeight: '600' },
    settingValue: { fontSize: 13, color: theme.textSecondary },
    divider: { height: 1, backgroundColor: theme.divider, marginLeft: 62 },

    emptyVehiclesText: {
      textAlign: 'center',
      paddingVertical: 12,
      color: theme.textSecondary,
      fontSize: 13,
    },
    vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    vehicleIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.mode === 'dark' ? theme.track : theme.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    vehicleReg: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, fontFamily: 'monospace' },
    vehicleRoute: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statusDotSquircle: { width: 6, height: 6, borderRadius: 2 },
    statusPillText: { fontSize: 10.5, fontWeight: '700', textTransform: 'capitalize' },

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: theme.dangerSoft,
      borderRadius: 18,
      height: 54,
      borderWidth: 1,
      borderColor: theme.danger + '33',
      marginBottom: 16,
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: theme.danger },
    footer: { textAlign: 'center', fontSize: 12, color: theme.textSecondary, marginBottom: 8 },
  });