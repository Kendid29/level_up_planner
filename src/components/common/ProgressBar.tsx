// Level Up Planner: Reusable Progress Bar Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface ProgressBarProps {
  progressPercent: number | null; // null if no milestones/tasks yet
  label?: string;
  showPercentText?: boolean;
}

export function ProgressBar({
  progressPercent,
  label,
  showPercentText = true,
}: ProgressBarProps) {
  const percentValue = progressPercent === null ? 0 : Math.min(100, Math.max(0, progressPercent));
  const displayText =
    progressPercent === null ? 'Not started' : `${percentValue}%`;

  return (
    <View style={styles.container}>
      {(label || showPercentText) ? (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showPercentText ? <Text style={styles.percentText}>{displayText}</Text> : null}
        </View>
      ) : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentValue}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  percentText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.forest,
  },
  track: {
    height: 7,
    backgroundColor: colors.beige,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.forest,
    borderRadius: radius.full,
  },
});
