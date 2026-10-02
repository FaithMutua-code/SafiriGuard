import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerInsights } from "@/hooks/useOwnerData";
import { Skeleton, ErrorState, UpdatedBadge } from "@/components/ui/state-views";

const RANGES = ['today', 'week', 'month'] as const;
type RangeType = typeof RANGES[number];

export default function InsightsScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [range, setRange] = useState<RangeType>('week');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerInsights(range);

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

  const totals = data?.totals;
  const insights = data?.insights ?? [];

  const avgRevPerTrip = totals && totals.trips > 0
    ? Math.round(Number(totals.revenue_estimate) / totals.trips)
    : 0;

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
          <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Revenue & Insights</Text>
          <Text style={s.headerSubtitle}>Fleet Analytics (Estimated)</Text>
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
          <Skeleton height={80} borderRadius={18} />
          <Skeleton height={140} borderRadius={20} />
          <Skeleton height={180} borderRadius={20} />
          <Skeleton height={120} borderRadius={18} />
        </View>
      ) : isError || !totals ? (
        <ErrorState
          message={(error as any)?.message ?? "Could not load insights"}
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
          {/* Warning Badge for Estimated Revenue (fixed asterisks bug with nested bold Text) */}
          <View style={s.warningCard}>
            <IconSymbol name="info.circle.fill" size={16} color={theme.amber} />
            <Text style={s.warningText}>
              All revenue metrics are <Text style={s.boldText}>estimated</Text> based on passenger boarding changes and route fare settings. This data is not intended for official accounting.
            </Text>
          </View>

          {/* Revenue Hero Card */}
          <View style={s.revenueCard}>
            <Text style={s.revLabel}>
              ESTIMATED {range.toUpperCase()} REVENUE
            </Text>
            <Text style={s.revValue}>
              KES {Number(totals.revenue_estimate).toLocaleString('en-KE', { minimumFractionDigits: 0 })}
            </Text>
            <Text style={s.revSub}>
              Based on {totals.passengers_estimate} estimated passenger boardings
            </Text>
          </View>

          {/* Operational Stats */}
          <View style={s.statsCard}>
            <Text style={s.cardTitle}>Operational Performance ({range.toUpperCase()})</Text>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Estimated Passengers</Text>
              <Text style={s.infoValue}>{totals.passengers_estimate} Pax</Text>
            </View>
            <View style={s.divider} />

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Trips Completed</Text>
              <Text style={s.infoValue}>{totals.trips} Trips</Text>
            </View>
            <View style={s.divider} />

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Distance Travelled</Text>
              <Text style={s.infoValue}>{totals.distance_km} Km</Text>
            </View>
            <View style={s.divider} />

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Est. Revenue per Trip</Text>
              <Text style={[s.infoValue, { color: theme.emerald }]}>
                KES {avgRevPerTrip.toLocaleString('en-KE')}
              </Text>
            </View>
          </View>

          {/* Data-Driven Insights Section */}
          <View style={s.aiSection}>
            <View style={s.aiTitleRow}>
              <IconSymbol name="sparkles" size={18} color={theme.amber} />
              <View>
                <Text style={s.aiTitle}>Automated Fleet Insights</Text>
                <Text style={s.aiSubtitle}>Generated from your real trip data</Text>
              </View>
            </View>

            {insights.length === 0 ? (
              <View style={s.emptyInsightsCard}>
                <IconSymbol name="chart.bar.fill" size={24} color={theme.textSecondary} />
                <Text style={s.emptyInsightsText}>
                  Not enough trips in this period to compute trends. Complete more trips to unlock insights.
                </Text>
              </View>
            ) : (
              insights.map((insight, idx) => {
                const priorityColors = {
                  high: theme.danger,
                  medium: theme.amber,
                  low: theme.electric,
                };
                const pColor = priorityColors[insight.priority] ?? theme.primary;

                return (
                  <View key={`insight-${idx}`} style={s.insightBubble}>
                    <View style={s.insightBubbleHeader}>
                      <Text style={s.insightTitle}>{insight.title}</Text>
                      <View style={[s.priorityBadge, { backgroundColor: pColor + '22' }]}>
                        <Text style={[s.priorityText, { color: pColor }]}>
                          {insight.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.insightDesc}>{insight.description}</Text>
                  </View>
                );
              })
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

    content: { padding: 20, paddingBottom: 100, gap: 18 },

    warningCard: {
      flexDirection: 'row',
      backgroundColor: theme.amberSoft,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.amber + '33',
      alignItems: 'flex-start',
      gap: 10,
    },
    warningText: {
      fontSize: 12,
      color: theme.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    boldText: {
      fontWeight: '800',
      color: theme.textPrimary,
    },

    revenueCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 22,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    revLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      marginBottom: 6,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    revValue: { fontSize: 36, fontWeight: '800', color: theme.emerald, marginBottom: 4 },
    revSub: { fontSize: 11.5, color: theme.textSecondary },

    statsCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    cardTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary, marginBottom: 14 },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 9,
    },
    infoLabel: { fontSize: 13, color: theme.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
    divider: { height: 1, backgroundColor: theme.cardBorder },

    aiSection: { gap: 12, marginTop: 4 },
    aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    aiTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
    aiSubtitle: { fontSize: 11, color: theme.textSecondary, marginTop: 1 },

    emptyInsightsCard: {
      backgroundColor: theme.card,
      padding: 20,
      borderRadius: 18,
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    emptyInsightsText: {
      fontSize: 12.5,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },

    insightBubble: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      gap: 8,
    },
    insightBubbleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    insightTitle: { fontSize: 14, fontWeight: '800', color: theme.textPrimary, flex: 1, marginRight: 8 },
    priorityBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    priorityText: { fontSize: 9.5, fontWeight: '800' },
    insightDesc: { fontSize: 12.5, color: theme.textSecondary, lineHeight: 18 },
  });
