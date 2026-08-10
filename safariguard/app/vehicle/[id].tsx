import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";

export default function VehicleDetailScreen() {
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
          <Text style={s.headerTitle}>Vehicle Details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.heroCard}>
          <View style={s.heroIcon}>
            <IconSymbol name="car.fill" size={32} color={theme.primary} />
          </View>
          <Text style={s.regNum}>KXX 000X</Text>
          <Text style={s.model}>Toyota Hiace - 14 Seater</Text>
          <View style={s.statusBadge}>
            <Text style={s.statusText}>ACTIVE</Text>
          </View>
        </View>

        <View style={s.actionGrid}>
          <TouchableOpacity 
            style={[s.actionBtn, { backgroundColor: theme.emeraldSoft }]} 
            onPress={() => router.push(`/gps?vehicleId=${id}` as any)}
          >
            <IconSymbol name="map.fill" size={24} color={theme.emerald} />
            <Text style={[s.actionText, { color: theme.emerald }]}>Live Track</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.actionBtn, { backgroundColor: theme.primarySoft }]}
            onPress={() => router.push(`/vehicle/safety?vehicleId=${id}` as any)}
          >
            <IconSymbol name="shield.fill" size={24} color={theme.primary} />
            <Text style={[s.actionText, { color: theme.primary }]}>Safety Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.actionBtn, { backgroundColor: theme.amberSoft }]}
            onPress={() => router.push(`/vehicle/passengers?vehicleId=${id}` as any)}
          >
            <IconSymbol name="person.3.fill" size={24} color={theme.amber} />
            <Text style={[s.actionText, { color: theme.amber }]}>Passengers</Text>
          </TouchableOpacity>
        </View>

        {/* Info List */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Overview</Text>
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Driver</Text>
              <Text style={s.infoValue}>Driver One</Text>
            </View>
            <View style={s.divider} />
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Current Route</Text>
              <Text style={s.infoValue}>Nairobi - Mombasa</Text>
            </View>
            <View style={s.divider} />
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>{"Today's"} Revenue</Text>
              <Text style={s.infoValue}>KES 4,500</Text>
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
  
  heroCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.cardBorder,
    marginBottom: 20,
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: theme.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  regNum: { fontSize: 24, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
  model: { fontSize: 14, color: theme.textSecondary, marginBottom: 12 },
  statusBadge: {
    backgroundColor: theme.emeraldSoft,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '800', color: theme.emerald },
  
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: { fontSize: 12, fontWeight: '700' },
  
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
