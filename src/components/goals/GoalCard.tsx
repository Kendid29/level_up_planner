// Level Up Planner — Goal Card Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoalWithProgress } from '../../types/models';
import { colors, spacing, typography } from '../../theme/tokens';
import { Card } from '../common/Card';
import { Chip } from '../common/Chip';
import { ProgressBar } from '../common/ProgressBar';
import { formatDisplayDate } from '../../domain/dates';

interface GoalCardProps {
  goal: GoalWithProgress;
  onPress: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const horizonLabel =
    goal.horizon === 'short'
      ? 'Short-term'
      : goal.horizon === 'mid'
      ? 'Mid-term'
      : 'Long-term';

  const milestoneSummary =
    goal.totalMilestones === 0
      ? 'No milestones set yet'
      : `${goal.completedMilestones} of ${goal.totalMilestones} milestones completed`;

  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`Goal: ${goal.title}`}>
      <View style={styles.topRow}>
        <Chip label={goal.category} style={styles.categoryChip} />
        <Chip label={horizonLabel} horizon={goal.horizon} />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {goal.title}
      </Text>

      {goal.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      ) : null}

      <View style={styles.progressSection}>
        <ProgressBar
          progressPercent={goal.progressPercent}
          label={milestoneSummary}
          showPercentText={goal.progressPercent !== null}
        />
      </View>

      <View style={styles.footerRow}>
        {goal.target_date ? (
          <Text style={styles.dateText}>
            Target: {formatDisplayDate(goal.target_date)}
          </Text>
        ) : (
          <Text style={styles.dateText}>No deadline set</Text>
        )}
        {goal.linkedTaskCount > 0 ? (
          <Text style={styles.taskCountText}>
            {goal.completedTaskCount}/{goal.linkedTaskCount} tasks
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryChip: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  progressSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.muted,
  },
  taskCountText: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '500',
  },
});
