import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";

export default function PassengerStatsScreen() {
  const { vehicleId } = useLocalSearchParams();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  // Mock data for weekly trends
  const WEEKLY_DATA = [
    { day: "Mon", count: 42 },
    { day: "Tue", count: 50 },
    { day: "Wed", count: 35 },
    { day: "Thu", count: 62 },
    { day: "Fri", count: 75 },
    { day: "Sat", count: 80 },
    { day: "Sun", count: 45 },
  ];

  const maxCount = Math.max(...WEEKLY_DATA.map(d => d.count));

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Passenger Stats</Text>
          <Text style={s.headerSubtitle}>Vehicle: KXX 000X</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Summary Stats */}
        <View style={s.summaryCard}>
          <View style={s.statCol}>
            <Text style={s.statLabel}>Today's Total</Text>
            <Text style={s.statValue}>142</Text>
          </View>
          <View style={s.verticalDivider} />
          <View style={s.statCol}>
            <Text style={s.statLabel}>Avg / Trip</Text>
            <Text style={s.statValue}>12.4</Text>
          </View>
          <View style={s.verticalDivider} />
          <View style={s.statCol}>
            <Text style={s.statLabel}>Monthly Total</Text>
            <Text style={s.statValue}>3.2K</Text>
          </View>
        </View>

        {/* Weekly Trend Chart */}
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Weekly Trend (Passengers)</Text>
          <View style={s.chartContainer}>
            {WEEKLY_DATA.map((d, index) => {
              const barHeight = (d.count / maxCount) * 120;
              return (
                <View key={d.day} style={s.chartBarWrapper}>
                  <View style={s.countTooltip}>
                    <Text style={s.tooltipText}>{d.count}</Text>
                  </View>
                  <View style={[s.chartBar, { height: barHeight, backgroundColor: theme.primary }]} />
                  <Text style={s.chartDayLabel}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Trips Breakdown */}
        <Text style={s.sectionTitle}>Today's Trips Breakdown</Text>
        <View style={s.breakdownCard}>
          {[
            { trip: "Trip 3 (14:20 - 15:40)", passengers: 14, status: "completed" },
            { trip: "Trip 2 (11:00 - 12:30)", passengers: 12, status: "completed" },
            { trip: "Trip 1 (07:30 - 09:00)", passengers: 14, status: "completed" },
          ].map((item, idx) => (
            <View key={idx}>
              <View style={s.breakdownRow}>
                <View style={s.tripInfo}>
                  <IconSymbol name="map.fill" size={16} color={theme.textSecondary} />
                  <Text style={s.tripText}>{item.trip}</Text>
                </View>
                <View style={s.passengerCountBadge}>
                  <Text style={s.passengerCountText}>{item.passengers} Pax</Text>
                </View>
              </View>
              {idx < 2 && <View style={s.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.textPrimary },
  headerSubtitle: { fontSize: 12, color: theme.textSecondary },
  
  content: { padding: 20, paddingBottom: 100, gap: 20 },
  
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1, borderColor: theme.cardBorder,
    justifyContent: 'space-between',
  },
  statCol: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: theme.textSecondary, marginBottom: 4, textTransform: 'uppercase' },
  statValue: { fontSize: 22, fontWeight: '800', color: theme.textPrimary },
  verticalDivider: { width: 1, backgroundColor: theme.cardBorder },
  
  chartCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  chartTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary, marginBottom: 20 },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 10,
  },
  chartBarWrapper: { alignItems: 'center', gap: 6 },
  countTooltip: {
    backgroundColor: theme.primarySoft,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  tooltipText: { fontSize: 10, color: theme.primary, fontWeight: '700' },
  chartBar: {
    width: 14,
    borderRadius: 7,
  },
  chartDayLabel: { fontSize: 11, color: theme.textSecondary },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginTop: 8 },
  breakdownCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1, borderColor: theme.cardBorder,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10,
  },
  tripInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tripText: { fontSize: 13, color: theme.textPrimary, fontWeight: '600' },
  passengerCountBadge: {
    backgroundColor: theme.primarySoft,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  passengerCountText: { fontSize: 12, fontWeight: '700', color: theme.primary },
  divider: { height: 1, backgroundColor: theme.cardBorder },
});
