import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { registerPushNotificationsAsync } from "@/lib/pushNotifications";
import { ScreenContainer } from "@/components/screen-container";
import { AlertCard } from "@/components/ui/alert-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerAlerts, useResolveAlert } from "@/hooks/useOwnerData";
import { Skeleton, ErrorState, EmptyState, UpdatedBadge } from "@/components/ui/state-views";

const FILTERS = ['All', 'Critical', 'Warning', 'Info', 'Resolved'] as const;
type FilterType = typeof FILTERS[number];

export default function AlertsScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const isResolvedView = activeFilter === 'Resolved';
  const {
    data: alertsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerAlerts(isResolvedView ? 'resolved' : 'active');

  const resolveMutation = useResolveAlert();

  // Register push token with backend on mount
  useEffect(() => {
    registerPushNotificationsAsync();
  }, []);

  const alerts = useMemo(() => alertsData?.data ?? [], [alertsData]);

  const handleFilterChange = (f: FilterType) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setActiveFilter(f);
  };

  const onRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    refetch();
  };

  const handleResolve = async (id: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setResolvingId(id);
    try {
      await resolveMutation.mutateAsync(id);
    } catch {}
    setResolvingId(null);
  };

  const filtered = useMemo(() => {
    if (activeFilter === 'All' || activeFilter === 'Resolved') {
      return alerts;
    }
    return alerts.filter(a => a.severity.toLowerCase() === activeFilter.toLowerCase());
  }, [alerts, activeFilter]);

  const counts = useMemo(() => {
    return {
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      total: alerts.length,
    };
  }, [alerts]);

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton} activeOpacity={0.8}>
            <IconSymbol name="arrow.left" size={18} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Alerts Center</Text>
            <Text style={s.subtitle}>
              {counts.total} {isResolvedView ? 'resolved alerts' : 'active alerts'}
            </Text>
          </View>
          <UpdatedBadge
            updatedAt={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
            isFetching={isFetching}
          />
        </View>

        {/* Summary Row */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { borderColor: theme.danger + '33' }]}>
            <Text style={[s.summaryCount, { color: theme.danger }]}>{counts.critical}</Text>
            <Text style={s.summaryLabel}>Critical</Text>
          </View>
          <View style={[s.summaryCard, { borderColor: theme.amber + '33' }]}>
            <Text style={[s.summaryCount, { color: theme.amber }]}>{counts.warning}</Text>
            <Text style={s.summaryLabel}>Warning</Text>
          </View>
          <View style={[s.summaryCard, { borderColor: theme.electric + '33' }]}>
            <Text style={[s.summaryCount, { color: theme.electric }]}>{counts.info}</Text>
            <Text style={s.summaryLabel}>Info</Text>
          </View>
          <TouchableOpacity
            style={[
              s.summaryCard,
              { borderColor: theme.emerald + '33' },
              isResolvedView && { backgroundColor: theme.emeraldSoft },
            ]}
            onPress={() => handleFilterChange(isResolvedView ? 'All' : 'Resolved')}
          >
            <Text style={[s.summaryCount, { color: theme.emerald }]}>
              {isResolvedView ? counts.total : '✓'}
            </Text>
            <Text style={s.summaryLabel}>{isResolvedView ? 'Viewing' : 'History'}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={s.filtersRow}>
          {FILTERS.map(f => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => handleFilterChange(f)}
                activeOpacity={0.8}
                style={[s.filterChip, isSelected && s.filterChipActive]}
              >
                <Text style={[s.filterText, isSelected && s.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alerts List */}
        {isLoading ? (
          <View style={{ padding: 16, gap: 12 }}>
            <Skeleton height={90} borderRadius={18} />
            <Skeleton height={90} borderRadius={18} />
            <Skeleton height={90} borderRadius={18} />
          </View>
        ) : isError ? (
          <ErrorState message={(error as any)?.message ?? "Could not load alerts"} onRetry={refetch} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            renderItem={({ item, index }) => (
              <AlertCard
                alert={item}
                showTimeline
                isLast={index === filtered.length - 1}
                onResolve={handleResolve}
                isResolving={resolvingId === item.id}
              />
            )}
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
                icon="checkmark.circle.fill"
                title="All Clear!"
                description={
                  isResolvedView
                    ? "No resolved alerts in history."
                    : "No active safety alerts for your vehicles."
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

    summaryRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 8,
      marginBottom: 10,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
    },
    summaryCount: { fontSize: 18, fontWeight: '800' },
    summaryLabel: { fontSize: 9.5, color: theme.textSecondary, marginTop: 2, fontWeight: '600' },

    filtersRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 6,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    filterChipActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primarySoft,
    },
    filterText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
    filterTextActive: { color: theme.primary, fontWeight: '700' },

    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  });