// Level Up Planner: Achievement Detail Keepsake Screen
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Calendar, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Chip } from '../../components/common/Chip';
import { Button } from '../../components/common/Button';
import { formatDisplayDate } from '../../domain/dates';

export default function AchievementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completedGoals, milestones } = useApp();

  const goal = completedGoals.find((g) => g.id === id);
  const goalMilestones = milestones.filter((m) => m.goal_id === id);

  if (!goal) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Achievement" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Achievement record not found.</Text>
          <Button title="Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const completedDateStr = goal.completed_at
    ? formatDisplayDate(goal.completed_at.slice(0, 10))
    : 'Completed';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Achievement"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Keepsake Certificate Card */}
        <Card style={styles.keepsakeCard}>
          <View style={styles.trophyWrapper}>
            <Trophy size={36} color={colors.forest} strokeWidth={2} />
          </View>

          <Text style={styles.badgeHeader}>GOAL ACHIEVED</Text>
          <Text style={styles.goalTitle}>{goal.title}</Text>

          <View style={styles.chipRow}>
            <Chip label={goal.category} />
            <Chip
              label={
                goal.horizon === 'short'
                  ? 'Short-term'
                  : goal.horizon === 'mid'
                  ? 'Mid-term'
                  : 'Long-term'
              }
              horizon={goal.horizon}
            />
          </View>

          <View style={styles.dateBadge}>
            <Calendar size={14} color={colors.forest} />
            <Text style={styles.dateBadgeText}>Honored on {completedDateStr}</Text>
          </View>

          {goal.completion_note ? (
            <View style={styles.reflectionBox}>
              <View style={styles.reflectionHeader}>
                <Sparkles size={16} color={colors.forest} />
                <Text style={styles.reflectionTitle}>Personal Reflection</Text>
              </View>
              <Text style={styles.reflectionBody}>
                &ldquo;{goal.completion_note}&rdquo;
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Milestone Milestones Accomplished */}
        {goalMilestones.length > 0 && (
          <View style={styles.milestoneSection}>
            <Text style={styles.sectionTitle}>Completed Milestones</Text>
            <Text style={styles.sectionSubtitle}>Checkpoints reached on this journey</Text>

            {goalMilestones.map((ms) => (
              <Card key={ms.id} style={styles.milestoneCard}>
                <View style={styles.milestoneRow}>
                  <CheckCircle2 size={18} color={colors.forest} />
                  <Text style={styles.milestoneTitle}>{ms.title}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Button
            title="View Full Goal Details"
            variant="secondary"
            onPress={() => router.push(`/goals/${goal.id}`)}
          />
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  keepsakeCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.sage,
    marginBottom: spacing.xl,
  },
  trophyWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  badgeHeader: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  goalTitle: {
    ...typography.h2,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  dateBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.forest,
  },
  reflectionBox: {
    width: '100%',
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.forest,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  reflectionTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.forest,
  },
  reflectionBody: {
    ...typography.body,
    fontStyle: 'italic',
    color: colors.charcoal,
    lineHeight: 22,
  },
  milestoneSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  milestoneCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestoneTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.charcoal,
  },
  actionRow: {
    marginTop: spacing.md,
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
    marginBottom: spacing.lg,
  },
});
