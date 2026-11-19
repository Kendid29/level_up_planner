// Level Up Planner: Weekly Review Detail Screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Trash2, Edit3, Target, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { WeeklyReviewWithPriorities } from '@/types/models';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatDisplayDate } from '@/domain/dates';

export default function WeeklyReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getWeeklyReviewById, deleteWeeklyReview, goals } = useApp();

  const [review, setReview] = useState<WeeklyReviewWithPriorities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadReview(id);
    }
  }, [id]);

  const loadReview = async (reviewId: string) => {
    try {
      const data = await getWeeklyReviewById(reviewId);
      setReview(data);
    } catch {
      Alert.alert('Error', 'Could not load review details.');
    } finally {
      setIsLoading(false);
    }
  };

  const goalMap = new Map<string, string>();
  goals.forEach((g) => goalMap.set(g.id, g.title));

  if (!review && !isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Weekly Review" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Review not found.</Text>
          <Button title="Back to History" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={`Review: ${review?.period_key || ''}`}
        subtitle={
          review
            ? `${formatDisplayDate(review.week_start_date)} – ${formatDisplayDate(review.week_end_date)}`
            : ''
        }
        showBack
        onBack={() => router.back()}
        rightAction={
          <Button
            title=""
            variant="ghost"
            onPress={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 size={18} color="#8A4A36" />}
            style={styles.deleteBtn}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {review ? (
          <>
            {/* Overview Stats Card */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Week Metrics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{review.completion_percentage}%</Text>
                  <Text style={styles.statLabel}>Tasks Done</Text>
                  <Text style={styles.statSub}>
                    {review.completed_tasks} / {review.total_tasks}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{review.habit_completion_rate}%</Text>
                  <Text style={styles.statLabel}>Habit Rate</Text>
                  <Text style={styles.statSub}>Scheduled days</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{review.completed_milestones_count}</Text>
                  <Text style={styles.statLabel}>Milestones</Text>
                  <Text style={styles.statSub}>Achieved</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{review.active_goals_count}</Text>
                  <Text style={styles.statLabel}>Active Goals</Text>
                  <Text style={styles.statSub}>In progress</Text>
                </View>
              </View>
            </Card>

            {/* Reflection Questions Card */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Reflection</Text>

              <View style={styles.qaBlock}>
                <Text style={styles.questionText}>1. What went well this week?</Text>
                <Text style={styles.answerText}>
                  {review.reflection_went_well || 'No reflection recorded.'}
                </Text>
              </View>

              <View style={styles.qaBlock}>
                <Text style={styles.questionText}>2. What challenged me this week?</Text>
                <Text style={styles.answerText}>
                  {review.reflection_challenges || 'No reflection recorded.'}
                </Text>
              </View>

              <View style={styles.qaBlock}>
                <Text style={styles.questionText}>3. What did I learn?</Text>
                <Text style={styles.answerText}>
                  {review.reflection_learnings || 'No reflection recorded.'}
                </Text>
              </View>

              <View style={styles.qaBlock}>
                <Text style={styles.questionText}>4. What do I want to improve next week?</Text>
                <Text style={styles.answerText}>
                  {review.reflection_improvements || 'No reflection recorded.'}
                </Text>
              </View>
            </Card>

            {/* Top Priorities Card */}
            {review.priorities.length > 0 ? (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Next Week Priorities</Text>
                {review.priorities.map((p, idx) => (
                  <View key={p.id} style={styles.priorityItem}>
                    <View style={styles.priorityIndex}>
                      <Text style={styles.priorityIndexText}>#{idx + 1}</Text>
                    </View>
                    <View style={styles.priorityContent}>
                      <Text style={styles.priorityTitle}>{p.title}</Text>
                      {p.related_goal_id && goalMap.get(p.related_goal_id) ? (
                        <View style={styles.linkedGoalRow}>
                          <Target size={12} color={colors.forest} />
                          <Text style={styles.linkedGoalText}>
                            {goalMap.get(p.related_goal_id)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Review"
        message="Are you sure you want to delete this weekly review from your history?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={async () => {
          if (review) {
            await deleteWeeklyReview(review.id);
            setShowDeleteModal(false);
            router.back();
          }
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
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
  deleteBtn: {
    padding: spacing.xs,
    minHeight: 36,
  },
  card: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.forest,
  },
  statLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.charcoal,
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  qaBlock: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  questionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 4,
  },
  answerText: {
    ...typography.body,
    color: colors.charcoal,
    lineHeight: 22,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  priorityIndex: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forest,
  },
  priorityContent: {
    flex: 1,
  },
  priorityTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.charcoal,
  },
  linkedGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  linkedGoalText: {
    ...typography.caption,
    color: colors.forest,
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
