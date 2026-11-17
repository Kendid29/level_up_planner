// Level Up Planner — Task Item Component
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Target, Trash2 } from 'lucide-react-native';
import { Task } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { Checkbox } from '../common/Checkbox';
import { Chip } from '../common/Chip';
import { formatDisplayDate } from '../../domain/dates';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
  onDelete?: () => void;
  goalTitle?: string | null;
}

export function TaskItem({
  task,
  onToggle,
  onPress,
  onDelete,
  goalTitle,
}: TaskItemProps) {
  const isCompleted = task.status === 'completed';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isCompleted && styles.containerCompleted,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}`}
    >
      <View style={styles.leftRow}>
        <Checkbox checked={isCompleted} onPress={onToggle} />
        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            {task.category ? (
              <Text style={styles.categoryText}>{task.category}</Text>
            ) : null}

            {task.due_at ? (
              <Text style={styles.dateText}>
                {formatDisplayDate(task.due_at)}
              </Text>
            ) : null}

            {task.priority !== 'low' ? (
              <Chip
                label={task.priority.toUpperCase()}
                priority={task.priority}
                style={styles.priorityChip}
              />
            ) : null}
          </View>

          {goalTitle ? (
            <View style={styles.goalRow}>
              <Target size={12} color={colors.forest} strokeWidth={2} />
              <Text style={styles.goalText} numberOfLines={1}>
                {goalTitle}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {onDelete ? (
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Delete task ${task.title}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </Pressable>
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
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  containerCompleted: {
    backgroundColor: '#FAF8F4',
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.9,
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 6,
  },
  categoryText: {
    ...typography.caption,
    color: colors.muted,
  },
  dateText: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '500',
  },
  priorityChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minHeight: 20,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  goalText: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '500',
    flex: 1,
  },
  deleteBtn: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnPressed: {
    opacity: 0.5,
  },
});
