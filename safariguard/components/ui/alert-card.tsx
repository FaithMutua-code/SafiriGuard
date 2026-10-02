import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { SeverityBadge } from "./badges";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { AlertItem } from "@/api/types";
import { formatRelativeTime } from "@/lib/dateUtils";

const ALERT_ICONS = {
  harsh_braking: 'exclamationmark.triangle.fill',
  sudden_acceleration: 'arrow.up.forward.circle.fill',
  sharp_cornering: 'arrow.left.and.right.circle.fill',
  speeding: 'bolt.fill',
  device_offline: 'wifi.slash',
  over_capacity: 'person.3.fill',
} as const;

interface AlertCardProps {
  alert: AlertItem;
  showTimeline?: boolean;
  isLast?: boolean;
  onResolve?: (id: number) => void;
  isResolving?: boolean;
}

export function AlertCard({
  alert,
  showTimeline = true,
  isLast = false,
  onResolve,
  isResolving = false,
}: AlertCardProps) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [expanded, setExpanded] = useState(false);

  const sevColors = {
    critical: theme.danger,
    warning: theme.amber,
    info: theme.electric,
  };
  const color = sevColors[alert.severity] ?? theme.danger;
  const iconName = (ALERT_ICONS[alert.type] ?? 'exclamationmark.triangle.fill') as any;
  const isResolved = !!alert.resolved_at;

  return (
    <View style={s.wrapper}>
      {/* Timeline dot */}
      {showTimeline && (
        <View style={s.timelineContainer}>
          <View style={[s.timelineDot, { backgroundColor: color }]} />
          {!isLast && <View style={s.timelineLine} />}
        </View>
      )}

      {/* Card */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.85}
        style={s.cardWrapper}
      >
        <View style={[s.card, !isResolved && alert.severity === 'critical' && s.cardGlow]}>
          {/* Header */}
          <View style={s.header}>
            <View style={[s.iconContainer, { backgroundColor: color + '22' }]}>
              <IconSymbol name={iconName} size={16} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={s.titleRow}>
                <Text style={s.vehicleReg}>
                  {alert.vehicle_plate ?? `Vehicle #${alert.vehicle_id}`}
                </Text>
                {isResolved && (
                  <View style={s.resolvedBadge}>
                    <Text style={s.resolvedText}>RESOLVED</Text>
                  </View>
                )}
              </View>
              <Text style={s.description} numberOfLines={expanded ? undefined : 2}>
                {alert.description}
              </Text>
            </View>
          </View>

          {/* Meta */}
          <View style={s.meta}>
            <SeverityBadge severity={alert.severity} />
            <Text style={s.timestamp}>{formatRelativeTime(alert.created_at)}</Text>
            <IconSymbol
              name={expanded ? "chevron.up" : "chevron.down"}
              size={14}
              color={theme.textSecondary}
            />
          </View>

          {/* Expanded content */}
          {expanded && (
            <View style={s.expandedContent}>
              <View style={s.divider} />

              {alert.location && (
                <View style={s.infoRow}>
                  <IconSymbol name="location.fill" size={12} color={theme.textSecondary} />
                  <Text style={s.infoText}>
                    GPS: {alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}
                  </Text>
                </View>
              )}

              {alert.suggested_action && (
                <View style={s.actionContainer}>
                  <Text style={s.actionLabel}>Suggested Action</Text>
                  <Text style={s.actionText}>{alert.suggested_action}</Text>
                </View>
              )}

              {!isResolved && onResolve && (
                <TouchableOpacity
                  onPress={() => onResolve(alert.id)}
                  activeOpacity={0.8}
                  style={[s.resolveBtn, isResolving && { opacity: 0.6 }]}
                  disabled={isResolving}
                >
                  {isResolving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <IconSymbol name="checkmark.circle.fill" size={15} color="#FFFFFF" />
                      <Text style={s.resolveBtnText}>Mark as Resolved</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrapper: { flexDirection: 'row', marginBottom: 2 },
    timelineContainer: { width: 22, alignItems: 'center', paddingTop: 16 },
    timelineDot: { width: 10, height: 10, borderRadius: 5 },
    timelineLine: { width: 2, flex: 1, backgroundColor: theme.cardBorder, marginTop: 4 },
    cardWrapper: { flex: 1, marginLeft: 8, marginBottom: 12 },
    card: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    cardGlow: {
      borderColor: theme.mode === 'dark' ? theme.danger + '55' : '#FFD3D3',
    },
    header: { flexDirection: 'row', marginBottom: 10 },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
    vehicleReg: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textPrimary,
      fontFamily: 'monospace',
    },
    resolvedBadge: {
      backgroundColor: theme.emeraldSoft,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
    },
    resolvedText: { fontSize: 9, color: theme.emerald, fontWeight: '800' },
    description: { fontSize: 12.5, color: theme.textSecondary, lineHeight: 18 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    timestamp: {
      fontSize: 11,
      color: theme.textSecondary,
      flex: 1,
      textAlign: 'right',
      marginRight: 4,
    },
    expandedContent: { marginTop: 10 },
    divider: { height: 1, backgroundColor: theme.cardBorder, marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    infoText: { fontSize: 11.5, color: theme.textSecondary, fontFamily: 'monospace' },
    actionContainer: {
      backgroundColor: theme.mode === 'dark' ? theme.track : theme.bg,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
      marginBottom: 10,
    },
    actionLabel: {
      fontSize: 10,
      color: theme.primary,
      fontWeight: '800',
      marginBottom: 3,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionText: { fontSize: 12, color: theme.textPrimary, lineHeight: 17 },
    resolveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 10,
      marginTop: 4,
    },
    resolveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  });