import React, { useEffect, useState, useMemo } from "react";
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
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StatusBadge } from "@/components/ui/badges";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useAppAuth } from "@/context/AuthContext";
import { useOwnerVehicles, useOwnerAlerts, useOwnerInsights } from "@/hooks/useOwnerData";
import { Skeleton, ErrorState, UpdatedBadge } from "@/components/ui/state-views";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { user } = useAppAuth();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  // Compliant with rule: create Animated.Value with useState(() => new Animated.Value(0))
  const [headerAnim] = useState(() => new Animated.Value(0));

  const {
    data: vehicles = [],
    isLoading: loadingVehicles,
    isError: vehiclesError,
    refetch: refetchVehicles,
    isFetching: fetchingVehicles,
    dataUpdatedAt: vehiclesUpdatedAt,
  } = useOwnerVehicles();

  const {
    data: alertsData,
    isLoading: loadingAlerts,
    refetch: refetchAlerts,
  } = useOwnerAlerts('active');

  const {
    data: insightsData,
    refetch: refetchInsights,
  } = useOwnerInsights('today');

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const onRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    refetchVehicles();
    refetchAlerts();
    refetchInsights();
  };

  const alerts = alertsData?.data ?? [];
  const activeAlertsCount = alertsData?.meta?.total ?? alerts.length;

  const fleetStats = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const totalPassengers = vehicles.reduce((s, v) => s + v.occupancy.people, 0);
    const totalCapacity = vehicles.reduce((s, v) => s + v.occupancy.capacity, 0);
    const tripsToday = vehicles.reduce((s, v) => s + (v.today?.trips ?? 0), 0);

    const scoredVehicles = vehicles.filter(v => v.safety_score !== null);
    const avgSafetyScore = scoredVehicles.length > 0
      ? Math.round(scoredVehicles.reduce((s, v) => s + (v.safety_score ?? 0), 0) / scoredVehicles.length)
      : (vehicles.length > 0 ? 100 : 0);

    const estRevenueToday = insightsData?.totals?.revenue_estimate
      ? Number(insightsData.totals.revenue_estimate)
      : 0;

    return {
      activeVehicles,
      totalPassengers,
      totalCapacity,
      tripsToday,
      avgSafetyScore,
      estRevenueToday,
    };
  }, [vehicles, insightsData]);

  const QUICK_ACTIONS = [
    {
      id: 'fleet',
      label: 'My Vehicles',
      icon: 'car.2.fill',
      color: theme.primary,
      soft: theme.mode === 'dark' ? theme.primary + '22' : '#EDEAFB',
      route: '/(tabs)/vehicles',
    },
    {
      id: 'trips',
      label: 'Trips',
      icon: 'map.fill',
      color: theme.emerald,
      soft: theme.emeraldSoft,
      route: '/(tabs)/trips',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: 'sparkles',
      color: theme.amber,
      soft: theme.amberSoft,
      route: '/insights',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: 'bell.badge.fill',
      color: theme.danger,
      soft: theme.dangerSoft,
      route: '/(tabs)/notifications',
    },
  ];

  const topInsight = insightsData?.insights?.[0];

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={fetchingVehicles && !loadingVehicles}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
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
                <Text style={s.userName}>{user?.name ?? 'Vehicle Owner'}</Text>
                <Text style={s.rolePill}>OWNER DASHBOARD</Text>
              </View>

              <TouchableOpacity
                style={s.notifButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/notifications' as any)}
              >
                <IconSymbol name="bell.fill" size={19} color="#FFFFFF" />
                {activeAlertsCount > 0 && (
                  <View style={s.notifBadge}>
                    <Text style={s.notifBadgeText}>{activeAlertsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={s.liveUpdateRow}>
              <Text style={s.revHeroLabel}>{"TODAY'S ESTIMATED REVENUE"}</Text>
              <UpdatedBadge
                updatedAt={vehiclesUpdatedAt ? new Date(vehiclesUpdatedAt) : null}
                isFetching={fetchingVehicles}
              />
            </View>

            <Text style={s.revHeroAmount}>
              KES {fleetStats.estRevenueToday.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
            </Text>

            {/* KPI Grid */}
            <View style={s.kpiGrid}>
              <View style={[s.kpiTile, { borderLeftColor: theme.emerald }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(46,204,143,0.22)' }]}>
                  <IconSymbol name="car.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>{fleetStats.activeVehicles}</Text>
                <Text style={s.kpiLabel}>Active Vehicles</Text>
              </View>

              <View style={[s.kpiTile, { borderLeftColor: theme.electric }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(62,143,255,0.22)' }]}>
                  <IconSymbol name="person.3.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>
                  {fleetStats.totalPassengers}
                  <Text style={s.kpiSmall}>/{fleetStats.totalCapacity || '—'}</Text>
                </Text>
                <Text style={s.kpiLabel}>Occupancy</Text>
              </View>

              <View style={[s.kpiTile, { borderLeftColor: theme.amber }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(245,166,35,0.22)' }]}>
                  <IconSymbol name="shield.fill" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>{fleetStats.avgSafetyScore}</Text>
                <Text style={s.kpiLabel}>Avg Safety</Text>
              </View>

              <View style={[s.kpiTile, { borderLeftColor: theme.accent }]}>
                <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(255,138,101,0.22)' }]}>
                  <IconSymbol name="chart.line.uptrend.xyaxis" size={13} color="#FFFFFF" />
                </View>
                <Text style={s.kpiValue}>{fleetStats.tripsToday}</Text>
                <Text style={s.kpiLabel}>Trips Today</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={s.body}>
            {/* Secondary stats row */}
            <View style={s.secondaryStatsRow}>
              <TouchableOpacity
                style={[s.secondaryCard, activeAlertsCount > 0 && s.secondaryCardAlert]}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/notifications' as any)}
              >
                <View style={[s.secondaryIconWrap, { backgroundColor: theme.dangerSoft }]}>
                  <IconSymbol name="bell.badge.fill" size={16} color={theme.danger} />
                </View>
                <Text style={s.secondaryValue}>{activeAlertsCount}</Text>
                <Text style={s.secondaryLabel}>Active Alerts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.secondaryCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/vehicles' as any)}
              >
                <View style={[s.secondaryIconWrap, { backgroundColor: theme.emeraldSoft }]}>
                  <IconSymbol name="wifi" size={16} color={theme.emerald} />
                </View>
                <Text style={s.secondaryValue}>
                  {vehicles.filter(v => v.device_connected).length}/{vehicles.length}
                </Text>
                <Text style={s.secondaryLabel}>Devices Online</Text>
              </TouchableOpacity>
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

            {/* AI Insights Card (if available from real data) */}
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
                    <Text style={s.insightBadge}>Operational Insight</Text>
                    <View style={s.impactBadge}>
                      <Text style={s.impactText}>
                        {topInsight.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.insightTitle}>{topInsight.title}</Text>
                  <Text style={s.insightDesc} numberOfLines={2}>
                    {topInsight.description}
                  </Text>
                  <View style={s.insightFooter}>
                    <Text style={s.insightAction}>View all fleet insights</Text>
                    <IconSymbol name="chevron.right" size={14} color={theme.amber} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Live Fleet Preview */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Live Fleet</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/vehicles' as any)}>
                  <Text style={s.seeAll}>See All ({vehicles.length})</Text>
                </TouchableOpacity>
              </View>

              {loadingVehicles ? (
                <View style={{ gap: 10 }}>
                  <Skeleton height={74} borderRadius={18} />
                  <Skeleton height={74} borderRadius={18} />
                </View>
              ) : vehiclesError ? (
                <ErrorState message="Could not load fleet" onRetry={refetchVehicles} />
              ) : vehicles.length === 0 ? (
                <TouchableOpacity
                  style={s.emptyFleetCard}
                  onPress={() => router.push('/onboarding/add-vehicle' as any)}
                >
                  <IconSymbol name="plus.circle.fill" size={24} color={theme.primary} />
                  <Text style={s.emptyFleetText}>No vehicles registered yet — tap to add</Text>
                </TouchableOpacity>
              ) : (
                vehicles.slice(0, 3).map(vehicle => (
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
                        <Text style={s.vehicleReg}>{vehicle.number_plate}</Text>
                        <Text style={s.vehicleRoute} numberOfLines={1}>
                          {vehicle.route_name ?? `${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim() ?? 'Route unassigned'}
                        </Text>
                      </View>
                      <View style={s.vehicleStats}>
                        <Text style={s.vehiclePax}>
                          <Text style={{ color: theme.primary, fontWeight: '700' }}>
                            {vehicle.occupancy.people}
                          </Text>
                          /{vehicle.occupancy.capacity} pax
                        </Text>
                        <StatusBadge status={vehicle.status} size="sm" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Recent Alerts */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Recent Active Alerts</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/notifications' as any)}>
                  <Text style={s.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              {loadingAlerts ? (
                <Skeleton height={68} borderRadius={16} />
              ) : alerts.length === 0 ? (
                <View style={s.emptyAlerts}>
                  <View style={s.emptyAlertsIcon}>
                    <IconSymbol name="checkmark.shield.fill" size={20} color={theme.emerald} />
                  </View>
                  <Text style={s.emptyAlertsText}>All clear — no active alerts</Text>
                </View>
              ) : (
                alerts.slice(0, 3).map(alert => {
                  const alertColors = {
                    critical: theme.danger,
                    warning: theme.amber,
                    info: theme.electric,
                  };
                  const color = alertColors[alert.severity] ?? theme.electric;

                  return (
                    <TouchableOpacity
                      key={alert.id}
                      activeOpacity={0.85}
                      onPress={() => router.push('/(tabs)/notifications' as any)}
                      style={s.alertCard}
                    >
                      <View style={[s.alertAccent, { backgroundColor: color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.alertVehicle}>
                          {alert.vehicle_plate ?? `Vehicle #${alert.vehicle_id}`}
                        </Text>
                        <Text style={s.alertDesc} numberOfLines={1}>
                          {alert.description}
                        </Text>
                      </View>
                      <View style={[s.alertSevBadge, { backgroundColor: color + '1A' }]}>
                        <Text style={[s.alertSevText, { color }]}>
                          {alert.severity.toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
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

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.primary },
    scrollContent: { paddingBottom: 100 },

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
    heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    greeting: { fontSize: 13, color: theme.textOnDarkMuted, marginBottom: 2 },
    userName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
    rolePill: {
      alignSelf: 'flex-start',
      fontSize: 9.5,
      fontWeight: '800',
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      letterSpacing: 0.8,
    },
    notifButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 6,
      backgroundColor: theme.danger,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    notifBadgeText: { fontSize: 9, color: '#FFFFFF', fontWeight: '800' },

    liveUpdateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    revHeroLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textOnDarkMuted,
      letterSpacing: 1.2,
    },
    revHeroAmount: {
      fontSize: 30,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.5,
      marginBottom: 16,
    },

    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
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
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    kpiSmall: { fontSize: 13, fontWeight: '600', color: theme.textOnDarkMuted },
    kpiLabel: { fontSize: 10.5, color: theme.textOnDarkMuted, marginTop: 2, fontWeight: '500' },

    body: { paddingHorizontal: 20, paddingTop: 18 },

    secondaryStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    secondaryCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 18,
      padding: 14,
      shadowColor: theme.primary,
      shadowOpacity: theme.mode === 'dark' ? 0 : 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    secondaryCardAlert: {
      borderColor: theme.mode === 'dark' ? theme.danger + '55' : '#FFD3D3',
    },
    secondaryIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    secondaryValue: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
    secondaryLabel: { fontSize: 11, color: theme.textSecondary, marginTop: 2, fontWeight: '500' },

    section: { marginBottom: 24 },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },
    seeAll: { fontSize: 13, color: theme.primary, fontWeight: '700' },

    quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    quickActionItem: { alignItems: 'center', gap: 8, flex: 1 },
    quickActionIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    },

    insightCard: {
      borderRadius: 22,
      padding: 18,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? theme.amber + '33' : '#FFE4B8',
    },
    insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    insightIconContainer: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: theme.amberSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insightBadge: {
      fontSize: 11,
      color: theme.amber,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      flex: 1,
    },
    impactBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: theme.dangerSoft,
    },
    impactText: { fontSize: 9.5, fontWeight: '800', color: theme.danger },
    insightTitle: { fontSize: 14.5, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
    insightDesc: { fontSize: 12.5, color: theme.textSecondary, lineHeight: 18, marginBottom: 10 },
    insightFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    insightAction: { fontSize: 12, color: theme.amber, fontWeight: '600', flex: 1 },

    vehicleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
      shadowColor: theme.primary,
      shadowOpacity: theme.mode === 'dark' ? 0 : 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    vehicleIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.mode === 'dark' ? theme.primary + '22' : '#EDEAFB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    vehicleInfo: { flex: 1 },
    vehicleReg: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textPrimary,
      letterSpacing: 0.5,
      fontFamily: 'monospace',
    },
    vehicleRoute: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
    vehicleStats: { alignItems: 'flex-end', gap: 4 },
    vehiclePax: { fontSize: 12, color: theme.textSecondary },

    emptyFleetCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderStyle: 'dashed',
    },
    emptyFleetText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },

    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    },
    alertAccent: { width: 4, height: 32, borderRadius: 2 },
    alertVehicle: { fontSize: 13, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
    alertDesc: { fontSize: 11, color: theme.textSecondary },
    alertSevBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    alertSevText: { fontSize: 9.5, fontWeight: '800' },

    emptyAlerts: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.emeraldSoft,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? theme.emerald + '33' : '#C9F2E1',
    },
    emptyAlertsIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyAlertsText: {
      fontSize: 13,
      color: theme.mode === 'dark' ? theme.emerald : '#1A8A62',
      fontWeight: '600',
    },
  });