import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerTrips, useOwnerVehicles } from "@/hooks/useOwnerData";
import { formatRelativeTime } from "@/lib/dateUtils";
import { Skeleton, ErrorState, EmptyState, UpdatedBadge } from "@/components/ui/state-views";

const STATUS_FILTERS = ['all', 'ongoing', 'completed'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function TripsScreen() {
  const params = useLocalSearchParams<{ vehicle_id?: string }>();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(
    params.vehicle_id ? String(params.vehicle_id) : undefined
  );

  const { data: vehicles = [] } = useOwnerVehicles(false);

  const {
    data: tripsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerTrips({
    vehicle_id: selectedVehicleId || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const trips = tripsData?.data ?? [];

  // Compliant with rule: create Animated.Value with useState(() => new Animated.Value(0.6))
  const [pulseAnim] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const onRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    refetch();
  };

  const handleStatusChange = (status: StatusFilter) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setStatusFilter(status);
  };

  const handleVehicleSelect = (id: string | undefined) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedVehicleId(id);
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.title}>Trips History</Text>
              <Text style={s.subtitle}>Real-time passenger & revenue logs</Text>
            </View>
            <UpdatedBadge
              updatedAt={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
              isFetching={isFetching}
            />
          </View>

          {/* Vehicle selector chip row */}
          {vehicles.length > 0 && (
            <View style={s.vehicleFilterRow}>
              <TouchableOpacity
                onPress={() => handleVehicleSelect(undefined)}
                style={[
                  s.vehicleFilterChip,
                  !selectedVehicleId && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    s.vehicleFilterText,
                    !selectedVehicleId && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  All Vehicles ({vehicles.length})
                </Text>
              </TouchableOpacity>

              {vehicles.map(v => {
                const isSelected = selectedVehicleId === String(v.id);
                return (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => handleVehicleSelect(isSelected ? undefined : String(v.id))}
                    style={[
                      s.vehicleFilterChip,
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        s.vehicleFilterText,
                        isSelected && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {v.number_plate}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Status filter chips */}
          <View style={s.statusFilterRow}>
            {STATUS_FILTERS.map(f => {
              const isSelected = statusFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => handleStatusChange(f)}
                  activeOpacity={0.8}
                  style={[
                    s.statusChip,
                    isSelected && { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      s.statusChipText,
                      isSelected && { color: theme.primary, fontWeight: '700' },
                    ]}
                  >
                    {f === 'all' ? 'All Trips' : f === 'ongoing' ? 'Ongoing' : 'Completed'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={{ padding: 20, gap: 12 }}>
            <Skeleton height={130} borderRadius={18} />
            <Skeleton height={130} borderRadius={18} />
            <Skeleton height={130} borderRadius={18} />
          </View>
        ) : isError ? (
          <ErrorState message={(error as any)?.message ?? "Could not load trips"} onRetry={refetch} />
        ) : (
          <FlatList
            data={trips}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => {
              const isOngoing = item.status === 'ongoing';

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push(`/trip/${item.id}` as any)}
                  style={s.tripCard}
                >
                  <View style={s.cardTop}>
                    <View style={s.routeWrap}>
                      <IconSymbol name="map.fill" size={15} color={theme.emerald} />
                      <Text style={s.routeText} numberOfLines={1}>
                        {item.route_name ?? 'Nairobi Loop'}
                      </Text>
                    </View>

                    {isOngoing ? (
                      <Animated.View
                        style={[
                          s.statusBadge,
                          s.statusOngoing,
                          { opacity: pulseAnim },
                        ]}
                      >
                        <View style={[s.pulseDot, { backgroundColor: theme.amber }]} />
                        <Text style={[s.statusText, { color: theme.amber }]}>ONGOING</Text>
                      </Animated.View>
                    ) : (
                      <View style={[s.statusBadge, s.statusCompleted]}>
                        <Text style={[s.statusText, { color: theme.emerald }]}>COMPLETED</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.cardMiddle}>
                    <View style={s.infoBlock}>
                      <Text style={s.infoLabel}>Vehicle</Text>
                      <Text style={s.infoValue}>{item.vehicle_plate ?? `ID #${item.vehicle_id}`}</Text>
                    </View>

                    <View style={s.infoBlock}>
                      <Text style={s.infoLabel}>Est. Boardings</Text>
                      <Text style={s.infoValue}>{item.boardings_estimate ?? 0} pax</Text>
                    </View>

                    <View style={s.infoBlock}>
                      <Text style={s.infoLabel}>Est. Revenue</Text>
                      <Text style={[s.infoValue, { color: theme.emerald }]}>
                        KES {Number(item.revenue_estimate ?? 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                      </Text>
                    </View>
                  </View>

                  <View style={s.cardBottom}>
                    <Text style={s.dateText}>
                      {item.started_at ? formatRelativeTime(item.started_at) : '—'}
                    </Text>
                    <Text style={s.distText}>
                      {item.distance_km ? `${item.distance_km} km` : '0 km'} · {item.duration_minutes ? `${item.duration_minutes}m` : 'active'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={onRefresh}
                tintColor={theme.primary}
              />
            }
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon="map.fill"
                title="No Trips Recorded"
                description={
                  selectedVehicleId
                    ? "No trips found for this vehicle. Trips will be recorded automatically when the vehicle moves."
                    : "No trips found. Launch the simulator or wait for vehicle telemetry."
                }
              />
            }
          />
        )}
      </ScreenContainer>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bg },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorder,
      backgroundColor: theme.bg,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    title: { fontSize: 26, fontWeight: '800', color: theme.textPrimary },
    subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },

    vehicleFilterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10,
    },
    vehicleFilterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    vehicleFilterText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: theme.textSecondary,
    },

    statusFilterRow: {
      flexDirection: 'row',
      gap: 8,
    },
    statusChip: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    statusChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },

    listContent: { padding: 20, paddingBottom: 100, gap: 12 },

    tripCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      shadowColor: theme.primaryDeep,
      shadowOpacity: theme.mode === 'dark' ? 0 : 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    routeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      marginRight: 8,
    },
    routeText: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
    },
    statusOngoing: {
      backgroundColor: theme.amberSoft,
      borderColor: theme.amber + '44',
    },
    statusCompleted: {
      backgroundColor: theme.emeraldSoft,
      borderColor: theme.emerald + '44',
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: { fontSize: 9.5, fontWeight: '800' },

    cardMiddle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
      backgroundColor: theme.mode === 'dark' ? theme.track : theme.bg,
      padding: 12,
      borderRadius: 14,
    },
    infoBlock: { alignItems: 'flex-start' },
    infoLabel: { fontSize: 10.5, color: theme.textSecondary, marginBottom: 3 },
    infoValue: { fontSize: 13, fontWeight: '700', color: theme.textPrimary },

    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      paddingTop: 10,
    },
    dateText: { fontSize: 11.5, color: theme.textSecondary, fontWeight: '500' },
    distText: { fontSize: 11.5, color: theme.textSecondary, fontWeight: '600' },
  });
