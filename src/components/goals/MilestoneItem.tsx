// Level Up Planner: Milestone Item Component
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Milestone } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { Checkbox } from '../common/Checkbox';
import { formatDisplayDate } from '../../domain/dates';

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle: () => void;
  onDelete?: () => void;
  linkedTaskCount?: number;
  completedTaskCount?: number;
}

export function MilestoneItem({
  milestone,
  onToggle,
  onDelete,
  linkedTaskCount = 0,
  completedTaskCount = 0,
}: MilestoneItemProps) {
  const isCompleted = milestone.completed_at !== null;

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Checkbox checked={isCompleted} onPress={onToggle} />
        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {milestone.title}
          </Text>
          {milestone.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {milestone.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {milestone.target_date ? (
              <Text style={styles.metaText}>
                Due: {formatDisplayDate(milestone.target_date)}
              </Text>
            ) : null}
            {linkedTaskCount > 0 ? (
              <Text style={styles.metaTasksText}>
                {completedTaskCount}/{linkedTaskCount} tasks completed
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Delete milestone ${milestone.title}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: spacing.sm,
  },
  content: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '500',
    color: colors.charcoal,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  description: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.muted,
  },
  metaTasksText: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
