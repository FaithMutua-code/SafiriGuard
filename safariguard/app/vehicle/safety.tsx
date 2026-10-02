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
import { useOwnerSafety } from "@/hooks/useOwnerData";
import { formatRelativeTime } from "@/lib/dateUtils";
import { Skeleton, ErrorState, UpdatedBadge } from "@/components/ui/state-views";

const RANGES = ['today', 'week', 'month'] as const;
type RangeType = typeof RANGES[number];

export default function SafetyStatsScreen() {
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
  } = useOwnerSafety(vehicleId, range);

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

  const events = data?.events ?? [];
  const score = data?.score;

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
          <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Safety Stats</Text>
          <Text style={s.headerSubtitle}>Vehicle #{vehicleId} · Driving Events</Text>
        </View>
        <UpdatedBadge
          updatedAt={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
          isFetching={isFetching}
        />
      </View>

      {/* Range Filter */}
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
          <Skeleton height={140} borderRadius={20} />
          <Skeleton height={100} borderRadius={18} />
          <Skeleton height={180} borderRadius={18} />
        </View>
      ) : isError || !data ? (
        <ErrorState
          message={(error as any)?.message ?? "Could not load safety analytics"}
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
          {/* Safety Score Card */}
          <View style={s.scoreCard}>
            <Text style={s.scoreLabel}>SAFETY SCORE</Text>
            <Text
              style={[
                s.scoreValue,
                {
                  color:
                    score == null
                      ? theme.textSecondary
                      : score >= 80
                      ? theme.emerald
                      : score >= 60
                      ? theme.amber
                      : theme.danger,
                },
              ]}
            >
              {score != null ? `${score}%` : '—'}
            </Text>
            <Text style={s.scoreDesc}>
              {score != null
                ? score >= 85
                  ? 'Excellent driving safety. Very low event frequency relative to distance.'
                  : score >= 70
                  ? 'Fair driving safety. Occasional events detected on this corridor.'
                  : 'Needs attention. High severity events recorded.'
                : 'No distance completed yet in this period to compute score.'}
            </Text>
          </View>

          {/* Counts Grid */}
          <View style={s.grid}>
            <View style={s.gridItem}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={theme.danger} />
              <Text style={s.gridValue}>{data.counts?.harsh_braking ?? 0}</Text>
              <Text style={s.gridLabel}>Harsh Braking</Text>
            </View>

            <View style={s.gridItem}>
              <IconSymbol name="arrow.up.forward.circle.fill" size={20} color={theme.amber} />
              <Text style={s.gridValue}>{data.counts?.sudden_acceleration ?? 0}</Text>
              <Text style={s.gridLabel}>Sudden Accel.</Text>
            </View>

            <View style={s.gridItem}>
              <IconSymbol name="arrow.left.and.right.circle.fill" size={20} color={theme.electric} />
              <Text style={s.gridValue}>{data.counts?.sharp_cornering ?? 0}</Text>
              <Text style={s.gridLabel}>Sharp Turns</Text>
            </View>
          </View>

          {/* Event List */}
          <Text style={s.sectionTitle}>
            Detected Driving Events ({events.length})
          </Text>

          {events.length === 0 ? (
            <View style={s.cleanCard}>
              <IconSymbol name="checkmark.shield.fill" size={32} color={theme.emerald} />
              <Text style={s.cleanTitle}>Clean Record</Text>
              <Text style={s.cleanSubtitle}>
                No driving events detected during this period.
              </Text>
            </View>
          ) : (
            events.map((event, idx) => {
              const sevColors = {
                1: theme.electric,
                2: theme.amber,
                3: theme.danger,
              };
              const sevColor = sevColors[event.severity as 1 | 2 | 3] ?? theme.danger;

              return (
                <View key={`event-${event.id ?? idx}`} style={s.eventCard}>
                  <View style={s.eventHeader}>
                    <View style={s.eventTypeRow}>
                      <View style={[s.severityDot, { backgroundColor: sevColor }]} />
                      <Text style={s.eventTypeText}>
                        {event.type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={s.eventTime}>{formatRelativeTime(event.recorded_at)}</Text>
                  </View>

                  <View style={s.eventBody}>
                    <IconSymbol name="location.fill" size={12} color={theme.textSecondary} />
                    <Text style={s.eventLocation}>
                      {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
                    </Text>

                    <TouchableOpacity
                      onPress={() => router.push(`/gps?vehicleId=${vehicleId}` as any)}
                      style={s.viewMapAction}
                      activeOpacity={0.8}
                    >
                      <Text style={s.viewMapText}>View on map</Text>
                      <IconSymbol name="chevron.right" size={11} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
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

    content: { padding: 20, paddingBottom: 100, gap: 18 },

    scoreCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 22,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    scoreLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      marginBottom: 4,
      letterSpacing: 1,
    },
    scoreValue: { fontSize: 48, fontWeight: '800', marginBottom: 6 },
    scoreDesc: { fontSize: 12, color: theme.textSecondary, textAlign: 'center', lineHeight: 18, maxWidth: 280 },

    grid: { flexDirection: 'row', gap: 10 },
    gridItem: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorder,
      gap: 4,
    },
    gridValue: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
    gridLabel: { fontSize: 10, color: theme.textSecondary, textAlign: 'center', fontWeight: '500' },

    sectionTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },

    cleanCard: {
      backgroundColor: theme.emeraldSoft,
      padding: 24,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.emerald + '33',
    },
    cleanTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
    cleanSubtitle: { fontSize: 12, color: theme.textSecondary, textAlign: 'center' },

    eventCard: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      gap: 10,
    },
    eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    eventTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    severityDot: { width: 8, height: 8, borderRadius: 4 },
    eventTypeText: { fontSize: 13, fontWeight: '800', color: theme.textPrimary },
    eventTime: { fontSize: 11, color: theme.textSecondary },

    eventBody: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
    },
    eventLocation: { fontSize: 11, color: theme.textSecondary, fontFamily: 'monospace', flex: 1 },
    viewMapAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewMapText: { fontSize: 11.5, color: theme.primary, fontWeight: '700' },
  });
