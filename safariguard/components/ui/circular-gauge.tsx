import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
}

export function CircularGauge({
  value,
  maxValue = 100,
  size = 80,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#1E2D45',
  label,
  sublabel,
  showPercentage = true,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / maxValue, 1);
  const strokeDashoffset = circumference * (1 - percentage);
  const center = size / 2;

  const getColor = () => {
    if (percentage >= 0.8) return '#10B981';
    if (percentage >= 0.6) return '#3B82F6';
    if (percentage >= 0.4) return '#F59E0B';
    return '#EF4444';
  };

  const gaugeColor = color === '#3B82F6' ? getColor() : color;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[styles.labelContainer, { width: size, height: size }]}>
        {label ? (
          <>
            <Text style={[styles.valueText, { color: gaugeColor, fontSize: size * 0.22 }]}>{label}</Text>
            {sublabel && <Text style={[styles.sublabel, { fontSize: size * 0.12 }]}>{sublabel}</Text>}
          </>
        ) : (
          <Text style={[styles.valueText, { color: gaugeColor, fontSize: size * 0.22 }]}>
            {showPercentage ? `${Math.round(percentage * 100)}%` : value}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  sublabel: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
});
