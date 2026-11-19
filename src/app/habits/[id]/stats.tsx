// Level Up Planner: Individual Habit Statistics Screen (Phase 2)
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Clock,
  RotateCcw,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { ProgressBar } from '@/components/common/ProgressBar';
import { getMonthPeriod, parseLocalDate, formatDisplayDate } from '@/domain/dates';

export default function HabitStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, getHabitDetailedStats } = useApp();

  const habit = habits.find((h) => h.id === id);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const period = useMemo(() => {
    return getMonthPeriod(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const stats = useMemo(() => {
    if (!habit) return null;
    return getHabitDetailedStats(habit.id, selectedYear, selectedMonth);
  }, [habit, getHabitDetailedStats, selectedYear, selectedMonth]);

  if (!habit || !stats) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Habit Statistics" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Habit not found.</Text>
          <Button title="Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

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

  // Determine leading blank days for calendar alignment (0 = Sunday)
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const leadingBlanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={habit.title}
        subtitle="Habit Statistics & Consistency"
        showBack
        onBack={() => router.back()}
        rightAction={
          !isCurrentMonth ? (
            <Pressable
              onPress={handleResetToCurrent}
              style={styles.resetBtn}
              accessibilityRole="button"
              accessibilityLabel="Reset to current month"
            >
              <RotateCcw size={16} color={colors.forest} />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Habit Profile Card */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.habitIconBox}>
              <Sparkles size={20} color={colors.forest} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.habitTitle}>{habit.title}</Text>
              <Text style={styles.habitMeta}>
                Target: {habit.frequency} days/week • {stats.activeDaysFormatted}
                {habit.category ? ` • ${habit.category}` : ''}
              </Text>
            </View>
          </View>

          {/* Metric Grid */}
          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricBig}>{stats.weeklyCompletionRate}%</Text>
              <Text style={styles.metricLabel}>This Week</Text>
              <Text style={styles.metricSub}>
                {stats.isTargetAchievedThisWeek ? 'Target met' : 'In progress'}
              </Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricBig}>{stats.monthlyCompletionRate}%</Text>
              <Text style={styles.metricLabel}>This Month</Text>
              <Text style={styles.metricSub}>{period.monthName}</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricBig}>{stats.totalCompletionsAllTime}</Text>
              <Text style={styles.metricLabel}>All-Time Done</Text>
              <Text style={styles.metricSub}>Total check-ins</Text>
            </View>
          </View>
        </Card>

        {/* Interactive Month Completion Calendar */}
        <Card style={styles.card}>
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.cardSectionTitle}>Completion Calendar</Text>
            <View style={styles.monthNav}>
              <Pressable
                onPress={handlePrevMonth}
                style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <ChevronLeft size={18} color={colors.charcoal} />
              </Pressable>
              <Text style={styles.monthNavText}>{period.monthLabel}</Text>
              <Pressable
                onPress={handleNextMonth}
                style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <ChevronRight size={18} color={colors.charcoal} />
              </Pressable>
            </View>
          </View>

          {/* Weekday Labels Header */}
          <View style={styles.weekdayRow}>
            {weekdayLabels.map((label, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          {/* Calendar Grid Matrix */}
          <View style={styles.calendarGrid}>
            {leadingBlanks.map((_, i) => (
              <View key={`blank_${i}`} style={styles.calendarCell} />
            ))}

            {stats.monthlyCalendarDays.map((day) => {
              const isPastMissed = day.isScheduled && !day.isCompleted && !day.isFuture && !day.isToday;

              return (
                <View key={day.dateStr} style={styles.calendarCell}>
                  <View
                    style={[
                      styles.dayDot,
                      day.isCompleted && styles.dayDotCompleted,
                      isPastMissed && styles.dayDotMissed,
                      day.isToday && styles.dayDotToday,
                      !day.isScheduled && styles.dayDotOff,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumberText,
                        day.isCompleted && styles.dayNumberTextCompleted,
                        day.isToday && styles.dayNumberTextToday,
                        !day.isScheduled && styles.dayNumberTextOff,
                      ]}
                    >
                      {day.dayNumber}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dayDotCompleted]} />
              <Text style={styles.legendLabel}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dayDotMissed]} />
              <Text style={styles.legendLabel}>Missed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dayDotOff]} />
              <Text style={styles.legendLabel}>Rest / Off day</Text>
            </View>
          </View>
        </Card>

        {/* 14-Day Activity Log */}
        <Card style={styles.card}>
          <Text style={styles.cardSectionTitle}>Recent 14-Day Activity</Text>
          <Text style={styles.cardSubtext}>
            Daily log history for the last two weeks.
          </Text>

          <View style={styles.historyList}>
            {stats.recentHistory.map((item) => (
              <View key={item.dateStr} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Calendar size={14} color={colors.forest} />
                  <Text style={styles.historyDate}>{formatDisplayDate(item.dateStr)}</Text>
                </View>
                {item.completed ? (
                  <View style={styles.doneBadge}>
                    <CheckCircle2 size={13} color={colors.forest} />
                    <Text style={styles.doneText}>Completed</Text>
                  </View>
                ) : (
                  <Text style={styles.notDoneText}>Not logged</Text>
                )}
              </View>
            ))}
          </View>
        </Card>

        {/* Gentle Philosophy Banner */}
        <View style={styles.philosophyCard}>
          <Text style={styles.philosophyTitle}>Sustainable Consistency</Text>
          <Text style={styles.philosophyBody}>
            Habits are about gentle compounding, not rigid streaks. If you miss a scheduled day, simply acknowledge it without guilt and return to your routine naturally.
          </Text>
        </View>

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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  card: {
    marginBottom: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  habitIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  habitTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  habitMeta: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metricBig: {
    fontSize: 22,
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
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardSectionTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  cardSubtext: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  monthNavText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.charcoal,
  },
  pressed: {
    opacity: 0.7,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    width: 34,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  dayDotCompleted: {
    backgroundColor: colors.forest,
  },
  dayDotMissed: {
    backgroundColor: '#FDEEE9',
    borderWidth: 1,
    borderColor: '#E8D2C5',
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: colors.forest,
  },
  dayDotOff: {
    backgroundColor: 'transparent',
  },
  dayNumberText: {
    fontSize: 11,
    color: colors.charcoal,
    fontWeight: '500',
  },
  dayNumberTextCompleted: {
    color: colors.white,
    fontWeight: '700',
  },
  dayNumberTextToday: {
    fontWeight: '700',
    color: colors.forest,
  },
  dayNumberTextOff: {
    color: colors.muted,
    opacity: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  legendLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  historyList: {
    marginTop: spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  historyDate: {
    ...typography.caption,
    color: colors.charcoal,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.forest,
  },
  notDoneText: {
    fontSize: 11,
    color: colors.muted,
  },
  philosophyCard: {
    backgroundColor: colors.paper,
    borderLeftWidth: 3,
    borderLeftColor: colors.forest,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.base,
  },
  philosophyTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 4,
  },
  philosophyBody: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
  },
});
