// Level Up Planner: Monthly Progress Summary Screen (Phase 2)
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  CheckCircle2,
  TrendingUp,
  Award,
  Calendar,
  RotateCcw,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { ProgressBar } from '@/components/common/ProgressBar';
import { getMonthPeriod } from '@/domain/dates';

export default function MonthlySummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getMonthlySummary } = useApp();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const period = useMemo(() => {
    return getMonthPeriod(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const summary = useMemo(() => {
    return getMonthlySummary(selectedYear, selectedMonth);
  }, [getMonthlySummary, selectedYear, selectedMonth]);

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const handlePrevMonth = () => {
    setSelectedYear(period.prevYear);
    setSelectedMonth(period.prevMonth);
  };

  const handleNextMonth = () => {
    setSelectedYear(period.nextYear);
    setSelectedMonth(period.nextMonth);
  };

  const handleResetToCurrent = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Monthly Summary"
        subtitle={summary.monthLabel}
        showBack
        onBack={() => router.back()}
        rightAction={
          !isCurrentMonth ? (
            <Pressable
              onPress={handleResetToCurrent}
              style={styles.resetBtn}
              accessibilityRole="button"
              accessibilityLabel="Jump to current month"
            >
              <RotateCcw size={16} color={colors.forest} />
            </Pressable>
          ) : undefined
        }
      />

      {/* Month Navigation Control */}
      <View style={styles.navRow}>
        <Pressable
          onPress={handlePrevMonth}
          style={({ pressed }) => [styles.navArrow, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <ChevronLeft size={20} color={colors.charcoal} />
        </Pressable>

        <View style={styles.monthDisplay}>
          <Calendar size={15} color={colors.forest} />
          <Text style={styles.monthTitle}>{summary.monthLabel}</Text>
        </View>

        <Pressable
          onPress={handleNextMonth}
          style={({ pressed }) => [styles.navArrow, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <ChevronRight size={20} color={colors.charcoal} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Overview Card */}
        <Card style={styles.card}>
          <Text style={styles.cardHeading}>Monthly Overview</Text>
          <Text style={styles.cardSubtext}>
            Comprehensive snapshot of your progress across all categories in {summary.monthName}.
          </Text>

          {/* 4 Metric Boxes */}
          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricBig}>{summary.taskCompletionRate}%</Text>
              <Text style={styles.metricLabel}>Tasks Completed</Text>
              <Text style={styles.metricSub}>
                {summary.completedTasks} of {summary.totalTasks} tasks
              </Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricBig}>{summary.habitCompletionRate}%</Text>
              <Text style={styles.metricLabel}>Habit Consistency</Text>
              <Text style={styles.metricSub}>Across active habits</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricBig}>{summary.completedMilestonesCount}</Text>
              <Text style={styles.metricLabel}>Milestones Reached</Text>
              <Text style={styles.metricSub}>Goal checkpoints</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricBig}>{summary.completedGoalsCount}</Text>
              <Text style={styles.metricLabel}>Goals Achieved</Text>
              <Text style={styles.metricSub}>
                {summary.activeGoalsCount} in progress
              </Text>
            </View>
          </View>
        </Card>

        {/* Monthly Highlights Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Award size={18} color={colors.forest} />
            <Text style={[styles.cardHeading, { marginLeft: spacing.xs }]}>
              Monthly Highlights
            </Text>
          </View>

          {/* Best Consistency Habit */}
          {summary.bestHabit ? (
            <View style={styles.highlightItem}>
              <View style={styles.highlightIcon}>
                <Sparkles size={16} color={colors.forest} />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Top Consistency Habit</Text>
                <Text style={styles.highlightBody}>
                  {summary.bestHabit.habit.title} reached {summary.bestHabit.completionRate}% completion ({summary.bestHabit.completedDays}/{summary.bestHabit.scheduledDays} scheduled days).
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyHighlightRow}>
              <Text style={styles.emptyHighlightText}>
                No habits were active during this month.
              </Text>
            </View>
          )}

          {/* Goals Achieved in this month */}
          {summary.completedGoals.length > 0 ? (
            <View style={styles.highlightItem}>
              <View style={styles.highlightIcon}>
                <Target size={16} color={colors.forest} />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>
                  {summary.completedGoals.length} Goal{summary.completedGoals.length > 1 ? 's' : ''} Completed
                </Text>
                {summary.completedGoals.map((g) => (
                  <Text key={g.id} style={styles.goalCompletedItem}>
                    • {g.title} ({g.category})
                  </Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Milestones Achieved in this month */}
          {summary.completedMilestones.length > 0 ? (
            <View style={styles.highlightItem}>
              <View style={styles.highlightIcon}>
                <CheckCircle2 size={16} color={colors.forest} />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>
                  {summary.completedMilestones.length} Milestone{summary.completedMilestones.length > 1 ? 's' : ''} Achieved
                </Text>
                {summary.completedMilestones.slice(0, 4).map((m) => (
                  <Text key={m.id} style={styles.milestoneItemText} numberOfLines={1}>
                    ✓ {m.title}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Tasks Completion Encouragement */}
          <View style={styles.encouragementBlock}>
            <Text style={styles.encouragementText}>
              {summary.completedTasks > 0
                ? `You checked off ${summary.completedTasks} actions in ${summary.monthName}. Every focused action compounds steadily toward your long-term vision.`
                : `A fresh slate for ${summary.monthName}. Take one calm step each day.`}
            </Text>
          </View>
        </Card>

        {/* Month-over-Month Comparison Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <TrendingUp size={18} color={colors.forest} />
            <Text style={[styles.cardHeading, { marginLeft: spacing.xs }]}>
              Monthly Comparison
            </Text>
          </View>

          {summary.comparisonWithPreviousMonth.hasPreviousMonth ? (
            <View style={styles.comparisonContainer}>
              <Text style={styles.comparisonSubtext}>
                Compared to the previous calendar month:
              </Text>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>Task Rate Delta</Text>
                  <Text
                    style={[
                      styles.comparisonValue,
                      (summary.comparisonWithPreviousMonth.taskRateDelta ?? 0) >= 0
                        ? styles.deltaPositive
                        : styles.deltaNeutral,
                    ]}
                  >
                    {(summary.comparisonWithPreviousMonth.taskRateDelta ?? 0) >= 0
                      ? `+${summary.comparisonWithPreviousMonth.taskRateDelta}%`
                      : `${summary.comparisonWithPreviousMonth.taskRateDelta}%`}
                  </Text>
                </View>

                {summary.comparisonWithPreviousMonth.completedTasksDelta !== null ? (
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Tasks Difference</Text>
                    <Text
                      style={[
                        styles.comparisonValue,
                        summary.comparisonWithPreviousMonth.completedTasksDelta >= 0
                          ? styles.deltaPositive
                          : styles.deltaNeutral,
                      ]}
                    >
                      {summary.comparisonWithPreviousMonth.completedTasksDelta >= 0
                        ? `+${summary.comparisonWithPreviousMonth.completedTasksDelta} tasks`
                        : `${summary.comparisonWithPreviousMonth.completedTasksDelta} tasks`}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.emptyComparisonBox}>
              <Text style={styles.emptyComparisonText}>
                No recorded planner activities found for the previous month. Comparisons will automatically appear as you maintain daily actions.
              </Text>
            </View>
          )}
        </Card>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  navArrow: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  monthTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.charcoal,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  card: {
    marginBottom: spacing.base,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardHeading: {
    ...typography.h3,
    color: colors.charcoal,
  },
  cardSubtext: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metricBig: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.forest,
  },
  metricLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.charcoal,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
  },
  highlightBody: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  goalCompletedItem: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '500',
    marginTop: 2,
  },
  milestoneItemText: {
    ...typography.caption,
    color: colors.charcoal,
    marginTop: 2,
  },
  emptyHighlightRow: {
    paddingVertical: spacing.sm,
  },
  emptyHighlightText: {
    ...typography.caption,
    color: colors.muted,
    fontStyle: 'italic',
  },
  encouragementBlock: {
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.forest,
  },
  encouragementText: {
    ...typography.caption,
    color: colors.charcoal,
    lineHeight: 18,
  },
  comparisonContainer: {
    marginTop: spacing.xs,
  },
  comparisonSubtext: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  comparisonItem: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  comparisonLabel: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  deltaPositive: {
    color: colors.forest,
  },
  deltaNeutral: {
    color: colors.charcoal,
  },
  emptyComparisonBox: {
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  emptyComparisonText: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
});
