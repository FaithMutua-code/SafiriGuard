import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export interface MapViewProps {
  children?: React.ReactNode;
  style?: any;
  initialRegion?: any;
  region?: any;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  showsUserLocation?: boolean;
  ref?: any;
  [key: string]: any;
}

export default function MapView({ children, style }: MapViewProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackTitle}>Interactive Map View</Text>
        <Text style={styles.fallbackSub}>Available when running on Android & iOS mobile devices.</Text>
      </View>
      {children}
    </View>
  );
}

export function Marker({ children }: any) {
  return null;
}

export function Polyline({ ...props }: any) {
  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 180,
  },
  fallbackContent: {
    alignItems: 'center',
    padding: 16,
  },
  fallbackTitle: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  fallbackSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
});
