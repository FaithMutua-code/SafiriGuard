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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { IconSymbol } from "@/components/ui/icon-symbol";

// ---- SafariGuard palette: midnight navy / glassmorphism / glow accents ----
const COLORS = {
  bg: '#0A0F1E',              // midnight navy
  bgDeep: '#050810',
  surface: '#111827',          // charcoal card base
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.09)',
  glassBorderStrong: 'rgba(255,255,255,0.14)',

  emerald: '#10E39F',
  emeraldSoft: 'rgba(16,227,159,0.14)',
  electric: '#3E8FFF',
  electricSoft: 'rgba(62,143,255,0.14)',
  amber: '#FFB648',
  amberSoft: 'rgba(255,182,72,0.14)',
  danger: '#FF5C7A',
  dangerSoft: 'rgba(255,92,122,0.14)',

  textPrimary: '#F3F6FC',
  textSecondary: '#8A92A6',
  textMuted: '#5C6478',
};
// ---------------------------------------------------------------------------

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
    connected: MOCK_VEHICLES.filter(v => v.deviceConnected).length,
  };

  const avgSafety = MOCK_VEHICLES.length
    ? Math.round(MOCK_VEHICLES.reduce((s, v) => s + v.safetyScore, 0) / MOCK_VEHICLES.length)
    : 0;

  const totalTrips = MOCK_VEHICLES.reduce((s, v) => s + v.totalTripsToday, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: COLORS.bg }}>
        {/* Hero Header */}
        <LinearGradient
          colors={[COLORS.surface, COLORS.bgDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* glow accents */}
          <View style={styles.heroGlowElectric} />
          <View style={styles.heroGlowEmerald} />

          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>LIVE FLEET STATUS</Text>
              <Text style={styles.heroTitle}>Fleet Monitor</Text>
            </View>
            <View style={styles.heroBadge}>
              <IconSymbol name="car.fill" size={18} color={COLORS.electric} />
            </View>
          </View>

          <Text style={styles.heroSubtitle}>{MOCK_VEHICLES.length} registered vehicles</Text>

          {/* KPI grid — squircle glass tiles, no circles */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiTile, { borderLeftColor: COLORS.emerald }]}>
              <View style={[styles.kpiIconWrap, { backgroundColor: COLORS.emeraldSoft }]}>
                <IconSymbol name="bolt.fill" size={13} color={COLORS.emerald} />
              </View>
              <Text style={styles.kpiValue}>{stats.active}</Text>
              <Text style={styles.kpiLabel}>Active</Text>
            </View>

            <View style={[styles.kpiTile, { borderLeftColor: COLORS.amber }]}>
              <View style={[styles.kpiIconWrap, { backgroundColor: COLORS.amberSoft }]}>
                <IconSymbol name="clock.fill" size={13} color={COLORS.amber} />
              </View>
              <Text style={styles.kpiValue}>{stats.idle}</Text>
              <Text style={styles.kpiLabel}>Idle</Text>
            </View>

            <View style={[styles.kpiTile, { borderLeftColor: COLORS.electric }]}>
              <View style={[styles.kpiIconWrap, { backgroundColor: COLORS.electricSoft }]}>
                <IconSymbol name="shield.fill" size={13} color={COLORS.electric} />
              </View>
              <Text style={styles.kpiValue}>{avgSafety}</Text>
              <Text style={styles.kpiLabel}>Avg Safety</Text>
            </View>

            <View style={[styles.kpiTile, { borderLeftColor: COLORS.danger }]}>
              <View style={[styles.kpiIconWrap, { backgroundColor: COLORS.dangerSoft }]}>
                <IconSymbol name="wifi" size={13} color={COLORS.danger} />
              </View>
              <Text style={styles.kpiValue}>{stats.connected}/{MOCK_VEHICLES.length}</Text>
              <Text style={styles.kpiLabel}>Devices</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search — floats over hero edge */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <View style={styles.searchIconWrap}>
              <IconSymbol name="magnifyingglass" size={15} color={COLORS.electric} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search vehicles, drivers, routes..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
                <IconSymbol name="xmark" size={12} color={COLORS.textSecondary} />
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
              activeOpacity={0.85}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
            >
              {activeFilter === filter ? (
                <LinearGradient
                  colors={[COLORS.electric, '#2D6FE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.filterChipGradient}
                >
                  <Text style={styles.filterTextActive}>{filter}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterText}>{filter}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Section label */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>
            {filtered.length} {filtered.length === 1 ? 'VEHICLE' : 'VEHICLES'}
          </Text>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionMeta}>{totalTrips} trips today</Text>
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
              <View style={styles.emptyIconWrap}>
                <IconSymbol name="car.fill" size={32} color={COLORS.electric} />
              </View>
              <Text style={styles.emptyTitle}>No vehicles found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },

  // --- Hero header ---
  hero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  heroGlowElectric: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 40, // soft square glow, not a circle
    backgroundColor: 'rgba(62,143,255,0.16)',
    transform: [{ rotate: '20deg' }],
  },
  heroGlowEmerald: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 32,
    backgroundColor: 'rgba(16,227,159,0.10)',
    transform: [{ rotate: '-15deg' }],
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.electric,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.electricSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorderStrong,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },

  // --- KPI grid (squircle glass tiles) ---
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiTile: {
    width: '47.5%',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderLeftWidth: 3,
    borderRadius: 16,
    padding: 12,
  },
  kpiIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  kpiLabel: { fontSize: 10.5, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

  // --- Search (floats over hero edge) ---
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorderStrong,
    paddingHorizontal: 8,
    paddingRight: 16,
    height: 54,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  searchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.electricSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14.5, fontWeight: '500' },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Filters ---
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  filterChipActive: {
    borderColor: 'transparent',
    shadowColor: COLORS.electric,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  filterChipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterTextActive: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },

  // --- Section label ---
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.glassBorder,
  },
  sectionMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.electric,
  },

  // --- List / empty state ---
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 56, gap: 6 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.electricSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorderStrong,
  },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  emptyText: { color: COLORS.textSecondary, fontSize: 13 },
});