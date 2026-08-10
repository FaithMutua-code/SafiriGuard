import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";

export default function InsightsScreen() {
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
          <Text style={s.headerTitle}>Revenue & Insights</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Warning Badge for Estimated Revenue */}
        <View style={s.warningCard}>
          <IconSymbol name="info.circle.fill" size={16} color={theme.amber} />
          <Text style={s.warningText}>
            All revenue metrics are **estimated** based on passenger counts and route averages. This data is not intended for official accounting.
          </Text>
        </View>

        {/* Daily Summary */}
        <View style={s.revenueCard}>
          <Text style={s.revLabel}>Estimated Today's Revenue</Text>
          <Text style={s.revValue}>KES 14,250</Text>
          <Text style={s.revSub}>Across 2 active vehicles</Text>
        </View>

        {/* Operational Stats */}
        <View style={s.statsCard}>
          <Text style={s.cardTitle}>Operational Performance</Text>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Total Passengers Today</Text>
            <Text style={s.infoValue}>95 Pax</Text>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Trips Completed</Text>
            <Text style={s.infoValue}>6 Trips</Text>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Distance Travelled</Text>
            <Text style={s.infoValue}>420 Km</Text>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Est. Revenue per Trip</Text>
            <Text style={s.infoValue}>KES 2,375</Text>
          </View>
        </View>

        {/* AI Insights Section */}
        <View style={s.aiSection}>
          <View style={s.aiTitleRow}>
            <IconSymbol name="sparkles" size={18} color={theme.amber} />
            <Text style={s.aiTitle}>AI Performance Insights</Text>
          </View>

          <View style={s.insightBubble}>
            <Text style={s.insightTitle}>💡 Route Efficiency Opportunity</Text>
            <Text style={s.insightDesc}>
              Vehicle KXX 000X completed Trip 2 with a full passenger load 15 minutes faster than average. Consider prioritizing this corridor during peak hours (16:00 - 18:00).
            </Text>
          </View>

          <View style={s.insightBubble}>
            <Text style={s.insightTitle}>⚠️ Safety Alert Pattern</Text>
            <Text style={s.insightDesc}>
              Unsafe driving alerts (harsh braking) have spiked on the Ngong Road route today. A driver coaching review is recommended for vehicle KXX 001X.
            </Text>
          </View>
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
  
  content: { padding: 20, paddingBottom: 100, gap: 20 },
  
  warningCard: {
    flexDirection: 'row',
    backgroundColor: theme.amberSoft,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1, borderColor: theme.amber + '33',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningText: { fontSize: 12, color: theme.textSecondary, flex: 1, lineHeight: 18 },
  
  revenueCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  revLabel: { fontSize: 12, color: theme.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  revValue: { fontSize: 36, fontWeight: '800', color: theme.emerald, marginBottom: 6 },
  revSub: { fontSize: 12, color: theme.textSecondary },
  
  statsCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 13, color: theme.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  divider: { height: 1, backgroundColor: theme.cardBorder },
  
  aiSection: { gap: 12, marginTop: 8 },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  aiTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  insightBubble: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1, borderColor: theme.cardBorder,
    gap: 6,
  },
  insightTitle: { fontSize: 13, fontWeight: '700', color: theme.textPrimary },
  insightDesc: { fontSize: 12, color: theme.textSecondary, lineHeight: 18 },
});
