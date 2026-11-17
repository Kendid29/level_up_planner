// Level Up Planner: Goals Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Target } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { GoalHorizon } from '../../types/models';
import { colors, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { HorizonTabs } from '../../components/goals/HorizonTabs';
import { GoalCard } from '../../components/goals/GoalCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goalsWithProgress } = useApp();
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
});
