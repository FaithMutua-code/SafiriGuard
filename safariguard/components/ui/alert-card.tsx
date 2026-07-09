import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { GlassCard } from "./glass-card";
import { IconSymbol } from "./icon-symbol";
import { SeverityBadge } from "./badges";

// ---- Placeholder type (replace with real API / store data) ----
export type Alert = {
  id: string;
  vehicleReg: string;
  driverName: string;
  type: 'harsh_braking' | 'speeding' | 'passenger_anomaly' | 'device_offline' | 'emergency' | 'geofence' | 'maintenance';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  location: string;
  suggestedAction: string;
  timestamp: string;
  resolved: boolean;
};
// -----------------------------------------------------------------

const ALERT_ICONS = {
  harsh_braking: 'exclamationmark.triangle.fill',
  speeding: 'bolt.fill',
  passenger_anomaly: 'person.3.fill',
  device_offline: 'wifi.slash',
  emergency: 'flame.fill',
  geofence: 'location.fill',
  maintenance: 'gear',
} as const;

const ALERT_COLORS = {
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

interface AlertCardProps {
  alert: Alert;
  showTimeline?: boolean;
  isLast?: boolean;
}

export function AlertCard({ alert, showTimeline = true, isLast = false }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = ALERT_COLORS[alert.severity];
  const iconName = ALERT_ICONS[alert.type] as any;

  return (
    <View style={styles.wrapper}>
      {/* Timeline dot */}
      {showTimeline && (
        <View style={styles.timelineContainer}>
          <View style={[styles.timelineDot, { backgroundColor: color, shadowColor: color }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>
      )}

      {/* Card */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.85}
        style={styles.cardWrapper}
      >
        <GlassCard
          className="p-4"
          glow={alert.severity === 'critical' && !alert.resolved}
          glowColor={color}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}>
              <IconSymbol name={iconName} size={16} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.titleRow}>
                <Text style={styles.vehicleReg}>{alert.vehicleReg}</Text>
                {alert.resolved && (
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedText}>Resolved</Text>
                  </View>
                )}
              </View>
              <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
                {alert.description}
              </Text>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.meta}>
            <SeverityBadge severity={alert.severity} />
            <Text style={styles.timestamp}>{alert.timestamp}</Text>
            <IconSymbol
              name={expanded ? "chevron.up" : "chevron.down"}
              size={14}
              color="#64748B"
            />
          </View>

          {/* Expanded content */}
          {expanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <IconSymbol name="person.fill" size={12} color="#64748B" />
                <Text style={styles.infoText}>Driver: {alert.driverName}</Text>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="location.fill" size={12} color="#64748B" />
                <Text style={styles.infoText}>{alert.location}</Text>
              </View>
              <View style={styles.actionContainer}>
                <Text style={styles.actionLabel}>Suggested Action</Text>
                <Text style={styles.actionText}>{alert.suggestedAction}</Text>
              </View>
            </View>
          )}
        </GlassCard>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineContainer: {
    width: 24,
    alignItems: 'center',
    paddingTop: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1E2D45',
    marginTop: 4,
  },
  cardWrapper: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  vehicleReg: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    letterSpacing: 0.5,
  },
  resolvedBadge: {
    backgroundColor: '#10B98122',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resolvedText: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    textAlign: 'right',
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E2D45',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  actionContainer: {
    backgroundColor: '#3B82F611',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  actionLabel: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
});