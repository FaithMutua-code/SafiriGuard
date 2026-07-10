import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { GlassCard } from "@/components/ui/glass-card";
import { CircularGauge } from "@/components/ui/circular-gauge";
//import { IconSymbol } from "@/components/ui/icon-symbol";

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

const PERIODS = ['Today', 'Week', 'Month'] as const;
type Period = typeof PERIODS[number];

// ---- Palette (matches Findora onboarding/auth screens) ----
const COLORS = {
  primary: '#4B3F8F',      // deep indigo
  primaryLight: '#6C5DD3', // lighter indigo for gradients/fills
  accent: '#FF8A65',       // warm coral
  accentSoft: '#FFE8DE',
  bg: '#F8F6FB',            // soft lavender page background
  card: '#FFFFFF',
  cardBorder: '#EDE9F7',
  textPrimary: '#2B2440',
  textSecondary: '#8B84A3',
  success: '#2ECC8F',
  warning: '#F5A623',
  danger: '#FF6B6B',
  track: '#ECE8F7',
};
// -------------------------------------------------------------

// ---- Placeholder data (replace with real API / store data) ----
type Driver = {
  id: string;
  name: string;
  safetyScore: number;
};

type Vehicle = {
  id: string;
  regNumber: string;
  passengers: number;
  maxCapacity: number;
  totalTripsToday: number;
};

type OccupancyPoint = {
  hour: string;
  value: number;
};

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

// Simple bar chart component
function BarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue: number }) {
  return (
    <View style={chartStyles.container}>
      {data.map((item, i) => (
        <View key={i} style={chartStyles.barGroup}>
          <View style={chartStyles.barWrapper}>
            <View
              style={[
                chartStyles.bar,
                {
                  height: Math.max(4, (item.value / maxValue) * 100),
                  backgroundColor: item.color || COLORS.primary,
                },
              ]}
            />
          </View>
          <Text style={chartStyles.barLabel} numberOfLines={1}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// Simple line chart component
function LineChart({ data }: { data: { hour: string; value: number }[] }) {
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
                backgroundColor: d.value >= 80 ? COLORS.success : d.value >= 60 ? COLORS.primary : COLORS.track,
                borderRadius: 4,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {data.filter((_, i) => i % 3 === 0).map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: COLORS.textSecondary }}>{d.hour}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('Today');

  const driverData = MOCK_DRIVERS.map(d => ({
    label: d.name.split(' ')[0],
    value: d.safetyScore,
    color: d.safetyScore >= 90 ? COLORS.success : d.safetyScore >= 75 ? COLORS.primary : COLORS.danger,
  }));

  const fleetEfficiency = MOCK_VEHICLES.length
    ? Math.round(
        MOCK_VEHICLES.reduce((sum, v) => sum + (v.maxCapacity > 0 ? v.passengers / v.maxCapacity : 0), 0) / MOCK_VEHICLES.length * 100
      )
    : 0;

  return (
    <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.periodSelector}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodChip, period === p && styles.periodChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Fleet Efficiency Gauge */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Fleet Efficiency</Text>
          <View style={styles.efficiencyRow}>
            <CircularGauge
              value={fleetEfficiency}
              maxValue={100}
              size={100}
              strokeWidth={10}
              label={`${fleetEfficiency}%`}
              sublabel="efficiency"
              color={COLORS.primary}
            />
            <View style={styles.efficiencyStats}>
              <View style={styles.effStat}>
                <Text style={styles.effStatValue}>{MOCK_VEHICLES.reduce((s, v) => s + v.totalTripsToday, 0)}</Text>
                <Text style={styles.effStatLabel}>Total Trips Today</Text>
              </View>
              <View style={styles.effStat}>
                <Text style={styles.effStatValue}>{MOCK_VEHICLES.reduce((s, v) => s + v.passengers, 0)}</Text>
                <Text style={styles.effStatLabel}>Active Passengers</Text>
              </View>
              <View style={styles.effStat}>
                <Text style={[styles.effStatValue, { color: COLORS.success }]}>
                  {MOCK_DRIVERS.length
                    ? Math.round(MOCK_DRIVERS.reduce((s, d) => s + d.safetyScore, 0) / MOCK_DRIVERS.length)
                    : 0}
                </Text>
                <Text style={styles.effStatLabel}>Avg Safety Score</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Occupancy Trend */}
        <GlassCard style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Passenger Demand</Text>
            <Text style={styles.chartSubtitle}>Hourly occupancy %</Text>
          </View>
          <LineChart data={OCCUPANCY_DATA} />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>High (≥80%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Medium (≥60%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.track }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
          </View>
        </GlassCard>

        {/* Driver Safety Scores */}
        <GlassCard style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Driver Safety Scores</Text>
            <Text style={styles.chartSubtitle}>Current scores</Text>
          </View>
          <BarChart data={driverData} maxValue={100} />
          <View style={styles.driverScoreList}>
            {MOCK_DRIVERS.map(d => (
              <View key={d.id} style={styles.driverScoreRow}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>{d.name.charAt(0)}</Text>
                </View>
                <Text style={styles.driverScoreName}>{d.name}</Text>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, {
                    width: `${d.safetyScore}%` as any,
                    backgroundColor: d.safetyScore >= 90 ? COLORS.success : d.safetyScore >= 75 ? COLORS.primary : COLORS.danger,
                  }]} />
                </View>
                <Text style={[styles.scoreValue, {
                  color: d.safetyScore >= 90 ? COLORS.success : d.safetyScore >= 75 ? COLORS.primary : COLORS.danger,
                }]}>{d.safetyScore}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Vehicle Occupancy */}
        <GlassCard style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Vehicle Occupancy</Text>
            <Text style={styles.chartSubtitle}>Current load %</Text>
          </View>
          {MOCK_VEHICLES.map(v => {
            const pct = v.maxCapacity > 0 ? Math.round((v.passengers / v.maxCapacity) * 100) : 0;
            return (
              <View key={v.id} style={styles.vehicleOccRow}>
                <Text style={styles.vehicleOccReg}>{v.regNumber}</Text>
                <View style={styles.occBarBg}>
                  <View style={[styles.occBarFill, {
                    width: `${pct}%` as any,
                    backgroundColor: pct >= 80 ? COLORS.success : pct >= 50 ? COLORS.primary : COLORS.warning,
                  }]} />
                </View>
                <Text style={styles.occPct}>{pct}%</Text>
              </View>
            );
          })}
        </GlassCard>

        {/* Summary Stats */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Performance Summary</Text>
          <View style={styles.summaryGrid}>
            {[
              { label: 'Total Trips', value: MOCK_VEHICLES.reduce((s, v) => s + v.totalTripsToday, 0), color: COLORS.primary },
              { label: 'Avg Occupancy', value: `${fleetEfficiency}%`, color: COLORS.success },
              { label: 'Active Alerts', value: 0, color: COLORS.danger },
              { label: 'Top Driver', value: '—', color: COLORS.accent },
            ].map(item => (
              <View key={item.label} style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </ScrollView>
    </ScreenContainer>
  );
}

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barWrapper: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '80%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 8, color: COLORS.textSecondary, textAlign: 'center' },
});

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  periodSelector: {
    flexDirection: 'row', gap: 4, backgroundColor: COLORS.card,
    borderRadius: 20, padding: 4, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  periodChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  periodText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  periodTextActive: { color: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chartSubtitle: { fontSize: 11, color: COLORS.textSecondary },
  efficiencyRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  efficiencyStats: { flex: 1, gap: 12 },
  effStat: {},
  effStatValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  effStatLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.textSecondary },
  driverScoreList: { marginTop: 14, gap: 10 },
  driverScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },
  driverScoreName: { fontSize: 12, color: COLORS.textSecondary, width: 80 },
  scoreBar: { flex: 1, height: 6, backgroundColor: COLORS.track, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  scoreValue: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right' },
  vehicleOccRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  vehicleOccReg: { fontSize: 11, color: COLORS.textSecondary, width: 72, fontFamily: 'monospace' },
  occBarBg: { flex: 1, height: 8, backgroundColor: COLORS.track, borderRadius: 4, overflow: 'hidden' },
  occBarFill: { height: '100%', borderRadius: 4 },
  occPct: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '700', width: 36, textAlign: 'right' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryItem: {
    width: '46%', backgroundColor: COLORS.bg, borderWidth: 1,
    borderColor: COLORS.cardBorder, borderRadius: 16, padding: 14,
  },
  summaryValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary },
});