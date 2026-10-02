import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { StatusBadge } from "./badges";
import { CircularGauge } from "./circular-gauge";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { OwnerVehicle } from "@/api/types";
import { formatRelativeTime } from "@/lib/dateUtils";

interface VehicleCardProps {
  vehicle: OwnerVehicle;
  onPress?: () => void;
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const coordsText = vehicle.last_location
    ? `${vehicle.last_location.lat.toFixed(4)}, ${vehicle.last_location.lng.toFixed(4)}`
    : 'No GPS fix';

  const lastSeenText = vehicle.last_seen_at
    ? `Seen ${formatRelativeTime(vehicle.last_seen_at)}`
    : 'Never seen';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={s.card}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.regContainer}>
            <View style={s.plateRow}>
              <Text style={s.regNumber}>{vehicle.number_plate}</Text>
              {vehicle.device_connected && (
                <View style={s.onlineDot} />
              )}
            </View>
            <Text style={s.route} numberOfLines={1}>
              {vehicle.route_name ?? `${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim() ?? 'Unassigned route'}
            </Text>
          </View>

          <StatusBadge status={vehicle.status} />
        </View>

        {/* Device Status Bar */}
        <View style={s.deviceRow}>
          <View style={s.deviceStatus}>
            <IconSymbol
              name={vehicle.device_connected ? "wifi" : "wifi.slash"}
              size={13}
              color={vehicle.device_connected ? theme.emerald : theme.textSecondary}
            />
            <Text
              style={[
                s.deviceText,
                { color: vehicle.device_connected ? theme.emerald : theme.textSecondary },
              ]}
            >
              {vehicle.device_connected ? "Device Connected" : "Device Offline"}
            </Text>
          </View>

          <Text style={s.fareBadge}>
            KES {Number(vehicle.fare_amount).toFixed(0)} / pax
          </Text>
        </View>

        {/* Statistics */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <CircularGauge
              value={vehicle.occupancy.people}
              maxValue={vehicle.occupancy.capacity || 14}
              size={56}
              strokeWidth={5}
              label={`${vehicle.occupancy.people}`}
              sublabel="pax"
            />
            <Text style={s.statLabel}>Occupancy</Text>
          </View>

          <View style={s.statItem}>
            <CircularGauge
              value={vehicle.safety_score ?? 100}
              maxValue={100}
              size={56}
              strokeWidth={5}
              label={vehicle.safety_score !== null ? `${vehicle.safety_score}` : '—'}
              sublabel="pts"
            />
            <Text style={s.statLabel}>Safety</Text>
          </View>

          <View style={s.statItem}>
            <View style={s.pillStat}>
              <Text style={s.pillStatValue}>{vehicle.today.trips}</Text>
              <Text style={s.pillStatUnit}>trips</Text>
            </View>
            <Text style={s.statLabel}>Today</Text>
          </View>

          <View style={s.statItem}>
            <View style={s.pillStat}>
              <Text style={s.pillStatValue}>{vehicle.seat_capacity}</Text>
              <Text style={s.pillStatUnit}>seats</Text>
            </View>
            <Text style={s.statLabel}>Capacity</Text>
          </View>
        </View>

        {/* Footer: real coordinates & last seen */}
        <View style={s.footer}>
          <View style={s.coordsWrap}>
            <IconSymbol name="location.fill" size={11} color={theme.textSecondary} />
            <Text style={s.footerText} numberOfLines={1}>
              {coordsText}
            </Text>
          </View>

          <Text style={s.updateText}>{lastSeenText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      shadowColor: theme.primaryDeep,
      shadowOpacity: theme.mode === 'dark' ? 0 : 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    regContainer: { flex: 1, marginRight: 8 },
    plateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    regNumber: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.textPrimary,
      letterSpacing: 0.8,
      fontFamily: "monospace",
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.emerald,
    },
    route: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
      fontWeight: '500',
    },
    deviceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorder,
      marginBottom: 12,
    },
    deviceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    deviceText: {
      fontSize: 11,
      fontWeight: '600',
    },
    fareBadge: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    statItem: {
      alignItems: "center",
      gap: 4,
      flex: 1,
    },
    pillStat: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: theme.mode === 'dark' ? theme.track : theme.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    pillStatValue: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.textPrimary,
    },
    pillStatUnit: {
      fontSize: 8,
      color: theme.textSecondary,
      textTransform: "uppercase",
      fontWeight: "600",
    },
    statLabel: {
      fontSize: 10,
      color: theme.textSecondary,
      fontWeight: "600",
      marginTop: 2,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
    },
    coordsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
      marginRight: 8,
    },
    footerText: {
      fontSize: 11,
      color: theme.textSecondary,
      fontFamily: 'monospace',
    },
    updateText: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '500',
    },
  });