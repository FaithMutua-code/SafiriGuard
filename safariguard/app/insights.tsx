import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GlassCard } from "@/components/ui/glass-card";
import { IconSymbol } from "@/components/ui/icon-symbol";

// ---- Placeholder data (replace with real API / store data) ----
export type AIInsight = {
  id: string;
  type: 'peak_hours' | 'safety_trend' | 'driver_performance' | 'occupancy_pattern' | 'maintenance_alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  actionable: boolean;
  suggestedAction?: string;
  vehicleIds?: string[];
  driverIds?: string[];
};

const MOCK_AI_INSIGHTS: AIInsight[] = [];
// -----------------------------------------------------------------

const INSIGHT_ICONS = {
  peak_hours: 'clock.fill',
  safety_trend: 'shield.fill',
  driver_performance: 'star.fill',
  occupancy_pattern: 'person.2.fill',
  maintenance_alert: 'gear',
} as const;

const INSIGHT_COLORS = {
  peak_hours: '#6152FF',
  safety_trend: '#EF4444',
  driver_performance: '#10B981',
  occupancy_pattern: '#FF9500',
  maintenance_alert: '#6152FF',
};

const IMPACT_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

function InsightCard({ insight, index }: { insight: AIInsight; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const color = INSIGHT_COLORS[insight.type];
  const impactColor = IMPACT_COLORS[insight.impact];
  const iconName = INSIGHT_ICONS[insight.type] as any;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <GlassCard className="p-4 mb-4" glow glowColor={color}>
        {/* Header */}
        <View style={styles.insightHeader}>
          <View style={[styles.insightIconContainer, { backgroundColor: color + '22' }]}>
            <IconSymbol name={iconName} size={20} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.insightTitle} numberOfLines={1}>{insight.title}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.impactBadge, { backgroundColor: impactColor + '22' }]}>
                <Text style={[styles.impactText, { color: impactColor }]}>
                  {insight.impact.toUpperCase()} IMPACT
                </Text>
              </View>
              <Text style={styles.timestamp}>{insight.timestamp}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{insight.description}</Text>

        {/* Action */}
        {insight.actionable && (
          <View style={[styles.actionContainer, { borderLeftColor: color }]}>
            <Text style={[styles.actionLabel, { color }]}>Recommended Action</Text>
            <Text style={styles.actionText}>{insight.suggestedAction}</Text>
          </View>
        )}

        {/* Affected entities */}
        {(insight.vehicleIds || insight.driverIds) && (
          <View style={styles.affectedRow}>
            {insight.vehicleIds && (
              <View style={styles.affectedChip}>
                <IconSymbol name="car.fill" size={10} color="#8E8E93" />
                <Text style={styles.affectedText}>{insight.vehicleIds.length} vehicle(s)</Text>
              </View>
            )}
            {insight.driverIds && (
              <View style={styles.affectedChip}>
                <IconSymbol name="person.fill" size={10} color="#8E8E93" />
                <Text style={styles.affectedText}>{insight.driverIds.length} driver(s)</Text>
              </View>
            )}
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

export default function InsightsScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>AI Insights</Text>
          <Text style={styles.subtitle}>Powered by SafariGuard Intelligence</Text>
        </View>
        <View style={styles.aiBadge}>
          <IconSymbol name="sparkles" size={14} color="#FF9500" />
          <Text style={styles.aiBadgeText}>Live</Text>
        </View>
      </View>

      {/* Summary Banner */}
      <Animated.View style={[styles.bannerContainer, { opacity: headerAnim }]}>
        <GlassCard className="mx-4 p-4 mb-4" glow glowColor="#FF9500">
          <View style={styles.bannerContent}>
            <View style={styles.bannerIcon}>
              <IconSymbol name="brain" size={24} color="#FF9500" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {MOCK_AI_INSIGHTS.length} insights generated
              </Text>
              <Text style={styles.bannerSubtitle}>
                {MOCK_AI_INSIGHTS.filter(i => i.impact === 'high').length} high-impact recommendations require attention
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Insights List */}
      <FlatList
        data={MOCK_AI_INSIGHTS}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <InsightCard insight={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FF950022', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FF950044',
  },
  aiBadgeText: { fontSize: 11, color: '#FF9500', fontWeight: '600' },
  bannerContainer: {},
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#FF950022', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FF950044',
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  bannerSubtitle: { fontSize: 12, color: '#8E8E93', lineHeight: 17 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  insightHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  insightIconContainer: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  titleRow: { marginBottom: 6 },
  insightTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  impactBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  impactText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  timestamp: { fontSize: 11, color: '#8E8E93' },
  description: { fontSize: 13, color: '#8E8E93', lineHeight: 19, marginBottom: 12 },
  actionContainer: {
    backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12,
    borderLeftWidth: 3, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  actionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  actionText: { fontSize: 12, color: '#8E8E93', lineHeight: 17 },
  affectedRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  affectedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F8F9FA', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  affectedText: { fontSize: 11, color: '#8E8E93' },
});