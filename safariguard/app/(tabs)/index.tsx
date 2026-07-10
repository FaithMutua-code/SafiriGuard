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
import { ScreenContainer } from "@/components/screen-container";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { RoleBadge, StatusBadge, UserRole } from "@/components/ui/badges";

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
  { id: 'fleet', label: 'Fleet', icon: 'car.2.fill', color: '#6152FF', route: '/(tabs)/fleet' },
  { id: 'gps', label: 'GPS Track', icon: 'map.fill', color: '#10B981', route: '/gps' },
  { id: 'insights', label: 'AI Insights', icon: 'sparkles', color: '#FF9500', route: '/insights' },
  { id: 'alerts', label: 'Alerts', icon: 'bell.badge.fill', color: '#EF4444', route: '/alerts' },
];

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
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6152FF" />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            {user && <RoleBadge role={user.role} size="sm" />}
          </View>
          <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/alerts' as any)}>
            <IconSymbol name="bell.fill" size={20} color="#1E293B" />
            {unresolvedAlerts.length > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unresolvedAlerts.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Active Vehicles"
              value={stats.activeVehicles}
              icon="car.fill"
              iconColor="#6152FF"
              trend={8}
              glow
              glowColor="#6152FF"
            />
            <StatCard
              label="Active Trips"
              value={stats.ongoingTrips}
              icon="speedometer"
              iconColor="#10B981"
              trend={5}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Passengers"
              value={stats.totalPassengers}
              icon="person.3.fill"
              iconColor="#FF9500"
              subtitle="Currently on board"
            />
            <StatCard
              label="Safety Score"
              value={`${stats.avgSafetyScore}`}
              icon="shield.fill"
              iconColor="#F59E0B"
              trend={-2}
              subtitle="Fleet average"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Active Alerts"
              value={stats.activeAlerts}
              icon="bell.badge.fill"
              iconColor="#EF4444"
              glow={stats.activeAlerts > 0}
              glowColor="#EF4444"
            />
            <StatCard
              label="Trips Today"
              value={stats.tripsToday}
              icon="chart.line.uptrend.xyaxis"
              iconColor="#10B981"
              trend={12}
            />
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
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '22', borderColor: action.color + '44' }]}>
                  <IconSymbol name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Insight Banner */}
        {topInsight && (
          <TouchableOpacity onPress={() => router.push('/insights' as any)} activeOpacity={0.85}>
            <GlassCard className="p-4 mb-6" glow glowColor="#FF9500">
              <View style={styles.insightHeader}>
                <View style={styles.insightIconContainer}>
                  <IconSymbol name="sparkles" size={18} color="#FF9500" />
                </View>
                <Text style={styles.insightBadge}>AI Insight</Text>
                <View style={[styles.impactBadge, { backgroundColor: '#EF444422' }]}>
                  <Text style={[styles.impactText, { color: '#EF4444' }]}>High Impact</Text>
                </View>
              </View>
              <Text style={styles.insightTitle}>{topInsight.title}</Text>
              <Text style={styles.insightDesc} numberOfLines={2}>{topInsight.description}</Text>
              <View style={styles.insightFooter}>
                <Text style={styles.insightAction} numberOfLines={1}>{topInsight.suggestedAction}</Text>
                <IconSymbol name="chevron.right" size={14} color="#FF9500" />
              </View>
            </GlassCard>
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
              <GlassCard className="p-3 mb-2">
                <View style={styles.vehicleRow}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleReg}>{vehicle.regNumber}</Text>
                    <Text style={styles.vehicleDriver}>{vehicle.driverName}</Text>
                  </View>
                  <View style={styles.vehicleStats}>
                    <Text style={styles.vehiclePax}>
                      <Text style={{ color: '#6152FF' }}>{vehicle.passengers}</Text>/{vehicle.maxCapacity} pax
                    </Text>
                    <StatusBadge status={vehicle.status} size="sm" />
                  </View>
                </View>
              </GlassCard>
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
          {unresolvedAlerts.slice(0, 2).map(alert => {
            const alertColors = { critical: '#EF4444', warning: '#F59E0B', info: '#6152FF' };
            const color = alertColors[alert.severity];
            return (
              <GlassCard key={alert.id} className="p-3 mb-2">
                <View style={styles.alertRow}>
                  <View style={[styles.alertDot, { backgroundColor: color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertVehicle}>{alert.vehicleReg}</Text>
                    <Text style={styles.alertDesc} numberOfLines={1}>{alert.description}</Text>
                  </View>
                  <Text style={styles.alertTime}>{alert.timestamp}</Text>
                </View>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  notifButton: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  statsGrid: { gap: 8, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 8 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  seeAll: { fontSize: 13, color: '#6152FF', fontWeight: '600' },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionItem: { alignItems: 'center', gap: 8, flex: 1 },
  quickActionIcon: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  quickActionLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '500', textAlign: 'center' },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insightIconContainer: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#FF950022', alignItems: 'center', justifyContent: 'center',
  },
  insightBadge: { fontSize: 11, color: '#FF9500', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  impactBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  impactText: { fontSize: 10, fontWeight: '600' },
  insightTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  insightDesc: { fontSize: 13, color: '#8E8E93', lineHeight: 18, marginBottom: 10 },
  insightFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  insightAction: { fontSize: 12, color: '#FF9500', flex: 1 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vehicleInfo: {},
  vehicleReg: { fontSize: 14, fontWeight: '700', color: '#1E293B', letterSpacing: 0.5, fontFamily: 'monospace' },
  vehicleDriver: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  vehicleStats: { alignItems: 'flex-end', gap: 4 },
  vehiclePax: { fontSize: 12, color: '#8E8E93' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertVehicle: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  alertDesc: { fontSize: 11, color: '#8E8E93' },
  alertTime: { fontSize: 10, color: '#8E8E93' },
});