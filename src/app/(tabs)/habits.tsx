// Level Up Planner: Habits Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Repeat, BarChart2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { HabitCard } from '../../components/habits/HabitCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { HabitWithWeeklyProgress } from '../../types/models';

export default function HabitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habitsWithProgress, habitOverviewStats, toggleHabitLog, archiveHabit } = useApp();
  const [habitToArchive, setHabitToArchive] = useState<HabitWithWeeklyProgress | null>(null);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Habits"
        subtitle="Build calm, sustainable routines"
        rightAction={
          <Button
            title="Add Habit"
            onPress={() => router.push('/habits/new')}
            variant="primary"
            leftIcon={<Plus size={16} color={colors.white} strokeWidth={2.5} />}
            style={styles.headerBtn}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Habit Overview Stats (Phase 2) */}
        {habitsWithProgress.length > 0 ? (
          <Card style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsIconBox}>
                <BarChart2 size={16} color={colors.forest} />
              </View>
              <Text style={styles.statsTitle}>Consistency Overview</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statsItem}>
                <Text style={styles.statsBig}>{habitOverviewStats.totalActiveHabits}</Text>
                <Text style={styles.statsLabel}>Active Habits</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsBig}>{habitOverviewStats.weeklyCompletionRate}%</Text>
                <Text style={styles.statsLabel}>This Week</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsBig}>{habitOverviewStats.monthlyCompletionRate}%</Text>
                <Text style={styles.statsLabel}>This Month</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsBig}>{habitOverviewStats.habitsMeetingTargetCount}</Text>
                <Text style={styles.statsLabel}>Target Met</Text>
              </View>
            </View>
          </Card>
        ) : null}

        {habitsWithProgress.length > 0 ? (
          habitsWithProgress.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleDay={(dateStr) => toggleHabitLog(habit.id, dateStr)}
              onEdit={() => router.push(`/habits/${habit.id}/edit`)}
              onArchive={() => setHabitToArchive(habit)}
              onViewStats={() => router.push(`/habits/${habit.id}/stats` as any)}
            />
          ))
        ) : (
          <EmptyState
            icon={<Repeat size={44} color={colors.sage} strokeWidth={1.5} />}
            title="No active habits yet"
            description="Start small with one simple habit that supports your daily well-being."
            actionTitle="Add a Habit"
            onAction={() => router.push('/habits/new')}
          />
        )}
      </ScrollView>

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        visible={habitToArchive !== null}
        title="Archive Habit"
        message={`Are you sure you want to archive "${habitToArchive?.title}"? You can view or restore it later in settings.`}
        confirmLabel="Archive"
        isDestructive={false}
        onConfirm={async () => {
          if (habitToArchive) {
            await archiveHabit(habitToArchive.id);
            setHabitToArchive(null);
          }
        }}
        onCancel={() => setHabitToArchive(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  headerBtn: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    backgroundColor: colors.paper,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statsIconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsBig: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.forest,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.muted,
    marginTop: 2,
  },
});
