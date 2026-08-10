import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
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
          <Text style={s.headerTitle}>Trip Details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.mapPlaceholder}>
          <IconSymbol name="map.fill" size={48} color={theme.textSecondary} />
          <Text style={s.mapText}>Map Route Preview</Text>
        </View>

        <View style={s.tripSummary}>
          <Text style={s.routeTitle}>Nairobi - Mombasa</Text>
          <View style={s.statusBadge}>
            <Text style={s.statusText}>ONGOING</Text>
          </View>
        </View>

        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Distance</Text>
            <Text style={s.statValue}>230 km</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Duration</Text>
            <Text style={s.statValue}>3h 45m</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Revenue</Text>
            <Text style={[s.statValue, { color: theme.primary }]}>KES 4.5k</Text>
          </View>
        </View>

        {/* Info List */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Details</Text>
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Vehicle</Text>
              <Text style={s.infoValue}>KXX 000X</Text>
            </View>
            <View style={s.divider} />
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Driver</Text>
              <Text style={s.infoValue}>Driver One</Text>
            </View>
            <View style={s.divider} />
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Passengers</Text>
              <Text style={s.infoValue}>12 / 14</Text>
            </View>
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
  
  content: { padding: 20, paddingBottom: 100 },
  
  mapPlaceholder: {
    height: 180,
    backgroundColor: theme.mode === 'dark' ? '#1A1A1A' : '#E9ECEF',
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  mapText: { color: theme.textSecondary, marginTop: 8, fontWeight: '600' },
  
  tripSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  routeTitle: { fontSize: 22, fontWeight: '800', color: theme.textPrimary },
  statusBadge: {
    backgroundColor: theme.amberSoft,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800', color: theme.amber },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  statLabel: { fontSize: 12, color: theme.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },
  infoCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1, borderColor: theme.cardBorder,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 14, color: theme.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  divider: { height: 1, backgroundColor: theme.cardBorder, marginVertical: 4 },
});
