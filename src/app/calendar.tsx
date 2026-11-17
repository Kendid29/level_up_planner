// Level Up Planner — Calendar Screen
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Button } from '@/components/common/Button';
import { formatLocalDate, parseLocalDate, formatDisplayDate } from '@/domain/dates';

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, toggleTask, profile } = useApp();

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedDateStr, setSelectedDateStr] = useState(formatLocalDate(new Date()));

  const weekStart = profile?.week_start ?? 1; // 1 = Monday, 0 = Sunday

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Month title
  const monthTitle = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Task map by date: dateStr -> Task[]
  const tasksByDate = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      if (t.due_at) {
        map.set(t.due_at, (map.get(t.due_at) || 0) + 1);
      }
    });
    return map;
  }, [tasks]);

  // Tasks for currently selected day
  const selectedDayTasks = useMemo(() => {
    return tasks.filter((t) => t.due_at === selectedDateStr);
  }, [tasks, selectedDateStr]);

  // Generate calendar grid matrix
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDaysInMonth = lastDay.getDate();

    // Day offset relative to weekStart
    let startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    let leadingBlanks = (startDayOfWeek - weekStart + 7) % 7;

    const days: ({ dayNumber: number; dateStr: string; isCurrentMonth: boolean } | null)[] = [];

    // Leading blanks
    for (let i = 0; i < leadingBlanks; i++) {
      days.push(null);
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentYear, currentMonth, weekStart]);

  const weekdays =
    weekStart === 1
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Calendar"
        subtitle="Schedule and timeline"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector Bar */}
        <Card style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable
              onPress={prevMonth}
              style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <ChevronLeft size={22} color={colors.charcoal} />
            </Pressable>

            <Text style={styles.monthTitleText}>{monthTitle}</Text>

            <Pressable
              onPress={nextMonth}
              style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <ChevronRight size={22} color={colors.charcoal} />
            </Pressable>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {weekdays.map((w, index) => (
              <Text key={index} style={styles.weekdayText}>
                {w}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((item, index) => {
              if (!item) {
                return <View key={`blank_${index}`} style={styles.dayCell} />;
              }
              const isSelected = item.dateStr === selectedDateStr;
              const isToday = item.dateStr === formatLocalDate(new Date());
              const taskCount = tasksByDate.get(item.dateStr) || 0;

              return (
                <Pressable
                  key={item.dateStr}
                  onPress={() => setSelectedDateStr(item.dateStr)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.dateStr}, ${taskCount} tasks`}
                >
                  <Text
                    style={[
                      styles.dayNumberText,
                      isSelected && styles.dayNumberTextSelected,
                      isToday && !isSelected && styles.dayNumberTextToday,
                    ]}
                  >
                    {item.dayNumber}
                  </Text>
                  {taskCount > 0 ? (
                    <View
                      style={[
                        styles.taskDot,
                        isSelected && styles.taskDotSelected,
                      ]}
                    />
                  ) : (
                    <View style={styles.taskDotPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Selected Day Agenda Header */}
        <View style={styles.agendaHeader}>
          <View>
            <Text style={styles.agendaTitle}>
              {formatDisplayDate(selectedDateStr)}
            </Text>
            <Text style={styles.agendaSubtitle}>
              {parseLocalDate(selectedDateStr).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <Button
            title="Add Task"
            onPress={() =>
              router.push({
                pathname: '/tasks/new',
                params: { dueDate: selectedDateStr },
              })
            }
            variant="secondary"
            leftIcon={<Plus size={16} color={colors.forest} strokeWidth={2.5} />}
            style={styles.smallBtn}
          />
        </View>

        {/* Agenda Tasks List */}
        {selectedDayTasks.length > 0 ? (
          selectedDayTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggle={() => toggleTask(t.id)}
              onPress={() => router.push(`/tasks/${t.id}/edit`)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <CalendarIcon size={32} color={colors.sage} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No tasks scheduled for this day.</Text>
            <Button
              title="Schedule a Task"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/tasks/new',
                  params: { dueDate: selectedDateStr },
                })
              }
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

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
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  calendarCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    padding: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthTitleText: {
    ...typography.h3,
    color: colors.charcoal,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.cream,
  },
  pressed: {
    opacity: 0.7,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 38,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: radius.sm,
  },
  dayCellSelected: {
    backgroundColor: colors.forest,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.forest,
  },
  dayNumberText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.charcoal,
  },
  dayNumberTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dayNumberTextToday: {
    color: colors.forest,
    fontWeight: '700',
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.forest,
    marginTop: 2,
  },
  taskDotSelected: {
    backgroundColor: colors.white,
  },
  taskDotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  agendaTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  agendaSubtitle: {
    ...typography.caption,
    color: colors.muted,
  },
  smallBtn: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
