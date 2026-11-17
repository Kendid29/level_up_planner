// Level Up Planner: Habits Screen
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Repeat } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { HabitCard } from '../../components/habits/HabitCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { HabitWithWeeklyProgress } from '../../types/models';

export default function HabitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habitsWithProgress, toggleHabitLog, archiveHabit } = useApp();
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
        {habitsWithProgress.length > 0 ? (
          habitsWithProgress.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleDay={(dateStr) => toggleHabitLog(habit.id, dateStr)}
              onEdit={() => router.push(`/habits/${habit.id}/edit`)}
              onArchive={() => setHabitToArchive(habit)}
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
});
