import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "@/components/ui/map-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StatusBadge } from "@/components/ui/badges";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerVehicles } from "@/hooks/useOwnerData";
import { formatRelativeTime } from "@/lib/dateUtils";
import { Skeleton, ErrorState, EmptyState, UpdatedBadge } from "@/components/ui/state-views";

export default function GPSScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const {
    data: vehicles = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerVehicles();

  const [selectedId, setSelectedId] = useState<number | undefined>(
    vehicleId ? Number(vehicleId) : undefined
  );

  const selectedVehicle = useMemo(() => {
    if (selectedId) {
      const found = vehicles.find(v => v.id === selectedId);
      if (found) return found;
    }
    return vehicles[0];
  }, [vehicles, selectedId]);

  const mapRegion = useMemo(() => {
    if (selectedVehicle?.last_location) {
      return {
        latitude: selectedVehicle.last_location.lat,
        longitude: selectedVehicle.last_location.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
    }
    return {
      latitude: -1.286389,
      longitude: 36.821944,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [selectedVehicle]);

  const onlineVehiclesCount = vehicles.filter(v => v.device_connected).length;

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton} activeOpacity={0.8}>
            <IconSymbol name="arrow.left" size={18} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>GPS Fleet Tracking</Text>
            <Text style={s.subtitle}>
              {onlineVehiclesCount} of {vehicles.length} devices online
            </Text>
          </View>
          <UpdatedBadge
            updatedAt={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
            isFetching={isFetching}
          />
        </View>

        {isLoading ? (
          <View style={{ padding: 20, gap: 16 }}>
            <Skeleton height={280} borderRadius={20} />
            <Skeleton height={140} borderRadius={20} />
          </View>
        ) : isError ? (
          <ErrorState message={(error as any)?.message ?? "Could not load GPS telemetry"} onRetry={refetch} />
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon="car.fill"
            title="No Vehicles in Fleet"
            description="Add vehicles to start tracking their positions on the live map."
            actionLabel="Add Vehicle"
            onAction={() => router.push('/onboarding/add-vehicle' as any)}
          />
        ) : (
          <View style={{ flex: 1 }}>
            {/* Map View */}
            <View style={s.mapContainer}>
              {Platform.OS !== 'web' ? (
                <MapView style={s.map} region={mapRegion}>
                  {vehicles.map(v => {
                    if (!v.last_location) return null;
                    const pinColor =
                      v.status === 'active'
                        ? theme.emerald
                        : v.status === 'idle'
                        ? theme.amber
                        : theme.danger;

                    return (
                      <Marker
                        key={v.id}
                        coordinate={{
                          latitude: v.last_location.lat,
                          longitude: v.last_location.lng,
                        }}
                        title={v.number_plate}
                        description={`${v.route_name ?? 'Transit'} · ${v.status.toUpperCase()}`}
                        pinColor={pinColor}
                        onPress={() => setSelectedId(v.id)}
                      />
                    );
                  })}
                </MapView>
              ) : (
                <View style={s.webFallback}>
                  <IconSymbol name="map.fill" size={36} color={theme.primary} />
                  <Text style={s.webFallbackTitle}>Nairobi Metropolitan Area</Text>
                  <Text style={s.webFallbackSub}>
                    Tracking {vehicles.length} vehicles across active routes
                  </Text>
                </View>
              )}

              {/* Legend */}
              <View style={s.mapLegend}>
                {[
                  { color: theme.emerald, label: 'Active' },
                  { color: theme.amber, label: 'Idle' },
                  { color: theme.danger, label: 'Offline' },
                ].map(item => (
                  <View key={item.label} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: item.color }]} />
                    <Text style={s.legendText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Selected Vehicle Card */}
            {selectedVehicle && (
              <View style={s.selectedCard}>
                <View style={s.selectedHeader}>
                  <View>
                    <Text style={s.selectedReg}>{selectedVehicle.number_plate}</Text>
                    <Text style={s.selectedRoute}>
                      {selectedVehicle.route_name ?? `${selectedVehicle.make ?? ''} ${selectedVehicle.model ?? ''}`.trim() ?? 'Route unassigned'}
                    </Text>
                  </View>
                  <StatusBadge status={selectedVehicle.status} />
                </View>

                <View style={s.selectedStats}>
                  <View style={s.selectedStat}>
                    <Text style={s.selectedStatValue}>
                      {selectedVehicle.occupancy.people}/{selectedVehicle.occupancy.capacity}
                    </Text>
                    <Text style={s.selectedStatLabel}>Occupancy</Text>
                  </View>
                  <View style={s.selectedStat}>
                    <Text style={s.selectedStatValue}>
                      {selectedVehicle.safety_score !== null ? `${selectedVehicle.safety_score} pts` : '—'}
                    </Text>
                    <Text style={s.selectedStatLabel}>Safety</Text>
                  </View>
                  <View style={s.selectedStat}>
                    <Text style={s.selectedStatValue}>
                      {selectedVehicle.today.trips}
                    </Text>
                    <Text style={s.selectedStatLabel}>Trips Today</Text>
                  </View>
                  <View style={s.selectedStat}>
                    <Text style={s.selectedStatValue}>
                      {formatRelativeTime(selectedVehicle.last_seen_at)}
                    </Text>
                    <Text style={s.selectedStatLabel}>Last Seen</Text>
                  </View>
                </View>

                <View style={s.locationRow}>
                  <IconSymbol name="location.fill" size={12} color={theme.primary} />
                  <Text style={s.locationText}>
                    {selectedVehicle.last_location
                      ? `${selectedVehicle.last_location.lat.toFixed(5)}, ${selectedVehicle.last_location.lng.toFixed(5)}`
                      : 'No recent GPS coordinates recorded'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/vehicle/${selectedVehicle.id}` as any)}
                    style={s.viewDetailsBtn}
                  >
                    <Text style={s.viewDetailsText}>Overview →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Vehicle Selector Chips */}
            <Text style={s.listTitle}>All Vehicles ({vehicles.length})</Text>
            <FlatList
              data={vehicles}
              keyExtractor={item => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.vehicleListContent}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedVehicle?.id;
                const statusColor =
                  item.status === 'active'
                    ? theme.emerald
                    : item.status === 'idle'
                    ? theme.amber
                    : theme.danger;

                return (
                  <TouchableOpacity
                    onPress={() => setSelectedId(item.id)}
                    activeOpacity={0.8}
                    style={[
                      s.vehicleChip,
                      isSelected && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
                    ]}
                  >
                    <View style={[s.chipDot, { backgroundColor: statusColor }]} />
                    <View>
                      <Text
                        style={[
                          s.chipReg,
                          isSelected && { color: theme.primary, fontWeight: '800' },
                        ]}
                      >
                        {item.number_plate}
                      </Text>
                      <Text style={s.chipStatus}>
                        {item.occupancy.people} pax · {item.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
      </ScreenContainer>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorder,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
    subtitle: { fontSize: 11, color: theme.textSecondary, marginTop: 1 },

    mapContainer: {
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 12,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.cardBorder,
      height: 250,
      position: 'relative',
    },
    map: { width: '100%', height: '100%' },
    webFallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
      gap: 8,
      padding: 20,
    },
    webFallbackTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
    webFallbackSub: { fontSize: 12, color: theme.textSecondary },

    mapLegend: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      flexDirection: 'row',
      gap: 10,
      backgroundColor: theme.mode === 'dark' ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.92)',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 6, height: 6, borderRadius: 3 },
    legendText: { fontSize: 9.5, color: theme.textSecondary, fontWeight: '600' },

    selectedCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    selectedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    selectedReg: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.textPrimary,
      fontFamily: 'monospace',
    },
    selectedRoute: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },

    selectedStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorder,
    },
    selectedStat: { alignItems: 'center' },
    selectedStatValue: { fontSize: 14, fontWeight: '800', color: theme.textPrimary },
    selectedStatLabel: { fontSize: 10, color: theme.textSecondary, marginTop: 2 },

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    locationText: {
      fontSize: 11,
      color: theme.textSecondary,
      fontFamily: 'monospace',
      flex: 1,
    },
    viewDetailsBtn: { paddingVertical: 2, paddingHorizontal: 6 },
    viewDetailsText: { fontSize: 11.5, fontWeight: '700', color: theme.primary },

    listTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.textSecondary,
      paddingHorizontal: 16,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    vehicleListContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
    vehicleChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    chipDot: { width: 8, height: 8, borderRadius: 4 },
    chipReg: { fontSize: 13, fontWeight: '700', color: theme.textPrimary, fontFamily: 'monospace' },
    chipStatus: { fontSize: 10, color: theme.textSecondary, marginTop: 1 },
  });