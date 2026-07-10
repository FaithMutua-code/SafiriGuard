import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { IconSymbol } from "@/components/ui/icon-symbol";

// ---- Placeholder data (replace with real API / store data) ----
export type Vehicle = {
  id: string;
  regNumber: string;
  driverName: string;
  route: string;
  status: 'active' | 'idle' | 'offline';
  passengers: number;
  maxCapacity: number;
  totalTripsToday: number;
  deviceConnected: boolean;
  safetyScore: number;
  speed: number;
  location: { address: string };
  lastUpdate: string;
};

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "1",
    regNumber: "KXX 000X",
    driverName: "Driver One",
    route: "Route A",
    status: "active",
    passengers: 0,
    maxCapacity: 1,
    totalTripsToday: 0,
    deviceConnected: true,
    safetyScore: 0,
    speed: 0,
    location: { address: "Unknown location" },
    lastUpdate: "—",
  },
  {
    id: "2",
    regNumber: "KXX 001X",
    driverName: "Driver Two",
    route: "Route B",
    status: "idle",
    passengers: 0,
    maxCapacity: 1,
    totalTripsToday: 0,
    deviceConnected: false,
    safetyScore: 0,
    speed: 0,
    location: { address: "Unknown location" },
    lastUpdate: "—",
  },
];
// -----------------------------------------------------------------

const FILTERS = ['All', 'Active', 'Idle', 'Offline'] as const;
type FilterType = typeof FILTERS[number];

export default function FleetScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filtered = useMemo(() => {
    return MOCK_VEHICLES.filter(v => {
      const matchSearch =
        v.regNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.driverName.toLowerCase().includes(search.toLowerCase()) ||
        v.route.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        activeFilter === 'All' ||
        v.status === activeFilter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  const stats = {
    active: MOCK_VEHICLES.filter(v => v.status === 'active').length,
    idle: MOCK_VEHICLES.filter(v => v.status === 'idle').length,
    offline: MOCK_VEHICLES.filter(v => v.status === 'offline').length,
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fleet Monitor</Text>
          <Text style={styles.subtitle}>{MOCK_VEHICLES.length} registered vehicles</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <View style={[styles.miniDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.miniStatText}>{stats.active}</Text>
          </View>
          <View style={styles.miniStat}>
            <View style={[styles.miniDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.miniStatText}>{stats.idle}</Text>
          </View>
          <View style={styles.miniStat}>
            <View style={[styles.miniDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.miniStatText}>{stats.offline}</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <IconSymbol name="magnifyingglass" size={16} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles, drivers, routes..."
            placeholderTextColor="#8E8E93"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <IconSymbol name="xmark" size={14} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.8}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vehicle List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push(`/vehicle/${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="car.fill" size={40} color="#E2E8F0" />
            <Text style={styles.emptyText}>No vehicles found</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  miniStatText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 10 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: { flex: 1, color: '#1E293B', fontSize: 14 },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    borderColor: '#6152FF',
    backgroundColor: '#6152FF11',
  },
  filterText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  filterTextActive: { color: '#6152FF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#8E8E93', fontSize: 15 },
});