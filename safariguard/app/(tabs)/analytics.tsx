import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { GlassCard } from "@/components/ui/glass-card";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
//import { IconSymbol } from "@/components/ui/icon-symbol";

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

const PERIODS = ['Today', 'Week', 'Month'] as const;
type Period = typeof PERIODS[number];

// ---- Placeholder data (replace with real API / store data) ----
type Driver = { id: string; name: string; safetyScore: number };
type Vehicle = { id: string; regNumber: string; passengers: number; maxCapacity: number; totalTripsToday: number };
type OccupancyPoint = { hour: string; value: number };

const MOCK_DRIVERS: Driver[] = [
  { id: "1", name: "Driver One", safetyScore: 0 },
  { id: "2", name: "Driver Two", safetyScore: 0 },
  { id: "3", name: "Driver Three", safetyScore: 0 },
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: "1", regNumber: "KXX 000X", passengers: 0, maxCapacity: 1, totalTripsToday: 0 },
  { id: "2", regNumber: "KXX 001X", passengers: 0, maxCapacity: 1, totalTripsToday: 0 },
];

const OCCUPANCY_DATA: OccupancyPoint[] = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  value: 0,
}));
// -----------------------------------------------------------------

function BarChart({ data, maxValue, theme }: { data: { label: string; value: number; color?: string }[]; maxValue: number; theme: ThemeColors }) {
  const cs = chartStyles(theme);
  return (
    <View style={cs.container}>
      {data.map((item, i) => (
        <View key={i} style={cs.barGroup}>
          <View style={cs.barWrapper}>
            <View
              style={[
                cs.bar,
                { height: Math.max(4, (item.value / maxValue) * 100), backgroundColor: item.color || theme.primary },
              ]}
            />
          </View>
          <Text style={cs.barLabel} numberOfLines={1}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function LineChart({ data, theme }: { data: { hour: string; value: number }[]; theme: ThemeColors }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartH = 80;

  return (
    <View style={{ height: chartH + 24 }}>
      <View style={{ height: chartH, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: '80%',
                height: Math.max(4, (d.value / maxVal) * chartH),
                backgroundColor: d.value >= 80 ? theme.success : d.value >= 60 ? theme.primary : theme.track,
                borderRadius: 4,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {data.filter((_, i) => i % 3 === 0).map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: theme.textSecondary }}>{d.hour}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [period, setPeriod] = useState<Period>('Today');

  const driverData = MOCK_DRIVERS.map(d => ({
    label: d.name.split(' ')[0],
    value: d.safetyScore,
    color: d.safetyScore >= 90 ? theme.success : d.safetyScore >= 75 ? theme.primary : theme.danger,
  }));

  const fleetEfficiency = MOCK_VEHICLES.length
    ? Math.round(
        MOCK_VEHICLES.reduce((sum, v) => sum + (v.maxCapacity > 0 ? v.passengers / v.maxCapacity : 0), 0) / MOCK_VEHICLES.length * 100
      )
    : 0;

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Analytics</Text>
          <View style={s.periodSelector}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[s.periodChip, period === p && s.periodChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[s.periodText, period === p && s.periodTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          {/* Fleet Efficiency Gauge */}
          <GlassCard style={s.card}>
            <Text style={s.cardTitle}>Fleet Efficiency</Text>
            <View style={s.efficiencyRow}>
              <CircularGauge
                value={fleetEfficiency}
                maxValue={100}
                size={100}
                strokeWidth={10}
                label={`${fleetEfficiency}%`}
                sublabel="efficiency"
                color={theme.primary}
              />
              <View style={s.efficiencyStats}>
                <View>
                  <Text style={s.effStatValue}>{MOCK_VEHICLES.reduce((sum, v) => sum + v.totalTripsToday, 0)}</Text>
                  <Text style={s.effStatLabel}>Total Trips Today</Text>
                </View>
                <View>
                  <Text style={s.effStatValue}>{MOCK_VEHICLES.reduce((sum, v) => sum + v.passengers, 0)}</Text>
                  <Text style={s.effStatLabel}>Active Passengers</Text>
                </View>
                <View>
                  <Text style={[s.effStatValue, { color: theme.success }]}>
                    {MOCK_DRIVERS.length
                      ? Math.round(MOCK_DRIVERS.reduce((sum, d) => sum + d.safetyScore, 0) / MOCK_DRIVERS.length)
                      : 0}
                  </Text>
                  <Text style={s.effStatLabel}>Avg Safety Score</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Occupancy Trend */}
          <GlassCard style={s.card}>
            <View style={s.chartHeader}>
              <Text style={s.cardTitle}>Passenger Demand</Text>
              <Text style={s.chartSubtitle}>Hourly occupancy %</Text>
            </View>
            <LineChart data={OCCUPANCY_DATA} theme={theme} />
            <View style={s.chartLegend}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: theme.success }]} />
                <Text style={s.legendText}>High (≥80%)</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: theme.primary }]} />
                <Text style={s.legendText}>Medium (≥60%)</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: theme.track }]} />
                <Text style={s.legendText}>Low</Text>
              </View>
            </View>
          </GlassCard>

          {/* Driver Safety Scores */}
          <GlassCard style={s.card}>
            <View style={s.chartHeader}>
              <Text style={s.cardTitle}>Driver Safety Scores</Text>
              <Text style={s.chartSubtitle}>Current scores</Text>
            </View>
            <BarChart data={driverData} maxValue={100} theme={theme} />
            <View style={s.driverScoreList}>
              {MOCK_DRIVERS.map(d => (
                <View key={d.id} style={s.driverScoreRow}>
                  <View style={s.driverAvatar}>
                    <Text style={s.driverAvatarText}>{d.name.charAt(0)}</Text>
                  </View>
                  <Text style={s.driverScoreName}>{d.name}</Text>
                  <View style={s.scoreBar}>
                    <View style={[s.scoreBarFill, {
                      width: `${d.safetyScore}%` as any,
                      backgroundColor: d.safetyScore >= 90 ? theme.success : d.safetyScore >= 75 ? theme.primary : theme.danger,
                    }]} />
                  </View>
                  <Text style={[s.scoreValue, {
                    color: d.safetyScore >= 90 ? theme.success : d.safetyScore >= 75 ? theme.primary : theme.danger,
                  }]}>{d.safetyScore}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Vehicle Occupancy */}
          <GlassCard style={s.card}>
            <View style={s.chartHeader}>
              <Text style={s.cardTitle}>Vehicle Occupancy</Text>
              <Text style={s.chartSubtitle}>Current load %</Text>
            </View>
            {MOCK_VEHICLES.map(v => {
              const pct = v.maxCapacity > 0 ? Math.round((v.passengers / v.maxCapacity) * 100) : 0;
              return (
                <View key={v.id} style={s.vehicleOccRow}>
                  <Text style={s.vehicleOccReg}>{v.regNumber}</Text>
                  <View style={s.occBarBg}>
                    <View style={[s.occBarFill, {
                      width: `${pct}%` as any,
                      backgroundColor: pct >= 80 ? theme.success : pct >= 50 ? theme.primary : theme.warning,
                    }]} />
                  </View>
                  <Text style={s.occPct}>{pct}%</Text>
                </View>
              );
            })}
          </GlassCard>

          {/* Summary Stats */}
          <GlassCard style={s.card}>
            <Text style={s.cardTitle}>Performance Summary</Text>
            <View style={s.summaryGrid}>
              {[
                { label: 'Total Trips', value: MOCK_VEHICLES.reduce((sum, v) => sum + v.totalTripsToday, 0), color: theme.primary },
                { label: 'Avg Occupancy', value: `${fleetEfficiency}%`, color: theme.success },
                { label: 'Active Alerts', value: 0, color: theme.danger },
                { label: 'Top Driver', value: '—', color: theme.accent },
              ].map(item => (
                <View key={item.label} style={s.summaryItem}>
                  <Text style={[s.summaryValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={s.summaryLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const chartStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barWrapper: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '80%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 8, color: theme.textSecondary, textAlign: 'center' },
});

const makeStyles = (theme: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  header: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: theme.textPrimary },
  periodSelector: {
    flexDirection: 'row', gap: 4, backgroundColor: theme.card,
    borderRadius: 20, padding: 4, borderWidth: 1, borderColor: theme.cardBorder,
  },
  periodChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  periodChipActive: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  periodText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
  periodTextActive: { color: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingBottom: 200 },
  card: {
    padding: 18, marginBottom: 16, borderRadius: 22,
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    shadowColor: theme.primary, shadowOpacity: theme.mode === 'dark' ? 0 : 0.06,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.textPrimary, marginBottom: 14 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chartSubtitle: { fontSize: 11, color: theme.textSecondary },
  efficiencyRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  efficiencyStats: { flex: 1, gap: 12 },
  effStatValue: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  effStatLabel: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: theme.textSecondary },
  driverScoreList: { marginTop: 14, gap: 10 },
  driverScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: { fontSize: 12, fontWeight: '700', color: theme.accent },
  driverScoreName: { fontSize: 12, color: theme.textSecondary, width: 80 },
  scoreBar: { flex: 1, height: 6, backgroundColor: theme.track, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  scoreValue: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right' },
  vehicleOccRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  vehicleOccReg: { fontSize: 11, color: theme.textSecondary, width: 72, fontFamily: 'monospace' },
  occBarBg: { flex: 1, height: 8, backgroundColor: theme.track, borderRadius: 4, overflow: 'hidden' },
  occBarFill: { height: '100%', borderRadius: 4 },
  occPct: { fontSize: 12, color: theme.textPrimary, fontWeight: '700', width: 36, textAlign: 'right' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryItem: {
    width: '46%', backgroundColor: theme.bg, borderWidth: 1,
    borderColor: theme.cardBorder, borderRadius: 16, padding: 14,
  },
  summaryValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { fontSize: 11, color: theme.textSecondary },
});