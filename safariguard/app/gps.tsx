import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GlassCard } from "@/components/ui/glass-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StatusBadge } from "@/components/ui/badges";

// ---- Placeholder data (replace with real API / store data) ----
type Vehicle = {
  id: string;
  regNumber: string;
  driverName: string;
  route: string;
  status: 'active' | 'idle' | 'offline';
  passengers: number;
  maxCapacity: number;
  speed: number;
  lastUpdate: string;
  deviceConnected: boolean;
  location: { address: string };
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
    speed: 0,
    lastUpdate: "—",
    deviceConnected: true,
    location: { address: "Unknown location" },
  },
  {
    id: "2",
    regNumber: "KXX 001X",
    driverName: "Driver Two",
    route: "Route B",
    status: "idle",
    passengers: 0,
    maxCapacity: 1,
    speed: 0,
    lastUpdate: "—",
    deviceConnected: false,
    location: { address: "Unknown location" },
  },
];
// -----------------------------------------------------------------

export default function GPSScreen() {
  const [selectedVehicle, setSelectedVehicle] = useState(MOCK_VEHICLES[0].id);
  const selected = MOCK_VEHICLES.find(v => v.id === selectedVehicle) || MOCK_VEHICLES[0];

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>GPS Tracking</Text>
          <Text style={styles.subtitle}>
            {MOCK_VEHICLES.filter(v => v.deviceConnected).length} vehicles online
          </Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapBg}>
          {/* Grid lines to simulate map */}
          {[...Array(6)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLine, styles.gridLineH, { top: `${(i + 1) * 14}%` as any }]} />
          ))}
          {[...Array(6)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLine, styles.gridLineV, { left: `${(i + 1) * 14}%` as any }]} />
          ))}

          {/* Vehicle Markers */}
          {MOCK_VEHICLES.map((v, i) => {
            const positions = [
              { top: '35%', left: '45%' },
              { top: '50%', left: '25%' },
              { top: '30%', left: '60%' },
              { top: '65%', left: '70%' },
              { top: '20%', left: '35%' },
            ];
            const pos = positions[i] || { top: '50%', left: '50%' };
            const isSelected = v.id === selectedVehicle;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVehicle(v.id)}
                style={[
                  styles.vehicleMarker,
                  { top: pos.top as any, left: pos.left as any },
                  isSelected && styles.vehicleMarkerSelected,
                  { backgroundColor: v.status === 'active' ? '#10B981' : v.status === 'idle' ? '#F59E0B' : '#EF4444' },
                ]}
              >
                <IconSymbol name="car.fill" size={12} color="#fff" />
              </TouchableOpacity>
            );
          })}

          {/* Map Label */}
          <View style={styles.mapLabel}>
            <IconSymbol name="map.fill" size={14} color="#1E293B" />
            <Text style={styles.mapLabelText}>Nairobi Metropolitan Area</Text>
          </View>

          {/* Legend */}
          <View style={styles.mapLegend}>
            {[
              { color: '#10B981', label: 'Active' },
              { color: '#F59E0B', label: 'Idle' },
              { color: '#EF4444', label: 'Offline' },
            ].map(item => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Selected Vehicle Info */}
      <GlassCard className="mx-4 p-4 mb-3">
        <View style={styles.selectedHeader}>
          <View>
            <Text style={styles.selectedReg}>{selected.regNumber}</Text>
            <Text style={styles.selectedRoute}>{selected.route}</Text>
          </View>
          <StatusBadge status={selected.status} />
        </View>
        <View style={styles.selectedStats}>
          <View style={styles.selectedStat}>
            <Text style={styles.selectedStatValue}>{selected.speed} km/h</Text>
            <Text style={styles.selectedStatLabel}>Speed</Text>
          </View>
          <View style={styles.selectedStat}>
            <Text style={styles.selectedStatValue}>{selected.passengers}/{selected.maxCapacity}</Text>
            <Text style={styles.selectedStatLabel}>Passengers</Text>
          </View>
          <View style={styles.selectedStat}>
            <Text style={styles.selectedStatValue}>{selected.driverName.split(' ')[0]}</Text>
            <Text style={styles.selectedStatLabel}>Driver</Text>
          </View>
          <View style={styles.selectedStat}>
            <Text style={styles.selectedStatValue}>{selected.lastUpdate}</Text>
            <Text style={styles.selectedStatLabel}>Updated</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <IconSymbol name="location.fill" size={12} color="#6152FF" />
          <Text style={styles.locationText}>{selected.location.address}</Text>
        </View>
      </GlassCard>

      {/* Vehicle List */}
      <Text style={styles.listTitle}>All Vehicles</Text>
      <FlatList
        data={MOCK_VEHICLES}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.vehicleListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedVehicle(item.id)}
            activeOpacity={0.8}
            style={[
              styles.vehicleChip,
              selectedVehicle === item.id && styles.vehicleChipSelected,
            ]}
          >
            <View style={[styles.chipDot, {
              backgroundColor: item.status === 'active' ? '#10B981' : item.status === 'idle' ? '#F59E0B' : '#EF4444',
            }]} />
            <View>
              <Text style={[styles.chipReg, selectedVehicle === item.id && { color: '#6152FF' }]}>
                {item.regNumber}
              </Text>
              <Text style={styles.chipDriver}>{item.driverName.split(' ')[0]}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EF444422', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#EF444444',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { fontSize: 10, color: '#EF4444', fontWeight: '700', letterSpacing: 1 },
  mapContainer: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
  mapBg: {
    height: 220,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: { position: 'absolute', backgroundColor: '#E2E8F0' },
  gridLineH: { left: 0, right: 0, height: 1 },
  gridLineV: { top: 0, bottom: 0, width: 1 },
  vehicleMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  vehicleMarkerSelected: {
    width: 36, height: 36, borderRadius: 18,
    borderColor: '#1E293B', borderWidth: 3,
    shadowOpacity: 0.8, shadowRadius: 8,
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  mapLabel: {
    position: 'absolute', bottom: 8, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  mapLabelText: { fontSize: 10, color: '#8E8E93' },
  mapLegend: {
    position: 'absolute', bottom: 8, right: 12,
    flexDirection: 'row', gap: 10,
    backgroundColor: '#FFFFFF88', borderRadius: 8, padding: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 9, color: '#8E8E93' },
  selectedHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12,
  },
  selectedReg: { fontSize: 18, fontWeight: '700', color: '#1E293B', letterSpacing: 1, fontFamily: 'monospace' },
  selectedRoute: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  selectedStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  selectedStat: { alignItems: 'center' },
  selectedStatValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  selectedStatLabel: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 12, color: '#8E8E93' },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', paddingHorizontal: 16, marginBottom: 8 },
  vehicleListContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  vehicleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  vehicleChipSelected: { borderColor: '#6152FF', backgroundColor: '#6152FF11' },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipReg: { fontSize: 13, fontWeight: '600', color: '#1E293B', fontFamily: 'monospace' },
  chipDriver: { fontSize: 10, color: '#8E8E93', marginTop: 1 },
});