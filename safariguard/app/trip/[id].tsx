import React, { useMemo } from "react";
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
import * as Haptics from "expo-haptics";
import MapView, { Marker, Polyline } from "@/components/ui/map-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerTripDetail } from "@/hooks/useOwnerData";
import { formatTimeOnly } from "@/lib/dateUtils";
import { Skeleton, ErrorState, UpdatedBadge } from "@/components/ui/state-views";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const {
    data: trip,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerTripDetail(id);

  const onRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    refetch();
  };

  const routePoints = useMemo(() => {
    return (trip?.route_points ?? []).map(p => ({
      latitude: p.lat,
      longitude: p.lng,
    }));
  }, [trip?.route_points]);

  const mapRegion = useMemo(() => {
    if (!routePoints.length) {
      return {
        latitude: -1.286389,
        longitude: 36.821944,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    const lats = routePoints.map(p => p.latitude);
    const lngs = routePoints.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.4),
      longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.4),
    };
  }, [routePoints]);

  if (isLoading) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Trip Details</Text>
        </View>
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton height={200} borderRadius={20} />
          <Skeleton height={90} borderRadius={18} />
          <Skeleton height={140} borderRadius={18} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !trip) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Trip Details</Text>
        </View>
        <ErrorState
          message={(error as any)?.message ?? "Trip details not found"}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  const isOngoing = trip.status === 'ongoing';
  const startPoint = routePoints[0];
  const endPoint = routePoints[routePoints.length - 1];
  const occupancyTimeline = trip.occupancy_timeline ?? [];
  const maxPaxInTimeline = Math.max(1, ...occupancyTimeline.map(o => o.people));
  const events = trip.events ?? [];

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
          <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Trip #{trip.id}</Text>
          <Text style={s.headerSubtitle}>
            {trip.vehicle_plate ?? `Vehicle #${trip.vehicle_id}`} · {trip.route_name ?? 'Nairobi'}
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
        {/* Map Route */}
        <View style={s.mapContainer}>
          {routePoints.length > 0 && Platform.OS !== 'web' ? (
            <MapView style={s.map} region={mapRegion}>
              <Polyline
                coordinates={routePoints}
                strokeColor={theme.primary}
                strokeWidth={4}
              />
              {startPoint && (
                <Marker
                  coordinate={startPoint}
                  title="Trip Start"
                  pinColor={theme.emerald}
                />
              )}
              {endPoint && (
                <Marker
                  coordinate={endPoint}
                  title={isOngoing ? "Current Position" : "Trip Destination"}
                  pinColor={isOngoing ? theme.amber : theme.danger}
                />
              )}
              {events.map((e, idx) => (
                <Marker
                  key={`evt-${e.id ?? idx}`}
                  coordinate={{ latitude: e.lat, longitude: e.lng }}
                  title={e.type.replace('_', ' ').toUpperCase()}
                  description={`Severity ${e.severity}/3`}
                  pinColor={theme.danger}
                />
              ))}
            </MapView>
          ) : (
            <View style={s.mapFallback}>
              <View style={[s.mapIconCircle, { backgroundColor: theme.primarySoft }]}>
                <IconSymbol name="map.fill" size={32} color={theme.primary} />
              </View>
              <Text style={s.mapFallbackTitle}>
                {routePoints.length > 0
                  ? `${routePoints.length} GPS Waypoints Logged`
                  : 'Awaiting Route GPS Telemetry'}
              </Text>
              <Text style={s.mapFallbackSubtitle}>
                {trip.route_name ?? 'Nairobi Transit Corridor'}
              </Text>
            </View>
          )}

          <View style={s.routeSummaryBadge}>
            <Text style={s.routeSummaryText}>{trip.route_name ?? 'Nairobi Loop'}</Text>
            <View
              style={[
                s.statusBadge,
                isOngoing ? s.statusOngoing : s.statusCompleted,
              ]}
            >
              <Text
                style={[
                  s.statusText,
                  { color: isOngoing ? theme.amber : theme.emerald },
                ]}
              >
                {isOngoing ? 'ONGOING' : 'COMPLETED'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Distance</Text>
            <Text style={s.statValue}>{trip.distance_km ?? '0'} km</Text>
          </View>

          <View style={s.statBox}>
            <Text style={s.statLabel}>Duration</Text>
            <Text style={s.statValue}>
              {trip.duration_minutes ? `${trip.duration_minutes}m` : 'active'}
            </Text>
          </View>

          <View style={s.statBox}>
            <Text style={s.statLabel}>Est. Boardings</Text>
            <Text style={s.statValue}>{trip.boardings_estimate ?? 0} pax</Text>
          </View>

          <View style={s.statBox}>
            <Text style={s.statLabel}>Est. Revenue</Text>
            <Text style={[s.statValue, { color: theme.emerald }]}>
              KES {Number(trip.revenue_estimate ?? 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Occupancy Timeline Chart */}
        <Text style={s.sectionTitle}>Occupancy Over Time</Text>
        <View style={s.timelineCard}>
          {occupancyTimeline.length === 0 ? (
            <Text style={s.emptyTimelineText}>No passenger changes recorded on this trip.</Text>
          ) : (
            <View style={s.timelineBarsRow}>
              {occupancyTimeline.map((item, idx) => {
                const heightPct = Math.max(15, (item.people / maxPaxInTimeline) * 90);
                return (
                  <View key={`occ-${idx}`} style={s.timelineBarCol}>
                    <Text style={s.barPaxLabel}>{item.people}</Text>
                    <View
                      style={[
                        s.timelineBar,
                        {
                          height: heightPct,
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                    <Text style={s.barTimeLabel}>
                      {formatTimeOnly(item.recorded_at)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Driving Events Section */}
        <Text style={s.sectionTitle}>
          Driving Events ({events.length})
        </Text>
        {events.length === 0 ? (
          <View style={s.noEventsCard}>
            <IconSymbol name="checkmark.shield.fill" size={24} color={theme.emerald} />
            <Text style={s.noEventsText}>Clean drive — no harsh events detected on this trip.</Text>
          </View>
        ) : (
          <View style={s.eventsList}>
            {events.map((evt, idx) => {
              const sevColors = {
                1: theme.electric,
                2: theme.amber,
                3: theme.danger,
              };
              const sevColor = sevColors[evt.severity as 1 | 2 | 3] ?? theme.danger;

              return (
                <View key={`evt-${evt.id ?? idx}`} style={s.eventCard}>
                  <View style={[s.eventSevDot, { backgroundColor: sevColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.eventTitle}>
                      {evt.type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={s.eventSubtitle}>
                      {evt.lat.toFixed(4)}, {evt.lng.toFixed(4)} · {formatTimeOnly(evt.recorded_at)}
                    </Text>
                  </View>
                  <View style={[s.eventBadge, { backgroundColor: sevColor + '22' }]}>
                    <Text style={[s.eventBadgeText, { color: sevColor }]}>
                      Sev {evt.severity}/3
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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

    mapContainer: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.card,
      marginBottom: 20,
    },
    map: { width: '100%', height: 210 },
    mapFallback: {
      height: 180,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    mapIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    mapFallbackTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
    mapFallbackSubtitle: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },

    routeSummaryBadge: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      backgroundColor: theme.card,
    },
    routeSummaryText: { fontSize: 14, fontWeight: '800', color: theme.textPrimary },
    statusBadge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
    },
    statusOngoing: { backgroundColor: theme.amberSoft, borderColor: theme.amber + '44' },
    statusCompleted: { backgroundColor: theme.emeraldSoft, borderColor: theme.emerald + '44' },
    statusText: { fontSize: 10, fontWeight: '800' },

    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
    },
    statBox: {
      width: '48%',
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    statLabel: { fontSize: 11, color: theme.textSecondary, marginBottom: 4, fontWeight: '500' },
    statValue: { fontSize: 17, fontWeight: '800', color: theme.textPrimary },

    sectionTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },

    timelineCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginBottom: 24,
    },
    emptyTimelineText: { fontSize: 12, color: theme.textSecondary, textAlign: 'center', paddingVertical: 12 },
    timelineBarsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 120,
      paddingTop: 10,
    },
    timelineBarCol: { alignItems: 'center', gap: 6, flex: 1 },
    barPaxLabel: { fontSize: 10, fontWeight: '700', color: theme.primary },
    timelineBar: { width: 14, borderRadius: 6 },
    barTimeLabel: { fontSize: 9, color: theme.textSecondary },

    noEventsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.emeraldSoft,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.emerald + '33',
    },
    noEventsText: { fontSize: 12.5, color: theme.mode === 'dark' ? theme.emerald : '#1A8A62', fontWeight: '600', flex: 1 },

    eventsList: { gap: 10 },
    eventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.card,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    eventSevDot: { width: 10, height: 10, borderRadius: 5 },
    eventTitle: { fontSize: 13, fontWeight: '800', color: theme.textPrimary },
    eventSubtitle: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
    eventBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    eventBadgeText: { fontSize: 10, fontWeight: '800' },
  });
