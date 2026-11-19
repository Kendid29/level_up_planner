// Level Up Planner: Weekly Review History Screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronRight, Plus, Sparkles, TrendingUp } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { WeeklyReview } from '@/types/models';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDisplayDate } from '@/domain/dates';

export default function WeeklyReviewHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { weeklyReviews } = useApp();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Review History"
        subtitle="Track your progress and insights over time"
        showBack
        onBack={() => router.back()}
        rightAction={
          <Button
            title="Start Review"
            variant="primary"
            onPress={() => router.push('/weekly-review' as any)}
            leftIcon={<Plus size={16} color={colors.white} strokeWidth={2.5} />}
            style={styles.headerBtn}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {weeklyReviews.length > 0 ? (
          weeklyReviews.map((review, index) => {
            const prevReview = weeklyReviews[index + 1];
            const hasPrev = Boolean(prevReview);
            const taskDiff = hasPrev
              ? review.completion_percentage - prevReview.completion_percentage
              : null;

            return (
              <Pressable
                key={review.id}
                onPress={() => router.push(`/weekly-review/${review.id}` as any)}
                style={({ pressed }) => [styles.reviewItem, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`Weekly Review for ${review.period_key}`}
              >
                <Card style={styles.card}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.periodBadge}>
                      <Calendar size={13} color={colors.forest} />
                      <Text style={styles.periodKey}>{review.period_key}</Text>
                    </View>
                    <View style={styles.dateRangeRow}>
                      <Text style={styles.dateRangeText}>
                        {formatDisplayDate(review.week_start_date)} –{' '}
                        {formatDisplayDate(review.week_end_date)}
                      </Text>
                      <ChevronRight size={18} color={colors.muted} />
                    </View>
                  </View>

                  {/* Summary Metric Chips */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricPillValue}>
                        {review.completion_percentage}%
                      </Text>
                      <Text style={styles.metricPillLabel}>Tasks</Text>
                    </View>

                    <View style={styles.metricPill}>
                      <Text style={styles.metricPillValue}>
                        {review.habit_completion_rate}%
                      </Text>
                      <Text style={styles.metricPillLabel}>Habits</Text>
                    </View>

                    <View style={styles.metricPill}>
                      <Text style={styles.metricPillValue}>
                        {review.completed_milestones_count}
                      </Text>
                      <Text style={styles.metricPillLabel}>Milestones</Text>
                    </View>

                    {taskDiff !== null ? (
                      <View
                        style={[
                          styles.diffBadge,
                          taskDiff >= 0 ? styles.diffPositive : styles.diffNeutral,
                        ]}
                      >
                        <TrendingUp size={11} color={taskDiff >= 0 ? colors.forest : colors.muted} />
                        <Text
                          style={[
                            styles.diffText,
                            taskDiff >= 0 ? styles.diffTextPositive : styles.diffTextNeutral,
                          ]}
                        >
                          {taskDiff >= 0 ? `+${taskDiff}%` : `${taskDiff}%`}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Reflection Snippet */}
                  {review.reflection_went_well ? (
                    <View style={styles.snippetContainer}>
                      <Sparkles size={12} color={colors.forest} />
                      <Text style={styles.snippetText} numberOfLines={2}>
                        "{review.reflection_went_well}"
                      </Text>
                    </View>
                  ) : null}
                </Card>
              </Pressable>
            );
          })
        ) : (
          <EmptyState
            icon={<Calendar size={44} color={colors.sage} strokeWidth={1.5} />}
            title="No weekly reviews yet"
            description="Take 5 minutes at the end of each week to reflect on your progress and set priorities."
            actionTitle="Start First Review"
            onAction={() => router.push('/weekly-review' as any)}
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
  headerBtn: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  reviewItem: {
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  card: {
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.paleSage,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  periodKey: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forest,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateRangeText: {
    ...typography.caption,
    color: colors.muted,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
    flexWrap: 'wrap',
  },
  metricPill: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 64,
  },
  metricPillValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forest,
  },
  metricPillLabel: {
    fontSize: 10,
    color: colors.muted,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  diffPositive: {
    backgroundColor: colors.paleSage,
  },
  diffNeutral: {
    backgroundColor: colors.beige,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '600',
  },
  diffTextPositive: {
    color: colors.forest,
  },
  diffTextNeutral: {
    color: colors.muted,
  },
  snippetContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  snippetText: {
    ...typography.caption,
    color: colors.charcoal,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 16,
  },
});
