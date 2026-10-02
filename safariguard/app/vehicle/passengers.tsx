import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerPassengers } from "@/hooks/useOwnerData";
import { formatTimeOnly } from "@/lib/dateUtils";
import { Skeleton, ErrorState, UpdatedBadge } from "@/components/ui/state-views";

const RANGES = ['today', 'week', 'month'] as const;
type RangeType = typeof RANGES[number];

export default function PassengerStatsScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [range, setRange] = useState<RangeType>('today');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerPassengers(vehicleId, range);

  const handleRangeChange = (r: RangeType) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setRange(r);
  };

  const onRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    refetch();
  };

  const buckets = data?.buckets ?? [];
  const maxVal = Math.max(1, ...buckets.map(b => b.value));
  const peakLabel = data?.peak_bucket?.label;

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
          <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Passenger Stats</Text>
          <Text style={s.headerSubtitle}>
            Vehicle #{vehicleId} · Estimated Boardings
          </Text>
        </View>
        <UpdatedBadge
          updatedAt={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
          isFetching={isFetching}
        />
      </View>

      {/* Range Toggle */}
      <View style={s.rangeRow}>
        {RANGES.map(r => {
          const isSelected = range === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => handleRangeChange(r)}
              activeOpacity={0.8}
              style={[
                s.rangeChip,
                isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  s.rangeText,
                  isSelected && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton height={100} borderRadius={20} />
          <Skeleton height={220} borderRadius={20} />
          <Skeleton height={140} borderRadius={20} />
        </View>
      ) : isError || !data ? (
        <ErrorState
          message={(error as any)?.message ?? "Could not load passenger analytics"}
          onRetry={refetch}
        />
      ) : (
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
          {/* Summary Cards */}
          <View style={s.summaryCard}>
            <View style={s.statCol}>
              <Text style={s.statLabel}>Total (Est.)</Text>
              <Text style={s.statValue}>{data.total_passengers_estimate}</Text>
              <Text style={s.statSub}>passengers</Text>
            </View>
            <View style={s.verticalDivider} />
            <View style={s.statCol}>
              <Text style={s.statLabel}>Avg / Trip</Text>
              <Text style={s.statValue}>{data.avg_per_trip}</Text>
              <Text style={s.statSub}>pax / trip</Text>
            </View>
            <View style={s.verticalDivider} />
            <View style={s.statCol}>
              <Text style={s.statLabel}>Current</Text>
              <Text style={[s.statValue, { color: theme.primary }]}>
                {data.current_occupancy}
                <Text style={s.statCapacity}>/{data.capacity}</Text>
              </Text>
              <Text style={s.statSub}>occupancy</Text>
            </View>
          </View>

          {/* Buckets Trend Chart */}
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <View>
                <Text style={s.chartTitle}>Boarding Trend ({range.toUpperCase()})</Text>
                <Text style={s.chartSubtitle}>
                  {data.peak_bucket && data.peak_bucket.value > 0
                    ? `Peak: ${data.peak_bucket.label} (${data.peak_bucket.value} pax)`
                    : 'No boardings registered yet'}
                </Text>
              </View>
              {data.peak_bucket && data.peak_bucket.value > 0 && (
                <View style={s.peakBadge}>
                  <Text style={s.peakBadgeText}>PEAK</Text>
                </View>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.chartContainer}>
                {buckets.map((b, idx) => {
                  const isPeak = b.label === peakLabel && b.value > 0;
                  const barHeight = Math.max(8, (b.value / maxVal) * 110);

                  return (
                    <View key={`b-${idx}`} style={s.chartBarWrapper}>
                      <Text style={[s.tooltipText, isPeak && { color: theme.amber, fontWeight: '800' }]}>
                        {b.value > 0 ? b.value : ''}
                      </Text>
                      <View
                        style={[
                          s.chartBar,
                          {
                            height: barHeight,
                            backgroundColor: isPeak ? theme.amber : theme.primary,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          s.chartDayLabel,
                          isPeak && { color: theme.amber, fontWeight: '800' },
                        ]}
                      >
                        {b.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Per-Trip Breakdown */}
          <Text style={s.sectionTitle}>
            Trips Breakdown ({data.per_trip.length})
          </Text>
          <View style={s.breakdownCard}>
            {data.per_trip.length === 0 ? (
              <Text style={s.emptyBreakdownText}>No trips recorded in this period.</Text>
            ) : (
              data.per_trip.map((item, idx) => (
                <View key={`trip-${item.trip_id ?? idx}`}>
                  <TouchableOpacity
                    onPress={() => router.push(`/trip/${item.trip_id}` as any)}
                    style={s.breakdownRow}
                    activeOpacity={0.8}
                  >
                    <View style={s.tripInfo}>
                      <IconSymbol name="map.fill" size={16} color={theme.emerald} />
                      <View>
                        <Text style={s.tripText}>Trip #{item.trip_id}</Text>
                        <Text style={s.tripTimeSub}>
                          {formatTimeOnly(item.started_at)}
                          {item.ended_at ? ` – ${formatTimeOnly(item.ended_at)}` : ' · Ongoing'}
                        </Text>
                      </View>
                    </View>
                    <View style={s.passengerCountBadge}>
                      <Text style={s.passengerCountText}>
                        {item.boardings_estimate ?? 0} Pax (Est.)
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {idx < data.per_trip.length - 1 && <View style={s.divider} />}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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

    rangeRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: theme.bg,
    },
    rangeChip: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    rangeText: { fontSize: 11, fontWeight: '700', color: theme.textSecondary },

    content: { padding: 20, paddingBottom: 100, gap: 20 },

    summaryCard: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      justifyContent: 'space-between',
    },
    statCol: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 10, color: theme.textSecondary, marginBottom: 4, textTransform: 'uppercase', fontWeight: '700' },
    statValue: { fontSize: 22, fontWeight: '800', color: theme.textPrimary },
    statCapacity: { fontSize: 13, color: theme.textSecondary, fontWeight: '600' },
    statSub: { fontSize: 10, color: theme.textSecondary, marginTop: 2 },
    verticalDivider: { width: 1, backgroundColor: theme.cardBorder },

    chartCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    chartTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
    chartSubtitle: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
    peakBadge: {
      backgroundColor: theme.amberSoft,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    peakBadgeText: { fontSize: 9.5, fontWeight: '800', color: theme.amber },

    chartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 160,
      paddingHorizontal: 6,
      gap: 12,
    },
    chartBarWrapper: { alignItems: 'center', gap: 6, minWidth: 26 },
    tooltipText: { fontSize: 9.5, color: theme.textSecondary, fontWeight: '600', height: 14 },
    chartBar: {
      width: 14,
      borderRadius: 7,
    },
    chartDayLabel: { fontSize: 10, color: theme.textSecondary },

    sectionTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
    breakdownCard: {
      backgroundColor: theme.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 16,
    },
    emptyBreakdownText: { fontSize: 12, color: theme.textSecondary, textAlign: 'center', paddingVertical: 12 },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    tripInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    tripText: { fontSize: 13, color: theme.textPrimary, fontWeight: '700' },
    tripTimeSub: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
    passengerCountBadge: {
      backgroundColor: theme.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    passengerCountText: { fontSize: 12, fontWeight: '700', color: theme.primary },
    divider: { height: 1, backgroundColor: theme.cardBorder },
  });
