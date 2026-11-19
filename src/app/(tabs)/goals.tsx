// Level Up Planner: Goals Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Target, Trophy, ChevronRight } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { GoalHorizon } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { HorizonTabs } from '../../components/goals/HorizonTabs';
import { GoalCard } from '../../components/goals/GoalCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goalsWithProgress, completedGoals } = useApp();
  const [selectedHorizon, setSelectedHorizon] = useState<GoalHorizon>('short');

  const filteredGoals = goalsWithProgress.filter(
    (g) => g.horizon === selectedHorizon
  );

  const horizonName =
    selectedHorizon === 'short'
      ? 'Short-term'
      : selectedHorizon === 'mid'
      ? 'Mid-term'
      : 'Long-term';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Goals"
        subtitle="Plan across horizons"
        rightAction={
          <Button
            title="Add Goal"
            onPress={() => router.push('/goals/new')}
            variant="primary"
            leftIcon={<Plus size={16} color={colors.white} strokeWidth={2.5} />}
            style={styles.headerBtn}
          />
        }
      />

      {/* Achievement History Access Banner */}
      <View style={styles.bannerContainer}>
        <Pressable
          onPress={() => router.push('/goals/achievements')}
          style={({ pressed }) => [
            styles.achievementsBanner,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="View Goal Achievement History"
        >
          <View style={styles.achievementsLeft}>
            <View style={styles.trophyIcon}>
              <Trophy size={16} color={colors.forest} strokeWidth={2.2} />
            </View>
            <Text style={styles.achievementsText}>Achievement History</Text>
          </View>
          <View style={styles.achievementsRight}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{completedGoals.length}</Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </View>
        </Pressable>
      </View>

      <HorizonTabs
        selectedHorizon={selectedHorizon}
        onSelect={setSelectedHorizon}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => router.push(`/goals/${goal.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon={<Target size={44} color={colors.sage} strokeWidth={1.5} />}
            title={`No ${horizonName} goals yet`}
            description="Break down what you want to achieve into clear milestones."
            actionTitle="Create a Goal"
            onAction={() => router.push('/goals/new')}
          />
        )}
      </ScrollView>
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
  bannerContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  achievementsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.7,
  },
  achievementsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trophyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementsText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
  },
  achievementsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countBadge: {
    backgroundColor: colors.beige,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  countBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.forest,
  },
});
