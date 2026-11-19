// Level Up Planner: Goal Achievement History Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Calendar, Award, ChevronRight, Sparkles } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { GoalHorizon } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Chip } from '../../components/common/Chip';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDisplayDate } from '../../domain/dates';

export default function GoalAchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completedGoals } = useApp();
  const [selectedHorizon, setSelectedHorizon] = useState<GoalHorizon | 'all'>('all');

  const filteredGoals = completedGoals.filter((g) => {
    if (selectedHorizon === 'all') return true;
    return g.horizon === selectedHorizon;
  });

  const shortCount = completedGoals.filter((g) => g.horizon === 'short').length;
  const midCount = completedGoals.filter((g) => g.horizon === 'mid').length;
  const longCount = completedGoals.filter((g) => g.horizon === 'long').length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Achievement History"
        subtitle="Honoring your completed ambitions"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Achievement Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.trophyIconWrapper}>
            <Trophy size={28} color={colors.forest} strokeWidth={2} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.totalCountText}>{completedGoals.length}</Text>
            <Text style={styles.totalCountLabel}>Goals Achieved to Date</Text>
          </View>

          <View style={styles.horizonBreakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownNumber}>{shortCount}</Text>
              <Text style={styles.breakdownLabel}>Short-term</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownNumber}>{midCount}</Text>
              <Text style={styles.breakdownLabel}>Mid-term</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownNumber}>{longCount}</Text>
              <Text style={styles.breakdownLabel}>Long-term</Text>
            </View>
          </View>
        </Card>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['all', 'short', 'mid', 'long'] as const).map((h) => {
            const label =
              h === 'all'
                ? 'All Goals'
                : h === 'short'
                ? 'Short-term'
                : h === 'mid'
                ? 'Mid-term'
                : 'Long-term';
            return (
              <Chip
                key={h}
                label={label}
                selected={selectedHorizon === h}
                onPress={() => setSelectedHorizon(h)}
              />
            );
          })}
        </View>

        {/* Goals List */}
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const dateStr = goal.completed_at
              ? formatDisplayDate(goal.completed_at.slice(0, 10))
              : 'Completed';

            return (
              <Pressable
                key={goal.id}
                onPress={() => router.push(`/goals/${goal.id}`)}
                style={({ pressed }) => [styles.goalCardWrapper, pressed && styles.cardPressed]}
                accessibilityRole="button"
                accessibilityLabel={`View ${goal.title}`}
              >
                <Card style={styles.goalCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.chipsGroup}>
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
                    <View style={styles.completedBadge}>
                      <Award size={14} color={colors.forest} strokeWidth={2} />
                      <Text style={styles.completedBadgeText}>{dateStr}</Text>
                    </View>
                  </View>

                  <Text style={styles.goalTitle}>{goal.title}</Text>

                  {goal.completion_note ? (
                    <View style={styles.noteBox}>
                      <Sparkles size={14} color={colors.forest} style={{ marginTop: 2 }} />
                      <Text style={styles.noteText} numberOfLines={2}>
                        &ldquo;{goal.completion_note}&rdquo;
                      </Text>
                    </View>
                  ) : goal.description ? (
                    <Text style={styles.goalDescription} numberOfLines={2}>
                      {goal.description}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <View style={styles.dateRow}>
                      <Calendar size={13} color={colors.muted} />
                      <Text style={styles.dateLabel}>Achieved {dateStr}</Text>
                    </View>
                    <View style={styles.detailLink}>
                      <Text style={styles.detailLinkText}>View Details</Text>
                      <ChevronRight size={14} color={colors.forest} />
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })
        ) : (
          <EmptyState
            icon={<Trophy size={48} color={colors.sage} strokeWidth={1.5} />}
            title="No Achieved Goals Yet"
            description="When you complete your milestones and accomplish a goal, your achievements and reflections will be honored here."
            actionTitle="View Active Goals"
            onAction={() => router.push('/(tabs)/goals')}
          />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  summaryCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.base,
    backgroundColor: colors.paper,
  },
  trophyIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryContent: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalCountText: {
    ...typography.h1,
    color: colors.charcoal,
    fontSize: 36,
    lineHeight: 42,
  },
  totalCountLabel: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '500',
  },
  horizonBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownNumber: {
    ...typography.h3,
    color: colors.charcoal,
  },
  breakdownLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.muted,
  },
  breakdownDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.line,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  goalCardWrapper: {
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
  },
  goalCard: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chipsGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.paleSage,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  completedBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.forest,
  },
  goalTitle: {
    ...typography.h3,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  goalDescription: {
    ...typography.bodySmall,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  noteBox: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.forest,
    marginVertical: spacing.sm,
  },
  noteText: {
    ...typography.caption,
    fontStyle: 'italic',
    color: colors.charcoal,
    flex: 1,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.muted,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.forest,
  },
});
