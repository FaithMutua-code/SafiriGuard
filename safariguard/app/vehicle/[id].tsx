import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import MapView, { Marker } from "@/components/ui/map-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StatusBadge } from "@/components/ui/badges";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerVehicleOverview } from "@/hooks/useOwnerData";
import { Skeleton, ErrorState, UpdatedBadge } from "@/components/ui/state-views";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerVehicleOverview(id);

  const onRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    refetch();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Vehicle Details</Text>
        </View>
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton height={200} borderRadius={24} />
          <Skeleton height={120} borderRadius={20} />
          <Skeleton height={180} borderRadius={20} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !overview) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Vehicle Details</Text>
        </View>
        <ErrorState
          message={(error as any)?.message ?? "Vehicle not found"}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  const v = overview.vehicle;
  const isOnline = overview.status !== 'offline';
  const hasCoords = overview.location && typeof overview.location.lat === 'number';

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
          <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{v.number_plate}</Text>
          <Text style={s.headerSubtitle}>
            {v.route_name ?? `${v.make ?? ''} ${v.model ?? ''}`.trim() ?? 'Vehicle Overview'}
          </Text>
        </View>
        <UpdatedBadge
          updatedAt={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
          isFetching={isFetching}
        />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Hero Card */}
        <LinearGradient
          colors={[theme.primary, theme.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroTopRow}>
            <View>
              <Text style={s.regNum}>{v.number_plate}</Text>
              <Text style={s.modelText}>
                {v.make} {v.model} {v.year ? `(${v.year})` : ''} · {v.seat_capacity} Seater
              </Text>
            </View>
            <StatusBadge status={overview.status} />
          </View>

          <View style={s.onlineBadgeRow}>
            <View
              style={[
                s.onlineBadge,
                { backgroundColor: isOnline ? 'rgba(46,204,143,0.2)' : 'rgba(255,107,107,0.2)' },
              ]}
            >
              <View
                style={[
                  s.onlineDot,
                  { backgroundColor: isOnline ? theme.emerald : theme.danger },
                ]}
              />
              <Text style={[s.onlineText, { color: isOnline ? '#FFFFFF' : theme.accentSoft }]}>
                {isOnline ? 'IoT Device Online' : 'Device Offline (>2m)'}
              </Text>
            </View>

            <Text style={s.fareText}>
              KES {Number(v.fare_amount).toFixed(0)} / pax
            </Text>
          </View>

          {/* Occupancy and Safety Rings */}
          <View style={s.gaugesRow}>
            <View style={s.gaugeWrap}>
              <CircularGauge
                value={overview.occupancy.people}
                maxValue={overview.occupancy.capacity || 14}
                size={70}
                strokeWidth={6}
                label={`${overview.occupancy.people}`}
                sublabel="pax"
              />
              <Text style={s.gaugeLabel}>Current Occupancy</Text>
            </View>

            <View style={s.gaugeWrap}>
              <CircularGauge
                value={overview.safety.score ?? 100}
                maxValue={100}
                size={70}
                strokeWidth={6}
                label={overview.safety.score !== null ? `${overview.safety.score}` : '—'}
                sublabel="pts"
              />
              <Text style={s.gaugeLabel}>Safety Score</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Estimated Stats */}
        <Text style={s.sectionTitle}>{"Today's Operational Summary (Estimated)"}</Text>
        <View style={s.kpiGrid}>
          <View style={s.kpiCard}>
            <Text style={s.kpiValue}>{overview.today.trips}</Text>
            <Text style={s.kpiLabel}>Trips Completed</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiValue}>{overview.today.passengers_estimate}</Text>
            <Text style={s.kpiLabel}>Est. Passengers</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiValue}>{overview.today.distance_km}</Text>
            <Text style={s.kpiLabel}>Distance (km)</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={[s.kpiValue, { color: theme.emerald }]}>
              KES {Number(overview.today.revenue_estimate).toLocaleString('en-KE', { minimumFractionDigits: 0 })}
            </Text>
            <Text style={s.kpiLabel}>Est. Revenue</Text>
          </View>
        </View>

        {/* Mini Live Map */}
        <Text style={s.sectionTitle}>Live Location</Text>
        <View style={s.mapContainer}>
          {hasCoords && Platform.OS !== 'web' ? (
            <MapView
              style={s.map}
              initialRegion={{
                latitude: overview.location!.lat,
                longitude: overview.location!.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: overview.location!.lat,
                  longitude: overview.location!.lng,
                }}
                title={v.number_plate}
                description={overview.status.toUpperCase()}
              />
            </MapView>
          ) : (
            <View style={s.mapFallback}>
              <View style={[s.mapPinWrap, { backgroundColor: theme.primarySoft }]}>
                <IconSymbol name="location.fill" size={28} color={theme.primary} />
              </View>
              <Text style={s.coordsTitle}>
                {hasCoords
                  ? `${overview.location!.lat.toFixed(5)}, ${overview.location!.lng.toFixed(5)}`
                  : 'Awaiting GPS Fix'}
              </Text>
              <Text style={s.coordsDesc}>
                {v.route_name ?? 'Nairobi Operations Area'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={s.fullMapBtn}
            activeOpacity={0.85}
            onPress={() => router.push(`/gps?vehicleId=${id}` as any)}
          >
            <IconSymbol name="map.fill" size={14} color="#FFFFFF" />
            <Text style={s.fullMapText}>Open Live GPS Track</Text>
          </TouchableOpacity>
        </View>

        {/* Shortcuts */}
        <Text style={s.sectionTitle}>Deep Dives</Text>
        <View style={s.shortcutsGrid}>
          <TouchableOpacity
            style={[s.shortcutCard, { backgroundColor: theme.card }]}
            activeOpacity={0.8}
            onPress={() => router.push(`/vehicle/passengers?vehicleId=${id}` as any)}
          >
            <View style={[s.shortcutIcon, { backgroundColor: theme.amberSoft }]}>
              <IconSymbol name="person.3.fill" size={20} color={theme.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.shortcutTitle}>Passenger Stats</Text>
              <Text style={s.shortcutDesc}>Hourly & daily boarding trends</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.shortcutCard, { backgroundColor: theme.card }]}
            activeOpacity={0.8}
            onPress={() => router.push(`/vehicle/safety?vehicleId=${id}` as any)}
          >
            <View style={[s.shortcutIcon, { backgroundColor: theme.electricSoft }]}>
              <IconSymbol name="shield.fill" size={20} color={theme.electric} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.shortcutTitle}>Safety Stats</Text>
              <Text style={s.shortcutDesc}>Harsh braking & event breakdown</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.shortcutCard, { backgroundColor: theme.card }]}
            activeOpacity={0.8}
            onPress={() => router.push(`/(tabs)/trips?vehicle_id=${id}` as any)}
          >
            <View style={[s.shortcutIcon, { backgroundColor: theme.emeraldSoft }]}>
              <IconSymbol name="map.fill" size={20} color={theme.emerald} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.shortcutTitle}>Vehicle Trips</Text>
              <Text style={s.shortcutDesc}>Trip history filtered to this vehicle</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.shortcutCard, { backgroundColor: theme.card }]}
            activeOpacity={0.8}
            onPress={() => router.push('/insights' as any)}
          >
            <View style={[s.shortcutIcon, { backgroundColor: theme.primarySoft }]}>
              <IconSymbol name="sparkles" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.shortcutTitle}>Fleet Insights</Text>
              <Text style={s.shortcutDesc}>Revenue trends & route optimization</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 14,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorder,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary },
    headerSubtitle: { fontSize: 11, color: theme.textSecondary },

    content: { padding: 20, paddingBottom: 100 },

    heroCard: {
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
      shadowColor: theme.primaryDeep,
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    regNum: {
      fontSize: 26,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
      fontFamily: 'monospace',
    },
    modelText: { fontSize: 13, color: theme.textOnDarkMuted, marginTop: 2 },
    onlineBadgeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.14)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.14)',
      marginBottom: 16,
    },
    onlineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    onlineDot: { width: 6, height: 6, borderRadius: 3 },
    onlineText: { fontSize: 11, fontWeight: '700' },
    fareText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

    gaugesRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 4,
    },
    gaugeWrap: { alignItems: 'center', gap: 8 },
    gaugeLabel: { fontSize: 11, fontWeight: '600', color: theme.textOnDarkMuted },

    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: 12,
      marginTop: 4,
      letterSpacing: 0.2,
    },

    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
    },
    kpiCard: {
      width: '48%',
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    kpiValue: { fontSize: 18, fontWeight: '800', color: theme.textPrimary, marginBottom: 2 },
    kpiLabel: { fontSize: 11, color: theme.textSecondary, fontWeight: '500' },

    mapContainer: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.card,
    },
    map: { width: '100%', height: 160 },
    mapFallback: {
      height: 150,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    mapPinWrap: {
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    coordsTitle: { fontSize: 13, fontWeight: '700', color: theme.textPrimary, fontFamily: 'monospace' },
    coordsDesc: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
    fullMapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.primary,
      paddingVertical: 12,
    },
    fullMapText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

    shortcutsGrid: { gap: 10, marginBottom: 16 },
    shortcutCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    shortcutIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shortcutTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
    shortcutDesc: { fontSize: 11, color: theme.textSecondary, marginTop: 1 },
  });
