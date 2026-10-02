import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from './icon-symbol';

export function Skeleton({
  width,
  height,
  borderRadius = 12,
  style,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  // Compliant with rule: create Animated.Value with useState(() => new Animated.Value(0))
  const [pulseAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: theme.track,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

export function ErrorState({
  message = 'Failed to load data',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.centerContainer, { backgroundColor: theme.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.dangerSoft }]}>
        <IconSymbol name="exclamationmark.triangle.fill" size={28} color={theme.danger} />
      </View>
      <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          style={[styles.retryBtn, { backgroundColor: theme.primary }]}
        >
          <IconSymbol name="arrow.clockwise" size={14} color="#FFFFFF" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyState({
  icon = 'tray.fill',
  title = 'No Data Found',
  description = 'There are no items to display right now.',
  actionLabel,
  onAction,
}: {
  icon?: any;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.centerContainer, { backgroundColor: theme.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
        <IconSymbol name={icon} size={30} color={theme.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>{description}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function UpdatedBadge({
  updatedAt,
  isFetching,
}: {
  updatedAt?: Date | null;
  isFetching?: boolean;
}) {
  const { theme } = useTheme();
  const [text, setText] = useState('just now');

  useEffect(() => {
    const updateText = () => {
      if (!updatedAt) {
        setText('live');
        return;
      }
      const sec = Math.floor((Date.now() - updatedAt.getTime()) / 1000);
      if (sec < 5) setText('just now');
      else if (sec < 60) setText(`${sec}s ago`);
      else setText(`${Math.floor(sec / 60)}m ago`);
    };

    updateText();
    const interval = setInterval(updateText, 3000);
    return () => clearInterval(interval);
  }, [updatedAt]);

  return (
    <View style={styles.updatedBadgeContainer}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: isFetching ? theme.amber : theme.emerald },
        ]}
      />
      <Text style={[styles.updatedText, { color: theme.textSecondary }]}>
        {isFetching ? 'Updating…' : `Updated ${text}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 280,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 16,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  updatedBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  updatedText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
