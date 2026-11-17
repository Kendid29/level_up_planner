// Level Up Planner: Habit Card Component
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, Archive } from 'lucide-react-native';
import { HabitWithWeeklyProgress } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { formatLocalDate } from '../../domain/dates';

interface HabitCardProps {
  habit: HabitWithWeeklyProgress;
  onToggleDay: (dateStr: string) => void;
  onEdit?: () => void;
  onArchive?: () => void;
}

export function HabitCard({
  habit,
  onToggleDay,
  onEdit,
  onArchive,
}: HabitCardProps) {
  const todayStr = formatLocalDate(new Date());
  const progressPercent = Math.min(
    100,
    Math.round((habit.completedThisWeek / habit.frequency) * 100)
  );

  return (
    <Card onPress={onEdit} style={styles.card} accessibilityLabel={`Habit: ${habit.title}`}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {habit.title}
          </Text>
          <Text style={styles.targetText}>
            Target: {habit.frequency} days a week ({habit.completedThisWeek}/{habit.frequency} this week)
          </Text>
        </View>

        {onArchive ? (
          <Pressable
            onPress={onArchive}
            style={({ pressed }) => [styles.archiveBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Archive habit ${habit.title}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Archive size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <ProgressBar progressPercent={progressPercent} showPercentText={false} />

      <View style={styles.historyRow}>
        {habit.historyLast7Days.map((item) => (
          <Pressable
            key={item.date}
            onPress={() => onToggleDay(item.date)}
            style={({ pressed }) => [
              styles.dayCircle,
              item.completed && styles.dayCircleCompleted,
              item.isToday && styles.dayCircleToday,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${item.dayName}, ${item.date}: ${
              item.completed ? 'completed' : 'not completed'
            }`}
          >
            <Text
              style={[
                styles.dayNameText,
                item.completed && styles.dayNameTextCompleted,
              ]}
            >
              {item.dayName}
            </Text>
            {item.completed ? (
              <Check size={12} color={colors.white} strokeWidth={3} />
            ) : (
              <View
                style={[
                  styles.dotUnchecked,
                  item.isToday && styles.dotUncheckedToday,
                ]}
              />
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => onToggleDay(todayStr)}
        style={({ pressed }) => [
          styles.todayCheckBtn,
          habit.loggedToday && styles.todayCheckBtnActive,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Mark habit done for today: ${habit.title}`}
      >
        <Check
          size={16}
          color={habit.loggedToday ? colors.white : colors.forest}
          strokeWidth={2.5}
        />
        <Text
          style={[
            styles.todayCheckText,
            habit.loggedToday && styles.todayCheckTextActive,
          ]}
        >
          {habit.loggedToday ? 'Done today' : 'Mark done today'}
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.charcoal,
  },
  targetText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  archiveBtn: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  dayCircle: {
    width: 36,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayCircleCompleted: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  dayCircleToday: {
    borderColor: colors.forest,
    borderWidth: 1.5,
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 4,
  },
  dayNameTextCompleted: {
    color: colors.white,
  },
  dotUnchecked: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotUncheckedToday: {
    backgroundColor: colors.forest,
  },
  todayCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.paleSage,
    borderRadius: radius.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.sage,
  },
  todayCheckBtnActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  todayCheckText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.forest,
  },
  todayCheckTextActive: {
    color: colors.white,
  },
});
