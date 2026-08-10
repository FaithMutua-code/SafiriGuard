import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";

type SafetyEvent = {
  id: string;
  type: "Harsh Braking" | "Sudden Acceleration" | "Sharp Cornering";
  time: string;
  location: string;
  severity: "high" | "medium" | "low";
};

const MOCK_SAFETY_EVENTS: SafetyEvent[] = [
  { id: "1", type: "Harsh Braking", time: "Today, 10:45 AM", location: "Mombasa Road (Near Bellevue)", severity: "high" },
  { id: "2", type: "Sharp Cornering", time: "Today, 08:30 AM", location: "Ngong Road (Near Junction)", severity: "medium" },
  { id: "3", type: "Sudden Acceleration", time: "Yesterday, 04:15 PM", location: "Thika Road (Near Garden City)", severity: "low" },
];

export default function SafetyStatsScreen() {
  const { vehicleId } = useLocalSearchParams();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <IconSymbol name="arrow.left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Safety Stats</Text>
          <Text style={s.headerSubtitle}>Vehicle: KXX 000X</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Safety Score Card */}
        <View style={s.scoreCard}>
          <Text style={s.scoreLabel}>Safety Score</Text>
          <Text style={s.scoreValue}>82%</Text>
          <Text style={s.scoreDesc}>Good driving performance overall. 3 anomalies detected in the last 24h.</Text>
        </View>

        {/* Stats Grid */}
        <View style={s.grid}>
          <View style={s.gridItem}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={theme.danger} />
            <Text style={s.gridValue}>1</Text>
            <Text style={s.gridLabel}>Harsh Braking</Text>
          </View>
          <View style={s.gridItem}>
            <IconSymbol name="arrow.up.forward.circle.fill" size={20} color={theme.amber} />
            <Text style={s.gridValue}>1</Text>
            <Text style={s.gridLabel}>Sudden Accel.</Text>
          </View>
          <View style={s.gridItem}>
            <IconSymbol name="arrow.left.and.right.circle.fill" size={20} color={theme.primary} />
            <Text style={s.gridValue}>1</Text>
            <Text style={s.gridLabel}>Sharp Turns</Text>
          </View>
        </View>

        {/* Event List */}
        <Text style={s.sectionTitle}>Recent Violations</Text>
        {MOCK_SAFETY_EVENTS.map(event => (
          <View key={event.id} style={s.eventCard}>
            <View style={s.eventHeader}>
              <View style={s.eventTypeRow}>
                <View style={[s.severityDot, { 
                  backgroundColor: event.severity === "high" ? theme.danger : event.severity === "medium" ? theme.amber : theme.primary 
                }]} />
                <Text style={s.eventTypeText}>{event.type}</Text>
              </View>
              <Text style={s.eventTime}>{event.time}</Text>
            </View>
            <View style={s.eventBody}>
              <IconSymbol name="location.fill" size={12} color={theme.textSecondary} />
              <Text style={s.eventLocation}>{event.location}</Text>
            </View>
          </View>
        ))}
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
  
  scoreCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  scoreLabel: { fontSize: 14, color: theme.textSecondary, marginBottom: 4 },
  scoreValue: { fontSize: 48, fontWeight: '800', color: theme.emerald, marginBottom: 8 },
  scoreDesc: { fontSize: 12, color: theme.textSecondary, textAlign: 'center', lineHeight: 18 },
  
  grid: { flexDirection: 'row', gap: 12 },
  gridItem: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.cardBorder,
    gap: 4,
  },
  gridValue: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  gridLabel: { fontSize: 10, color: theme.textSecondary, textAlign: 'center' },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginTop: 8 },
  eventCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1, borderColor: theme.cardBorder,
    gap: 10,
  },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  eventTypeText: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  eventTime: { fontSize: 12, color: theme.textSecondary },
  eventBody: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventLocation: { fontSize: 12, color: theme.textSecondary, flex: 1 },
});
