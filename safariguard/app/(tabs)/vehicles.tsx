import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { useOwnerVehicles } from "@/hooks/useOwnerData";
import { Skeleton, ErrorState, EmptyState, UpdatedBadge } from "@/components/ui/state-views";

const FILTERS = ['All', 'Active', 'Idle', 'Offline'] as const;
type FilterType = typeof FILTERS[number];

export default function FleetScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const {
    data: vehicles = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOwnerVehicles();

  const onRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    refetch();
  };

  const handleFilterChange = (filter: FilterType) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setActiveFilter(filter);
  };

  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch =
        v.number_plate.toLowerCase().includes(search.toLowerCase()) ||
        (v.route_name && v.route_name.toLowerCase().includes(search.toLowerCase())) ||
        (v.make && v.make.toLowerCase().includes(search.toLowerCase())) ||
        (v.model && v.model.toLowerCase().includes(search.toLowerCase()));

      const matchFilter =
        activeFilter === 'All' ||
        v.status.toLowerCase() === activeFilter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [vehicles, search, activeFilter]);

  const stats = useMemo(() => {
    const active = vehicles.filter(v => v.status === 'active').length;
    const idle = vehicles.filter(v => v.status === 'idle').length;
    const offline = vehicles.filter(v => v.status === 'offline').length;
    const connected = vehicles.filter(v => v.device_connected).length;

    const scoredVehicles = vehicles.filter(v => v.safety_score !== null);
    const avgSafety = scoredVehicles.length > 0
      ? Math.round(scoredVehicles.reduce((acc, v) => acc + (v.safety_score ?? 0), 0) / scoredVehicles.length)
      : (vehicles.length > 0 ? 100 : 0);

    const totalTrips = vehicles.reduce((sum, v) => sum + (v.today?.trips ?? 0), 0);

    return { active, idle, offline, connected, avgSafety, totalTrips };
  }, [vehicles]);

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
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/onboarding/add-vehicle' as any)}
              style={s.heroBadge}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={s.subtitleRow}>
            <Text style={s.heroSubtitle}>
              {vehicles.length} {vehicles.length === 1 ? 'registered vehicle' : 'registered vehicles'}
            </Text>
            <UpdatedBadge updatedAt={dataUpdatedAt ? new Date(dataUpdatedAt) : null} isFetching={isFetching} />
          </View>

          {/* KPI Grid */}
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
              <Text style={s.kpiValue}>{stats.avgSafety}</Text>
              <Text style={s.kpiLabel}>Avg Safety</Text>
            </View>

            <View style={[s.kpiTile, { borderLeftColor: theme.accent }]}>
              <View style={[s.kpiIconWrap, { backgroundColor: 'rgba(255,138,101,0.22)' }]}>
                <IconSymbol name="wifi" size={13} color="#FFFFFF" />
              </View>
              <Text style={s.kpiValue}>{stats.connected}/{vehicles.length}</Text>
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
              placeholder="Search by plate or route..."
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
              onPress={() => handleFilterChange(filter)}
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
          <Text style={s.sectionMeta}>{stats.totalTrips} trips today</Text>
        </View>

        {/* Content State */}
        {isLoading ? (
          <View style={s.loadingContainer}>
            <Skeleton height={180} borderRadius={20} style={{ marginBottom: 12 }} />
            <Skeleton height={180} borderRadius={20} style={{ marginBottom: 12 }} />
            <Skeleton height={180} borderRadius={20} />
          </View>
        ) : isError ? (
          <ErrorState message={(error as any)?.message ?? 'Could not load fleet'} onRetry={refetch} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <VehicleCard
                vehicle={item}
                onPress={() => router.push(`/vehicle/${item.id}` as any)}
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
              vehicles.length === 0 ? (
                <EmptyState
                  icon="car.fill"
                  title="No Vehicles Added Yet"
                  description="Register your first matatu to start monitoring real-time occupancy and safety."
                  actionLabel="Add Vehicle"
                  onAction={() => router.push('/onboarding/add-vehicle' as any)}
                />
              ) : (
                <View style={s.emptyContainer}>
                  <View style={s.emptyIconWrap}>
                    <IconSymbol name="car.fill" size={32} color={theme.primary} />
                  </View>
                  <Text style={s.emptyTitle}>No matching vehicles</Text>
                  <Text style={s.emptyText}>Try adjusting your search or filters</Text>
                </View>
              )
            }
          />
        )}
      </ScreenContainer>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.primary },
    hero: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
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
      position: 'absolute',
      top: -70,
      right: -50,
      width: 200,
      height: 200,
      borderRadius: 40,
      backgroundColor: 'rgba(255,138,101,0.16)',
      transform: [{ rotate: '20deg' }],
    },
    heroGlowTwo: {
      position: 'absolute',
      bottom: -60,
      left: -40,
      width: 150,
      height: 150,
      borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.06)',
      transform: [{ rotate: '-15deg' }],
    },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroEyebrow: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textOnDarkMuted,
      letterSpacing: 1.4,
      marginBottom: 4,
    },
    heroTitle: { fontSize: 27, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
    heroBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
    },
    subtitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 16,
    },
    heroSubtitle: { fontSize: 13, color: theme.textOnDarkMuted },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpiTile: {
      width: '47.5%',
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
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
      marginBottom: 8,
    },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    kpiLabel: { fontSize: 10.5, color: theme.textOnDarkMuted, marginTop: 2, fontWeight: '500' },

    searchContainer: { paddingHorizontal: 20, marginTop: -20, marginBottom: 14 },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 18,
      paddingHorizontal: 8,
      paddingRight: 16,
      height: 52,
      gap: 10,
      shadowColor: theme.primaryDeep,
      shadowOpacity: theme.mode === 'dark' ? 0 : 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      borderWidth: theme.mode === 'dark' ? 1 : 0,
      borderColor: theme.cardBorder,
    },
    searchIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchInput: { flex: 1, color: theme.textPrimary, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
    clearButton: {
      width: 22,
      height: 22,
      borderRadius: 7,
      backgroundColor: theme.track,
      alignItems: 'center',
      justifyContent: 'center',
    },

    filtersContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
    filterChip: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    filterChipActive: {
      borderColor: 'transparent',
      shadowColor: theme.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    filterChipGradient: { paddingHorizontal: 16, paddingVertical: 8 },
    filterText: {
      fontSize: 12.5,
      color: theme.textSecondary,
      fontWeight: '600',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    filterTextActive: { fontSize: 12.5, color: '#FFFFFF', fontWeight: '700' },

    sectionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 12,
      gap: 10,
    },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: theme.textSecondary, letterSpacing: 0.6 },
    sectionLine: { flex: 1, height: 1, backgroundColor: theme.cardBorder },
    sectionMeta: { fontSize: 11, fontWeight: '600', color: theme.primary },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    loadingContainer: { paddingHorizontal: 20, paddingTop: 8 },

    emptyContainer: { alignItems: 'center', paddingTop: 48, gap: 6 },
    emptyIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    emptyTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '700' },
    emptyText: { color: theme.textSecondary, fontSize: 13 },
  });