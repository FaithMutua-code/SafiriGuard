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
import { useTheme, ThemeColors } from "@/context/ThemeContext";

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
  const { theme } = useTheme();
  const s = makeStyles(theme);
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
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        {/* Hero Header */}
        <LinearGradient
          colors={[theme.primary, theme.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroGlowOne} />
          <View style={s.heroGlowTwo} />

          <View style={s.heroTopRow}>
            <View>
              <Text style={s.heroEyebrow}>LIVE FLEET STATUS</Text>
              <Text style={s.heroTitle}>Fleet Monitor</Text>
            </View>
            <View style={s.heroBadge}>
              <IconSymbol name="car.fill" size={18} color="#FFFFFF" />
            </View>
          </View>

          <Text style={s.heroSubtitle}>{MOCK_VEHICLES.length} registered vehicles</Text>

          <View style={s.kpiGrid}>
            <View style={[s.kpiTile, { borderLeftColor: theme.emerald }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(46,204,143,0.22)' }]}>
                <IconSymbol name="bolt.fill" size={13} color="#FFFFFF" />
              </View>
              <Text style={s.kpiValue}>{stats.active}</Text>
              <Text style={s.kpiLabel}>Active</Text>
            </View>

            <View style={[s.kpiTile, { borderLeftColor: theme.amber }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(245,166,35,0.22)' }]}>
                <IconSymbol name="clock.fill" size={13} color="#FFFFFF" />
              </View>
              <Text style={s.kpiValue}>{stats.idle}</Text>
              <Text style={s.kpiLabel}>Idle</Text>
            </View>

            <View style={[s.kpiTile, { borderLeftColor: theme.electric }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(62,143,255,0.22)' }]}>
                <IconSymbol name="shield.fill" size={13} color="#FFFFFF" />
              </View>
              <Text style={s.kpiValue}>{avgSafety}</Text>
              <Text style={s.kpiLabel}>Avg Safety</Text>
            </View>

            <View style={[s.kpiTile, { borderLeftColor: theme.accent }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(255,138,101,0.22)' }]}>
                <IconSymbol name="wifi" size={13} color="#FFFFFF" />
              </View>
              <Text style={s.kpiValue}>{stats.connected}/{MOCK_VEHICLES.length}</Text>
              <Text style={s.kpiLabel}>Devices</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search */}
        <View style={s.searchContainer}>
          <View style={s.searchWrapper}>
            <View style={s.searchIconWrap}>
              <IconSymbol name="magnifyingglass" size={15} color={theme.primary} />
            </View>
            <TextInput
              style={s.searchInput}
              placeholder="Search vehicles, drivers, routes..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={s.clearButton}>
                <IconSymbol name="xmark" size={12} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={s.filtersContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.85}
              style={[s.filterChip, activeFilter === filter && s.filterChipActive]}
            >
              {activeFilter === filter ? (
                <LinearGradient
                  colors={[theme.primaryLight, theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.filterChipGradient}
                >
                  <Text style={s.filterTextActive}>{filter}</Text>
                </LinearGradient>
              ) : (
                <Text style={s.filterText}>{filter}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Section label */}
        <View style={s.sectionLabelRow}>
          <Text style={s.sectionLabel}>
            {filtered.length} {filtered.length === 1 ? 'VEHICLE' : 'VEHICLES'}
          </Text>
          <View style={s.sectionLine} />
          <Text style={s.sectionMeta}>{totalTrips} trips today</Text>
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
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <View style={s.emptyIconWrap}>
                <IconSymbol name="car.fill" size={32} color={theme.primary} />
              </View>
              <Text style={s.emptyTitle}>No vehicles found</Text>
              <Text style={s.emptyText}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      </ScreenContainer>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.primary },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: theme.primaryDeep,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroGlowOne: {
    position: 'absolute', top: -70, right: -50, width: 200, height: 200,
    borderRadius: 40, backgroundColor: 'rgba(255,138,101,0.16)', transform: [{ rotate: '20deg' }],
  },
  heroGlowTwo: {
    position: 'absolute', bottom: -60, left: -40, width: 150, height: 150,
    borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ rotate: '-15deg' }],
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroEyebrow: { fontSize: 11, fontWeight: '700', color: theme.textOnDarkMuted, letterSpacing: 1.4, marginBottom: 4 },
  heroTitle: { fontSize: 27, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  heroBadge: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroSubtitle: { fontSize: 13, color: theme.textOnDarkMuted, marginTop: 6, marginBottom: 20 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiTile: {
    width: '47.5%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderLeftWidth: 3,
    borderRadius: 16, padding: 12,
  },
  kpiIconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  kpiLabel: { fontSize: 10.5, color: theme.textOnDarkMuted, marginTop: 2, fontWeight: '500' },

  searchContainer: { paddingHorizontal: 20, marginTop: -20, marginBottom: 16 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card,
    borderRadius: 18, paddingHorizontal: 8, paddingRight: 16, height: 54, gap: 10,
    shadowColor: theme.primaryDeep, shadowOpacity: theme.mode === 'dark' ? 0 : 0.15,
    shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6,
    borderWidth: theme.mode === 'dark' ? 1 : 0, borderColor: theme.cardBorder,
  },
  searchIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, color: theme.textPrimary, fontSize: 14.5, fontWeight: '500' },
  clearButton: { width: 22, height: 22, borderRadius: 7, backgroundColor: theme.track, alignItems: 'center', justifyContent: 'center' },

  filtersContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 18 },
  filterChip: { borderRadius: 12, overflow: 'hidden', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder },
  filterChipActive: {
    borderColor: 'transparent', shadowColor: theme.primary, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  filterChipGradient: { paddingHorizontal: 16, paddingVertical: 9 },
  filterText: { fontSize: 13, color: theme.textSecondary, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 9 },
  filterTextActive: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: theme.textSecondary, letterSpacing: 0.6 },
  sectionLine: { flex: 1, height: 1, backgroundColor: theme.cardBorder },
  sectionMeta: { fontSize: 11, fontWeight: '600', color: theme.primary },

  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 56, gap: 6 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: theme.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '700' },
  emptyText: { color: theme.textSecondary, fontSize: 13 },
});