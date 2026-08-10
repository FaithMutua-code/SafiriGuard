import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemeColors } from "@/context/ThemeContext";

// ---- Placeholder data ----
type Trip = {
  id: string;
  vehicleReg: string;
  driverName: string;
  route: string;
  date: string;
  status: 'completed' | 'ongoing' | 'cancelled';
  revenue: number;
  distance: number;
};

const MOCK_TRIPS: Trip[] = [
  {
    id: "trip-1",
    vehicleReg: "KXX 000X",
    driverName: "Driver One",
    route: "Nairobi - Mombasa",
    date: "Today, 08:30 AM",
    status: "ongoing",
    revenue: 4500,
    distance: 230,
  },
  {
    id: "trip-2",
    vehicleReg: "KXX 001X",
    driverName: "Driver Two",
    route: "Nairobi - Kisumu",
    date: "Yesterday, 07:00 AM",
    status: "completed",
    revenue: 12000,
    distance: 350,
  },
];
// -----------------------------------------------------------------

export default function TripsScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer containerClassName="bg-background" style={{ backgroundColor: theme.bg }}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Trips History</Text>
          <Text style={s.subtitle}>Monitor past and ongoing trips</Text>
        </View>

        {/* Trips List */}
        <FlatList
          data={MOCK_TRIPS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push(`/trip/${item.id}` as any)}
              style={s.tripCard}
            >
              <View style={s.cardTop}>
                <View style={s.routeWrap}>
                  <IconSymbol name="map.fill" size={16} color={theme.emerald} />
                  <Text style={s.routeText}>{item.route}</Text>
                </View>
                <View style={[s.statusBadge, item.status === 'ongoing' ? s.statusOngoing : s.statusCompleted]}>
                  <Text style={[s.statusText, item.status === 'ongoing' ? {color: theme.amber} : {color: theme.emerald}]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={s.cardMiddle}>
                <View style={s.infoBlock}>
                  <Text style={s.infoLabel}>Vehicle</Text>
                  <Text style={s.infoValue}>{item.vehicleReg}</Text>
                </View>
                <View style={s.infoBlock}>
                  <Text style={s.infoLabel}>Driver</Text>
                  <Text style={s.infoValue}>{item.driverName}</Text>
                </View>
                <View style={s.infoBlock}>
                  <Text style={s.infoLabel}>Revenue</Text>
                  <Text style={[s.infoValue, { color: theme.primary }]}>KES {item.revenue}</Text>
                </View>
              </View>
              
              <View style={s.cardBottom}>
                <Text style={s.dateText}>{item.date}</Text>
                <Text style={s.distText}>{item.distance} km</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      </ScreenContainer>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.textPrimary },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  
  tripCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: theme.primaryDeep,
    shadowOpacity: theme.mode === 'dark' ? 0 : 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: { fontSize: 16, fontWeight: '700', color: theme.textPrimary },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusOngoing: {
    backgroundColor: theme.amberSoft,
    borderColor: theme.mode === 'dark' ? theme.amber + '44' : theme.amberSoft,
  },
  statusCompleted: {
    backgroundColor: theme.emeraldSoft,
    borderColor: theme.mode === 'dark' ? theme.emerald + '44' : theme.emeraldSoft,
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: theme.mode === 'dark' ? theme.bg : '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  infoBlock: { alignItems: 'flex-start' },
  infoLabel: { fontSize: 11, color: theme.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '700', color: theme.textPrimary },
  
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    paddingTop: 12,
  },
  dateText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
  distText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
});
