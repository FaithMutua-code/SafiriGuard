import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { RoleBadge, StatusBadge, UserRole } from "@/components/ui/badges";

// ---- Palette (matches Fleet Monitor / Findora light theme) ----
const COLORS = {
  primary: '#4B3F8F',
  primaryDeep: '#382F70',
  primaryLight: '#6C5DD3',
  accent: '#FF8A65',
  accentDeep: '#FF7043',
  accentSoft: '#FFE8DE',
  bg: '#F8F6FB',
  card: '#FFFFFF',
  cardBorder: '#EDE9F7',
  textPrimary: '#2B2440',
  textSecondary: '#8B84A3',
  textOnDark: 'rgba(255,255,255,0.92)',
  textOnDarkMuted: 'rgba(255,255,255,0.62)',

  emerald: '#2ECC8F',
  emeraldSoft: '#E1F9EF',
  electric: '#3E8FFF',
  electricSoft: '#E5EFFF',
  amber: '#F5A623',
  amberSoft: '#FFF3DE',
  danger: '#FF6B6B',
  dangerSoft: '#FFE7E7',

  track: '#ECE8F7',
};
// -----------------------------------------------------------------

// ---- Placeholder data (replace with real API / store data) ----
type Vehicle = {
  id: string;
  regNumber: string;
  driverName: string;
  status: 'active' | 'idle' | 'offline';
  passengers: number;
  maxCapacity: number;
};

type Alert = {
  id: string;
  vehicleReg: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  resolved: boolean;
};

type AIInsight = {
  id: string;
  title: string;
  description: string;
  suggestedAction: string;
};

type AppUser = {
  name: string;
  role: UserRole;
};

const MOCK_USER: AppUser = {
  name: "User",
  role: "admin",
};

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "1",
    regNumber: "KXX 000X",
    driverName: "Driver One",
    status: "active",
    passengers: 0,
    maxCapacity: 1,
  },
  {
    id: "2",
    regNumber: "KXX 001X",
    driverName: "Driver Two",
    status: "idle",
    passengers: 0,
    maxCapacity: 1,
  },
];

const MOCK_ALERTS: Alert[] = [];

const MOCK_AI_INSIGHTS: AIInsight[] = [];

function getDashboardStats() {
  return {
    activeVehicles: MOCK_VEHICLES.filter(v => v.status === 'active').length,
    ongoingTrips: 0,
    totalPassengers: MOCK_VEHICLES.reduce((s, v) => s + v.passengers, 0),
    avgSafetyScore: 0,
    activeAlerts: MOCK_ALERTS.filter(a => !a.resolved).length,
    tripsToday: 0,
  };
}
// -----------------------------------------------------------------

const QUICK_ACTIONS = [
  { id: 'fleet', label: 'Fleet', icon: 'car.2.fill', color: COLORS.primary, soft: '#EDEAFB', route: '/(tabs)/fleet' },
  { id: 'gps', label: 'GPS Track', icon: 'map.fill', color: COLORS.emerald, soft: COLORS.emeraldSoft, route: '/gps' },
  { id: 'insights', label: 'AI Insights', icon: 'sparkles', color: COLORS.amber, soft: COLORS.amberSoft, route: '/insights' },
  { id: 'alerts', label: 'Alerts', icon: 'bell.badge.fill', color: COLORS.danger, soft: COLORS.dangerSoft, route: '/alerts' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const user = MOCK_USER;
  const stats = getDashboardStats();
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [headerAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const unresolvedAlerts = MOCK_ALERTS.filter(a => !a.resolved);
  const topInsight = MOCK_AI_INSIGHTS[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: COLORS.bg }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Header */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <Animated.View style={[styles.heroTopRow, { opacity: headerAnim }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
                {user && <RoleBadge role={user.role} size="sm" />}
              </View>
              <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/alerts' as any)}>
                <IconSymbol name="bell.fill" size={19} color="#FFFFFF" />
                {unresolvedAlerts.length > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unresolvedAlerts.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* KPI grid — squircle glass tiles inside hero */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiTile, { borderLeftColor: COLORS.emerald }]}>
                <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(46,204,143,0.22)' }]}>
                  <IconSymbol name="car.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.kpiValue}>{stats.activeVehicles}</Text>
                <Text style={styles.kpiLabel}>Active Vehicles</Text>
              </View>

              <View style={[styles.kpiTile, { borderLeftColor: COLORS.accent }]}>
                <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(255,138,101,0.22)' }]}>
                  <IconSymbol name="speedometer" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.kpiValue}>{stats.ongoingTrips}</Text>
                <Text style={styles.kpiLabel}>Active Trips</Text>
              </View>

              <View style={[styles.kpiTile, { borderLeftColor: COLORS.electric }]}>
                <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(62,143,255,0.22)' }]}>
                  <IconSymbol name="person.3.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.kpiValue}>{stats.totalPassengers}</Text>
                <Text style={styles.kpiLabel}>Passengers</Text>
              </View>

              <View style={[styles.kpiTile, { borderLeftColor: COLORS.amber }]}>
                <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(245,166,35,0.22)' }]}>
                  <IconSymbol name="shield.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.kpiValue}>{stats.avgSafetyScore}</Text>
                <Text style={styles.kpiLabel}>Safety Score</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {/* Secondary stats row — alerts + trips today */}
            <View style={styles.secondaryStatsRow}>
              <View style={[styles.secondaryCard, stats.activeAlerts > 0 && styles.secondaryCardAlert]}>
                <View style={[styles.secondaryIconWrap, { backgroundColor: COLORS.dangerSoft }]}>
                  <IconSymbol name="bell.badge.fill" size={16} color={COLORS.danger} />
                </View>
                <Text style={styles.secondaryValue}>{stats.activeAlerts}</Text>
                <Text style={styles.secondaryLabel}>Active Alerts</Text>
              </View>
              <View style={styles.secondaryCard}>
                <View style={[styles.secondaryIconWrap, { backgroundColor: COLORS.emeraldSoft }]}>
                  <IconSymbol name="chart.line.uptrend.xyaxis" size={16} color={COLORS.emerald} />
                </View>
                <Text style={styles.secondaryValue}>{stats.tripsToday}</Text>
                <Text style={styles.secondaryLabel}>Trips Today</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {QUICK_ACTIONS.map(action => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => router.push(action.route as any)}
                    activeOpacity={0.8}
                    style={styles.quickActionItem}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: action.soft }]}>
                      <IconSymbol name={action.icon as any} size={22} color={action.color} />
                    </View>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* AI Insight Banner */}
            {topInsight && (
              <TouchableOpacity onPress={() => router.push('/insights' as any)} activeOpacity={0.9}>
                <LinearGradient
                  colors={[COLORS.amberSoft, '#FFFFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.insightCard}
                >
                  <View style={styles.insightHeader}>
                    <View style={styles.insightIconContainer}>
                      <IconSymbol name="sparkles" size={17} color={COLORS.amber} />
                    </View>
                    <Text style={styles.insightBadge}>AI Insight</Text>
                    <View style={styles.impactBadge}>
                      <Text style={styles.impactText}>High Impact</Text>
                    </View>
                  </View>
                  <Text style={styles.insightTitle}>{topInsight.title}</Text>
                  <Text style={styles.insightDesc} numberOfLines={2}>{topInsight.description}</Text>
                  <View style={styles.insightFooter}>
                    <Text style={styles.insightAction} numberOfLines={1}>{topInsight.suggestedAction}</Text>
                    <IconSymbol name="chevron.right" size={14} color={COLORS.amber} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Live Fleet Preview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Live Fleet</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/fleet' as any)}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {MOCK_VEHICLES.slice(0, 3).map(vehicle => (
                <TouchableOpacity
                  key={vehicle.id}
                  onPress={() => router.push(`/vehicle/${vehicle.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={styles.vehicleCard}>
                    <View style={styles.vehicleIconWrap}>
                      <IconSymbol name="car.fill" size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleReg}>{vehicle.regNumber}</Text>
                      <Text style={styles.vehicleDriver}>{vehicle.driverName}</Text>
                    </View>
                    <View style={styles.vehicleStats}>
                      <Text style={styles.vehiclePax}>
                        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{vehicle.passengers}</Text>/{vehicle.maxCapacity} pax
                      </Text>
                      <StatusBadge status={vehicle.status} size="sm" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Alerts */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Alerts</Text>
                <TouchableOpacity onPress={() => router.push('/alerts' as any)}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {unresolvedAlerts.length === 0 ? (
                <View style={styles.emptyAlerts}>
                  <View style={styles.emptyAlertsIcon}>
                    <IconSymbol name="checkmark.shield.fill" size={20} color={COLORS.emerald} />
                  </View>
                  <Text style={styles.emptyAlertsText}>All clear — no active alerts</Text>
                </View>
              ) : (
                unresolvedAlerts.slice(0, 2).map(alert => {
                  const alertColors = { critical: COLORS.danger, warning: COLORS.amber, info: COLORS.electric };
                  const color = alertColors[alert.severity];
                  return (
                    <View key={alert.id} style={styles.alertCard}>
                      <View style={[styles.alertAccent, { backgroundColor: color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertVehicle}>{alert.vehicleReg}</Text>
                        <Text style={styles.alertDesc} numberOfLines={1}>{alert.description}</Text>
                      </View>
                      <Text style={styles.alertTime}>{alert.timestamp}</Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  scrollContent: { paddingBottom: 100 },

  // --- Hero header ---
  hero: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDeep,
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
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { fontSize: 13, color: COLORS.textOnDarkMuted, marginBottom: 2 },
  userName: { fontSize: 23, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  notifButton: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 6,
    backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2, borderColor: COLORS.primary,
  },
  notifBadgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },

  // --- KPI grid inside hero ---
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiTile: {
    width: '47.5%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderLeftWidth: 3,
    borderRadius: 16,
    padding: 12,
  },
  kpiIconWrap: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  kpiLabel: { fontSize: 10.5, color: COLORS.textOnDarkMuted, marginTop: 2, fontWeight: '500' },

  // --- Body ---
  body: { paddingHorizontal: 20, paddingTop: 18 },

  secondaryStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  secondaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 18,
    padding: 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  secondaryCardAlert: {
    borderColor: '#FFD3D3',
  },
  secondaryIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  secondaryValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  secondaryLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },

  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionItem: { alignItems: 'center', gap: 8, flex: 1 },
  quickActionIcon: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' },

  // --- AI Insight card ---
  insightCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE4B8',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  insightIconContainer: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.amberSoft, alignItems: 'center', justifyContent: 'center',
  },
  insightBadge: { fontSize: 11, color: COLORS.amber, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  impactBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, backgroundColor: COLORS.dangerSoft },
  impactText: { fontSize: 10, fontWeight: '700', color: COLORS.danger },
  insightTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  insightDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 12 },
  insightFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  insightAction: { fontSize: 12, color: COLORS.amber, fontWeight: '600', flex: 1 },

  // --- Vehicle preview cards ---
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  vehicleIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#EDEAFB', alignItems: 'center', justifyContent: 'center',
  },
  vehicleInfo: { flex: 1 },
  vehicleReg: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5, fontFamily: 'monospace' },
  vehicleDriver: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  vehicleStats: { alignItems: 'flex-end', gap: 5 },
  vehiclePax: { fontSize: 12, color: COLORS.textSecondary },

  // --- Alerts ---
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  alertAccent: { width: 4, height: 32, borderRadius: 2 },
  alertVehicle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  alertDesc: { fontSize: 11, color: COLORS.textSecondary },
  alertTime: { fontSize: 10, color: COLORS.textSecondary },
  emptyAlerts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.emeraldSoft,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C9F2E1',
  },
  emptyAlertsIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  emptyAlertsText: { fontSize: 13, color: '#1A8A62', fontWeight: '600' },
});