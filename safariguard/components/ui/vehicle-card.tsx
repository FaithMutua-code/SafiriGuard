import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { GlassCard } from "./glass-card";
import { IconSymbol } from "./icon-symbol";
import { StatusBadge } from "./badges";
import { CircularGauge } from "./circular-gauge";

/* -------------------------------------------------------------------------- */
/*                            Placeholder Vehicle Type                         */
/* -------------------------------------------------------------------------- */

interface Vehicle {
  id?: string;

  regNumber: string;
  route: string;

  status: "active" | "idle" | "offline" | "maintenance";

  driverName: string;
  deviceConnected: boolean;

  passengers: number;
  maxCapacity: number;

  safetyScore: number;
  speed: number;

  totalTripsToday: number;

  location: {
    address: string;
  };

  lastUpdate: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
    >
      <GlassCard className="p-4 mb-3">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.regContainer}>
            <Text style={styles.regNumber}>
              {vehicle.regNumber}
            </Text>

            <Text style={styles.route}>
              {vehicle.route}
            </Text>
          </View>

          <StatusBadge status={vehicle.status} />
        </View>

        {/* Driver */}
        <View style={styles.driverRow}>
          <View style={styles.driverAvatar}>
            <Text style={styles.avatarText}>
              {vehicle.driverName?.charAt(0) ?? "D"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>
              {vehicle.driverName}
            </Text>

            <Text style={styles.driverLabel}>
              Driver
            </Text>
          </View>

          <View style={styles.deviceStatus}>
            <IconSymbol
              name={vehicle.deviceConnected ? "wifi" : "wifi.slash"}
              size={14}
              color={vehicle.deviceConnected ? "#10B981" : "#EF4444"}
            />

            <Text
              style={[
                styles.deviceText,
                {
                  color: vehicle.deviceConnected
                    ? "#10B981"
                    : "#EF4444",
                },
              ]}
            >
              {vehicle.deviceConnected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>

          <View style={styles.statItem}>
            <CircularGauge
              value={vehicle.passengers}
              maxValue={vehicle.maxCapacity}
              size={56}
              strokeWidth={5}
              label={`${vehicle.passengers}`}
              sublabel="pax"
            />

            <Text style={styles.statLabel}>
              Occupancy
            </Text>
          </View>

          <View style={styles.statItem}>
            <CircularGauge
              value={vehicle.safetyScore}
              maxValue={100}
              size={56}
              strokeWidth={5}
              label={`${vehicle.safetyScore}`}
              sublabel="pts"
            />

            <Text style={styles.statLabel}>
              Safety
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.speedContainer}>
              <Text style={styles.speedValue}>
                {vehicle.speed}
              </Text>

              <Text style={styles.speedUnit}>
                km/h
              </Text>
            </View>

            <Text style={styles.statLabel}>
              Speed
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.speedContainer}>
              <Text style={styles.speedValue}>
                {vehicle.totalTripsToday}
              </Text>

              <Text style={styles.speedUnit}>
                trips
              </Text>
            </View>

            <Text style={styles.statLabel}>
              Today
            </Text>
          </View>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <IconSymbol
            name="location.fill"
            size={12}
            color="#64748B"
          />

          <Text
            style={styles.footerText}
            numberOfLines={1}
          >
            {vehicle.location?.address ?? "Unknown Location"}
          </Text>

          <Text style={styles.updateText}>
            {vehicle.lastUpdate}
          </Text>
        </View>

      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  regContainer: {
    flex: 1,
  },

  regNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F1F5F9",
    letterSpacing: 1,
    fontFamily: "monospace",
  },

  route: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2D45",
  },

  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F622",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3B82F644",
  },

  avatarText: {
    color: "#3B82F6",
    fontWeight: "700",
    fontSize: 14,
  },

  driverName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F1F5F9",
  },

  driverLabel: {
    fontSize: 10,
    color: "#64748B",
  },

  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  deviceText: {
    fontSize: 11,
    fontWeight: "600",
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

  speedContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1E2D45",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#3B82F633",
  },

  speedValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
  },

  speedUnit: {
    fontSize: 8,
    color: "#64748B",
  },

  statLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  footerText: {
    fontSize: 11,
    color: "#64748B",
    flex: 1,
  },

  updateText: {
    fontSize: 10,
    color: "#64748B",
  },
});