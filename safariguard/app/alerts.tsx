import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AlertCard } from "@/components/ui/alert-card";
import { IconSymbol } from "@/components/ui/icon-symbol";

// ---- Placeholder data (replace with real API / store data) ----
export type Alert = {
  id: string;
  vehicleReg: string;
  driverName: string;
  type: 'harsh_braking' | 'speeding' | 'passenger_anomaly' | 'device_offline' | 'emergency' | 'geofence' | 'maintenance';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  location: string;
  suggestedAction: string;
  timestamp: string;
  resolved: boolean;
};

const MOCK_ALERTS: Alert[] = [];

// -----------------------------------------------------------------

const FILTERS = ['All', 'Critical', 'Warning', 'Info', 'Resolved'] as const;
type FilterType = typeof FILTERS[number];

export default function AlertsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filtered = useMemo(() => {
    return MOCK_ALERTS.filter(a => {
      if (activeFilter === 'All') return !a.resolved;
      if (activeFilter === 'Resolved') return a.resolved;
      return a.severity === activeFilter.toLowerCase() && !a.resolved;
    });
  }, [activeFilter]);

  const counts = {
    critical: MOCK_ALERTS.filter(a => a.severity === 'critical' && !a.resolved).length,
    warning: MOCK_ALERTS.filter(a => a.severity === 'warning' && !a.resolved).length,
    info: MOCK_ALERTS.filter(a => a.severity === 'info' && !a.resolved).length,
    resolved: MOCK_ALERTS.filter(a => a.resolved).length,
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Alerts Center</Text>
          <Text style={styles.subtitle}>{MOCK_ALERTS.filter(a => !a.resolved).length} active alerts</Text>
        </View>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: '#EF444433' }]}>
          <Text style={[styles.summaryCount, { color: '#EF4444' }]}>{counts.critical}</Text>
          <Text style={styles.summaryLabel}>Critical</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#F59E0B33' }]}>
          <Text style={[styles.summaryCount, { color: '#F59E0B' }]}>{counts.warning}</Text>
          <Text style={styles.summaryLabel}>Warning</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#6152FF33' }]}>
          <Text style={[styles.summaryCount, { color: '#6152FF' }]}>{counts.info}</Text>
          <Text style={styles.summaryLabel}>Info</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#10B98133' }]}>
          <Text style={[styles.summaryCount, { color: '#10B981' }]}>{counts.resolved}</Text>
          <Text style={styles.summaryLabel}>Resolved</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alerts List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <AlertCard
            alert={item}
            showTimeline
            isLast={index === filtered.length - 1}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="checkmark.circle.fill" size={48} color="#10B981" />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryCount: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterChipActive: { borderColor: '#6152FF', backgroundColor: '#6152FF11' },
  filterText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  filterTextActive: { color: '#6152FF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  emptyText: { fontSize: 14, color: '#8E8E93' },
});