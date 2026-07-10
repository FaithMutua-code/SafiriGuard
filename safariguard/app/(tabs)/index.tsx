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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { RoleBadge, StatusBadge, UserRole } from "@/components/ui/badges";
import { useTheme, ThemeColors } from "@/context/ThemeContext";

// ---- Placeholder data (replace with real API / store data) ----
type Vehicle = {
  id: string; regNumber: string; driverName: string;
  status: 'active' | 'idle' | 'offline'; passengers: number; maxCapacity: number;
};
type Alert = {
  id: string; vehicleReg: string; description: string;
  severity: 'critical' | 'warning' | 'info'; timestamp: string; resolved: boolean;
};
type AIInsight = { id: string; title: string; description: string; suggestedAction: string };
type AppUser = { name: string; role: UserRole };

const MOCK_USER: AppUser = { name: "User", role: "admin" };

const MOCK_VEHICLES: Vehicle[] = [
  { id: "1", regNumber: "KXX 000X", driverName: "Driver One", status: "active", passengers: 0, maxCapacity: 1 },
  { id: "2", regNumber: "KXX 001X", driverName: "Driver Two", status: "idle", passengers: 0, maxCapacity: 1 },
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const user = MOCK_USER;
  const stats = getDashboardStats();
  const [refreshing, setRefreshing] = useState(false);

  const QUICK_ACTIONS = [
    { id: 'fleet', label: 'Fleet', icon: 'car.2.fill', color: theme.primary, soft: theme.mode === 'dark' ? theme.primary + '22' : '#EDEAFB', route: '/(tabs)/fleet' },
    { id: 'gps', label: 'GPS Track', icon: 'map.fill', color: theme.emerald, soft: theme.emeraldSoft, route: '/gps' },
    { id: 'insights', label: 'AI Insights', icon: 'sparkles', color: theme.amber, soft: theme.amberSoft, route: '/insights' },
    { id: 'alerts', label: 'Alerts', icon: 'bell.badge.fill', color: theme.danger, soft: theme.dangerSoft, route: '/alerts' },
  ];

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
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          contentContainerStyle={s.scrollContent}
        >
          {/* Hero Header */}
          <LinearGradient
            colors={[theme.primary, theme.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroGlowOne} />
            <View style={s.heroGlowTwo} />

            <Animated.View style={[s.heroTopRow, { opacity: headerAnim }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.greeting}>{getGreeting()},</Text>
                <Text style={s.userName}>{user?.name ?? 'User'}</Text>
                {user && <RoleBadge role={user.role} size="sm" />}
              </View>
              <TouchableOpacity style={s.notifButton} onPress={() => router.push('/alerts' as any)}>
                <IconSymbol name="bell.fill" size={19} color="#FFFFFF" />
                {unresolvedAlerts.length > 0 && (
                  <View style={s.notifBadge}>
                    <Text style={s.notifBadgeText}>{unresolvedAlerts.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={s.kpiGrid}>
              <View style={[s.kpiTile, { borderLeftColor: theme.emerald }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(46,204,143,0.22)' }]}>
                  <IconSymbol name="car.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>{stats.activeVehicles}</Text>
                <Text style={s.kpiLabel}>Active Vehicles</Text>
              </View>

              <View style={[s.kpiTile, { borderLeftColor: theme.accent }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(255,138,101,0.22)' }]}>
                  <IconSymbol name="speedometer" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>{stats.ongoingTrips}</Text>
                <Text style={s.kpiLabel}>Active Trips</Text>
              </View>

              <View style={[s.kpiTile, { borderLeftColor: theme.electric }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(62,143,255,0.22)' }]}>
                  <IconSymbol name="person.3.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>{stats.totalPassengers}</Text>
                <Text style={s.kpiLabel}>Passengers</Text>
              </View>

              <View style={[s.kpiTile, { borderLeftColor: theme.amber }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(245,166,35,0.22)' }]}>
                  <IconSymbol name="shield.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>{stats.avgSafetyScore}</Text>
                <Text style={s.kpiLabel}>Safety Score</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={s.body}>
            {/* Secondary stats row */}
            <View style={s.secondaryStatsRow}>
              <View style={[s.secondaryCard, stats.activeAlerts > 0 && s.secondaryCardAlert]}>
                <View style={[s.secondaryIconWrap, { backgroundColor: theme.dangerSoft }]}>
                  <IconSymbol name="bell.badge.fill" size={16} color={theme.danger} />
                </View>
                <Text style={s.secondaryValue}>{stats.activeAlerts}</Text>
                <Text style={s.secondaryLabel}>Active Alerts</Text>
              </View>
              <View style={s.secondaryCard}>
                <View style={[s.secondaryIconWrap, { backgroundColor: theme.emeraldSoft }]}>
                  <IconSymbol name="chart.line.uptrend.xyaxis" size={16} color={theme.emerald} />
                </View>
                <Text style={s.secondaryValue}>{stats.tripsToday}</Text>
                <Text style={s.secondaryLabel}>Trips Today</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Quick Actions</Text>
              <View style={s.quickActionsGrid}>
                {QUICK_ACTIONS.map(action => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => router.push(action.route as any)}
                    activeOpacity={0.8}
                    style={s.quickActionItem}
                  >
                    <View style={[s.quickActionIcon, { backgroundColor: action.soft }]}>
                      <IconSymbol name={action.icon as any} size={22} color={action.color} />
                    </View>
                    <Text style={s.quickActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* AI Insight Banner */}
            {topInsight && (
              <TouchableOpacity onPress={() => router.push('/insights' as any)} activeOpacity={0.9}>
                <LinearGradient
                  colors={[theme.amberSoft, theme.card]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.insightCard}
                >
                  <View style={s.insightHeader}>
                    <View style={s.insightIconContainer}>
                      <IconSymbol name="sparkles" size={17} color={theme.amber} />
                    </View>
                    <Text style={s.insightBadge}>AI Insight</Text>
                    <View style={s.impactBadge}>
                      <Text style={s.impactText}>High Impact</Text>
                    </View>
                  </View>
                  <Text style={s.insightTitle}>{topInsight.title}</Text>
                  <Text style={s.insightDesc} numberOfLines={2}>{topInsight.description}</Text>
                  <View style={s.insightFooter}>
                    <Text style={s.insightAction} numberOfLines={1}>{topInsight.suggestedAction}</Text>
                    <IconSymbol name="chevron.right" size={14} color={theme.amber} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Live Fleet Preview */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Live Fleet</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/fleet' as any)}>
                  <Text style={s.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {MOCK_VEHICLES.slice(0, 3).map(vehicle => (
                <TouchableOpacity
                  key={vehicle.id}
                  onPress={() => router.push(`/vehicle/${vehicle.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={s.vehicleCard}>
                    <View style={s.vehicleIconWrap}>
                      <IconSymbol name="car.fill" size={16} color={theme.primary} />
                    </View>
                    <View style={s.vehicleInfo}>
                      <Text style={s.vehicleReg}>{vehicle.regNumber}</Text>
                      <Text style={s.vehicleDriver}>{vehicle.driverName}</Text>
                    </View>
                    <View style={s.vehicleStats}>
                      <Text style={s.vehiclePax}>
                        <Text style={{ color: theme.primary, fontWeight: '700' }}>{vehicle.passengers}</Text>/{vehicle.maxCapacity} pax
                      </Text>
                      <StatusBadge status={vehicle.status} size="sm" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Alerts */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Recent Alerts</Text>
                <TouchableOpacity onPress={() => router.push('/alerts' as any)}>
                  <Text style={s.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {unresolvedAlerts.length === 0 ? (
                <View style={s.emptyAlerts}>
                  <View style={s.emptyAlertsIcon}>
                    <IconSymbol name="checkmark.shield.fill" size={20} color={theme.emerald} />
                  </View>
                  <Text style={s.emptyAlertsText}>All clear — no active alerts</Text>
                </View>
              ) : (
                unresolvedAlerts.slice(0, 2).map(alert => {
                  const alertColors = { critical: theme.danger, warning: theme.amber, info: theme.electric };
                  const color = alertColors[alert.severity];
                  return (
                    <View key={alert.id} style={s.alertCard}>
                      <View style={[s.alertAccent, { backgroundColor: color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.alertVehicle}>{alert.vehicleReg}</Text>
                        <Text style={s.alertDesc} numberOfLines={1}>{alert.description}</Text>
                      </View>
                      <Text style={s.alertTime}>{alert.timestamp}</Text>
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

const makeStyles = (theme: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.primary },
  scrollContent: { paddingBottom: 100 },

  hero: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden',
    shadowColor: theme.primaryDeep, shadowOpacity: 0.35, shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 }, elevation: 8,
  },
  heroGlowOne: {
    position: 'absolute', top: -70, right: -50, width: 200, height: 200,
    borderRadius: 40, backgroundColor: 'rgba(255,138,101,0.16)', transform: [{ rotate: '20deg' }],
  },
  heroGlowTwo: {
    position: 'absolute', bottom: -60, left: -40, width: 150, height: 150,
    borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ rotate: '-15deg' }],
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: theme.textOnDarkMuted, marginBottom: 2 },
  userName: { fontSize: 23, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  notifButton: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 6,
    backgroundColor: theme.danger, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 2, borderColor: theme.primary,
  },
  notifBadgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiTile: {
    width: '47.5%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderLeftWidth: 3,
    borderRadius: 16, padding: 12,
  },
  kpiIconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  kpiLabel: { fontSize: 10.5, color: theme.textOnDarkMuted, marginTop: 2, fontWeight: '500' },

  body: { paddingHorizontal: 20, paddingTop: 18 },

  secondaryStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  secondaryCard: {
    flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 18, padding: 14,
    shadowColor: theme.primary, shadowOpacity: theme.mode === 'dark' ? 0 : 0.05,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1,
  },
  secondaryCardAlert: { borderColor: theme.mode === 'dark' ? theme.danger + '55' : '#FFD3D3' },
  secondaryIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  secondaryValue: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  secondaryLabel: { fontSize: 11, color: theme.textSecondary, marginTop: 2, fontWeight: '500' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 14 },
  seeAll: { fontSize: 13, color: theme.primary, fontWeight: '700' },

  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionItem: { alignItems: 'center', gap: 8, flex: 1 },
  quickActionIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 11, color: theme.textSecondary, fontWeight: '600', textAlign: 'center' },

  insightCard: {
    borderRadius: 22, padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: theme.mode === 'dark' ? theme.amber + '33' : '#FFE4B8',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  insightIconContainer: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: theme.amberSoft, alignItems: 'center', justifyContent: 'center',
  },
  insightBadge: { fontSize: 11, color: theme.amber, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  impactBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, backgroundColor: theme.dangerSoft },
  impactText: { fontSize: 10, fontWeight: '700', color: theme.danger },
  insightTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary, marginBottom: 6 },
  insightDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 19, marginBottom: 12 },
  insightFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  insightAction: { fontSize: 12, color: theme.amber, fontWeight: '600', flex: 1 },

  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 18, padding: 14, marginBottom: 10,
    shadowColor: theme.primary, shadowOpacity: theme.mode === 'dark' ? 0 : 0.04,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1,
  },
  vehicleIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: theme.mode === 'dark' ? theme.primary + '22' : '#EDEAFB',
    alignItems: 'center', justifyContent: 'center',
  },
  vehicleInfo: { flex: 1 },
  vehicleReg: { fontSize: 14, fontWeight: '800', color: theme.textPrimary, letterSpacing: 0.5, fontFamily: 'monospace' },
  vehicleDriver: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
  vehicleStats: { alignItems: 'flex-end', gap: 5 },
  vehiclePax: { fontSize: 12, color: theme.textSecondary },

  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  alertAccent: { width: 4, height: 32, borderRadius: 2 },
  alertVehicle: { fontSize: 13, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  alertDesc: { fontSize: 11, color: theme.textSecondary },
  alertTime: { fontSize: 10, color: theme.textSecondary },
  emptyAlerts: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.emeraldSoft, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: theme.mode === 'dark' ? theme.emerald + '33' : '#C9F2E1',
  },
  emptyAlertsIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center',
  },
  emptyAlertsText: { fontSize: 13, color: theme.mode === 'dark' ? theme.emerald : '#1A8A62', fontWeight: '600' },
});