// Level Up Planner: Weekly Review Guided Flow
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Target,
  Clock,
  History,
  Check,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { Task, Goal } from '@/types/models';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Chip } from '@/components/common/Chip';
import { calculateWeeklyStats } from '@/domain/planning';
import { getWeekPeriod, getNextWeekPeriod, formatDisplayDate } from '@/domain/dates';

export default function WeeklyReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    goals,
    milestones,
    habits,
    habitLogs,
    weeklyReviews,
    saveWeeklyReview,
    updateTask,
    deleteTask,
    profile,
  } = useApp();

  const weekStart = profile?.week_start ?? 1;
  const currentWeek = useMemo(() => getWeekPeriod(new Date(), weekStart), [weekStart]);
  const nextWeek = useMemo(() => getNextWeekPeriod(new Date(), weekStart), [weekStart]);

  // Current weekly stats computed from real database data
  const stats = useMemo(() => {
    return calculateWeeklyStats(
      currentWeek.weekStartDate,
      currentWeek.weekEndDate,
      tasks,
      goals,
      milestones,
      habits,
      habitLogs
    );
  }, [currentWeek, tasks, goals, milestones, habits, habitLogs]);

  // Step state: 1 = Overview, 2 = Reflection, 3 = Next Week Planning
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Reflection questions state
  const [reflectionWentWell, setReflectionWentWell] = useState('');
  const [reflectionChallenges, setReflectionChallenges] = useState('');
  const [reflectionLearnings, setReflectionLearnings] = useState('');
  const [reflectionImprovements, setReflectionImprovements] = useState('');

  // Top 3 Priorities for next week
  const [priority1, setPriority1] = useState('');
  const [priority1Goal, setPriority1Goal] = useState<string | null>(null);
  const [priority2, setPriority2] = useState('');
  const [priority2Goal, setPriority2Goal] = useState<string | null>(null);
  const [priority3, setPriority3] = useState('');
  const [priority3Goal, setPriority3Goal] = useState<string | null>(null);

  // Rolled-over tasks tracking
  const [rescheduledTaskIds, setRescheduledTaskIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Check if existing review exists for this week to preload
  useEffect(() => {
    const existing = weeklyReviews.find((r) => r.period_key === currentWeek.periodKey);
    if (existing) {
      setReflectionWentWell(existing.reflection_went_well || '');
      setReflectionChallenges(existing.reflection_challenges || '');
      setReflectionLearnings(existing.reflection_learnings || '');
      setReflectionImprovements(existing.reflection_improvements || '');
    }
  }, [weeklyReviews, currentWeek.periodKey]);

  // Handle task rollover (reschedule to next Monday explicitly with user intent)
  const handleRescheduleTask = async (task: Task) => {
    try {
      await updateTask(task.id, {
        due_at: nextWeek.weekStartDate,
      });
      setRescheduledTaskIds((prev) => new Set(prev).add(task.id));
    } catch {
      Alert.alert('Error', 'Could not reschedule task.');
    }
  };

  // Final review save
  const handleSaveReview = async () => {
    setIsSaving(true);
    try {
      const prioritiesToSave: { title: string; related_goal_id: string | null }[] = [];
      if (priority1.trim()) {
        prioritiesToSave.push({ title: priority1.trim(), related_goal_id: priority1Goal });
      }
      if (priority2.trim()) {
        prioritiesToSave.push({ title: priority2.trim(), related_goal_id: priority2Goal });
      }
      if (priority3.trim()) {
        prioritiesToSave.push({ title: priority3.trim(), related_goal_id: priority3Goal });
      }

      await saveWeeklyReview(
        {
          user_id: profile?.id || 'local_user_default',
          week_start_date: currentWeek.weekStartDate,
          week_end_date: currentWeek.weekEndDate,
          period_key: currentWeek.periodKey,
          total_tasks: stats.totalTasks,
          completed_tasks: stats.completedTasks,
          completion_percentage: stats.completionPercentage,
          active_goals_count: stats.activeGoalsCount,
          completed_milestones_count: stats.completedMilestonesCount,
          habit_completion_rate: stats.habitCompletionRate,
          reflection_went_well: reflectionWentWell.trim() || null,
          reflection_challenges: reflectionChallenges.trim() || null,
          reflection_learnings: reflectionLearnings.trim() || null,
          reflection_improvements: reflectionImprovements.trim() || null,
        },
        prioritiesToSave
      );

      Alert.alert(
        'Weekly Review Complete',
        'Your reflection and next week plan have been saved. Keep building steady momentum.',
        [
          {
            text: 'View History',
            onPress: () => router.replace('/weekly-review/history' as any),
          },
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save weekly review.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader
        title="Weekly Review"
        subtitle={`Period: ${currentWeek.label}`}
        showBack
        onBack={() => router.back()}
        rightAction={
          <Pressable
            onPress={() => router.push('/weekly-review/history' as any)}
            style={styles.historyBtn}
            accessibilityRole="button"
            accessibilityLabel="View Review History"
          >
            <History size={18} color={colors.forest} />
          </Pressable>
        }
      />

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepTrack}>
          <View
            style={[
              styles.stepProgress,
              { width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' },
            ]}
          />
        </View>
        <View style={styles.stepTextRow}>
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>
            1. Overview
          </Text>
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>
            2. Reflection
          </Text>
          <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>
            3. Planning
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: WEEKLY OVERVIEW */}
        {step === 1 && (
          <View>
            <Card style={styles.card}>
              <Text style={styles.cardSectionTitle}>This Week's Summary</Text>
              <Text style={styles.cardSubtext}>
                Here is an honest snapshot of your actions from {currentWeek.label}.
              </Text>

              {/* Metric Grid */}
              <View style={styles.metricGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricNumber}>{stats.completionPercentage}%</Text>
                  <Text style={styles.metricLabel}>Tasks Completed</Text>
                  <Text style={styles.metricSub}>
                    {stats.completedTasks} of {stats.totalTasks}
                  </Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricNumber}>{stats.completedMilestonesCount}</Text>
                  <Text style={styles.metricLabel}>Milestones Reached</Text>
                  <Text style={styles.metricSub}>Goal checkpoints</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricNumber}>{stats.habitCompletionRate}%</Text>
                  <Text style={styles.metricLabel}>Habit Consistency</Text>
                  <Text style={styles.metricSub}>Active daily habits</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricNumber}>{stats.activeGoalsCount}</Text>
                  <Text style={styles.metricLabel}>Active Goals</Text>
                  <Text style={styles.metricSub}>Currently in progress</Text>
                </View>
              </View>
            </Card>

            {/* Milestones Reached */}
            {stats.completedMilestones.length > 0 ? (
              <Card style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Sparkles size={16} color={colors.forest} />
                  <Text style={[styles.cardSectionTitle, { marginLeft: spacing.xs }]}>
                    Milestones Achieved
                  </Text>
                </View>
                {stats.completedMilestones.map((m) => (
                  <View key={m.id} style={styles.milestoneItem}>
                    <CheckCircle2 size={16} color={colors.forest} />
                    <Text style={styles.milestoneText}>{m.title}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {/* Active Goals */}
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Target size={16} color={colors.forest} />
                <Text style={[styles.cardSectionTitle, { marginLeft: spacing.xs }]}>
                  Active Goals in Motion
                </Text>
              </View>
              {stats.activeGoals.map((g) => (
                <View key={g.id} style={styles.goalRow}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{g.title}</Text>
                    <Text style={styles.goalMeta}>
                      {g.category} • {g.completedMilestones}/{g.totalMilestones} milestones
                    </Text>
                  </View>
                  {g.progressPercent !== null ? (
                    <Text style={styles.goalPercent}>{g.progressPercent}%</Text>
                  ) : (
                    <Text style={styles.goalNoMilestone}>In motion</Text>
                  )}
                </View>
              ))}
            </Card>

            <Button
              title="Continue to Reflection"
              variant="primary"
              onPress={() => setStep(2)}
              rightIcon={<ArrowRight size={16} color={colors.white} />}
              style={styles.stepBtn}
            />
          </View>
        )}

        {/* STEP 2: WEEKLY REFLECTION (4 QUESTIONS) */}
        {step === 2 && (
          <View>
            <Card style={styles.card}>
              <Text style={styles.cardSectionTitle}>Weekly Reflection</Text>
              <Text style={styles.cardSubtext}>
                No pressure, no guilt. Take a quiet breath and acknowledge your journey.
              </Text>

              <Input
                label="1. What went well this week?"
                placeholder="Wins, moments of focus, or small positive steps"
                value={reflectionWentWell}
                onChangeText={setReflectionWentWell}
                multiline
                numberOfLines={3}
                style={styles.reflectionInput}
              />

              <Input
                label="2. What challenged me this week?"
                placeholder="Obstacles, distractions, energy dips, or surprises"
                value={reflectionChallenges}
                onChangeText={setReflectionChallenges}
                multiline
                numberOfLines={3}
                style={styles.reflectionInput}
              />

              <Input
                label="3. What did I learn?"
                placeholder="Insights about my schedule, habits, or mental clarity"
                value={reflectionLearnings}
                onChangeText={setReflectionLearnings}
                multiline
                numberOfLines={3}
                style={styles.reflectionInput}
              />

              <Input
                label="4. What do I want to improve next week?"
                placeholder="One or two gentle adjustments for the upcoming week"
                value={reflectionImprovements}
                onChangeText={setReflectionImprovements}
                multiline
                numberOfLines={3}
                style={styles.reflectionInput}
              />
            </Card>

            <View style={styles.buttonRow}>
              <Button
                title="Back"
                variant="secondary"
                onPress={() => setStep(1)}
                leftIcon={<ArrowLeft size={16} color={colors.charcoal} />}
                style={styles.flexBtn}
              />
              <Button
                title="Next: Planning"
                variant="primary"
                onPress={() => setStep(3)}
                rightIcon={<ArrowRight size={16} color={colors.white} />}
                style={styles.flexBtn}
              />
            </View>
          </View>
        )}

        {/* STEP 3: NEXT WEEK PLANNING & ROLLOVER */}
        {step === 3 && (
          <View>
            {/* Top 3 Priorities for Next Week */}
            <Card style={styles.card}>
              <Text style={styles.cardSectionTitle}>Top 3 Priorities for Next Week</Text>
              <Text style={styles.cardSubtext}>
                Identify the three most meaningful focal points for {nextWeek.label}.
              </Text>

              {/* Priority 1 */}
              <Input
                label="Priority #1"
                placeholder="e.g. Complete presentation draft"
                value={priority1}
                onChangeText={setPriority1}
              />
              <Text style={styles.miniLabel}>Link to Goal (Optional)</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="None"
                  selected={priority1Goal === null}
                  onPress={() => setPriority1Goal(null)}
                />
                {goals.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.title}
                    selected={priority1Goal === g.id}
                    onPress={() => setPriority1Goal(g.id)}
                  />
                ))}
              </View>

              {/* Priority 2 */}
              <Input
                label="Priority #2"
                placeholder="e.g. Schedule health checkup"
                value={priority2}
                onChangeText={setPriority2}
              />
              <Text style={styles.miniLabel}>Link to Goal (Optional)</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="None"
                  selected={priority2Goal === null}
                  onPress={() => setPriority2Goal(null)}
                />
                {goals.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.title}
                    selected={priority2Goal === g.id}
                    onPress={() => setPriority2Goal(g.id)}
                  />
                ))}
              </View>

              {/* Priority 3 */}
              <Input
                label="Priority #3"
                placeholder="e.g. 4 workout sessions"
                value={priority3}
                onChangeText={setPriority3}
              />
              <Text style={styles.miniLabel}>Link to Goal (Optional)</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="None"
                  selected={priority3Goal === null}
                  onPress={() => setPriority3Goal(null)}
                />
                {goals.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.title}
                    selected={priority3Goal === g.id}
                    onPress={() => setPriority3Goal(g.id)}
                  />
                ))}
              </View>
            </Card>

            {/* Pending Tasks Rollover */}
            {stats.pendingTasksList.length > 0 ? (
              <Card style={styles.card}>
                <Text style={styles.cardSectionTitle}>Uncompleted Tasks</Text>
                <Text style={styles.cardSubtext}>
                  Choose whether to reschedule these tasks to next week, keep their date, or delete them. Deadlines are never changed automatically.
                </Text>

                {stats.pendingTasksList.map((task) => {
                  const isRescheduled = rescheduledTaskIds.has(task.id);
                  return (
                    <View key={task.id} style={styles.rolloverItem}>
                      <View style={styles.rolloverInfo}>
                        <Text style={styles.rolloverTitle}>{task.title}</Text>
                        <Text style={styles.rolloverDue}>
                          Due: {formatDisplayDate(task.due_at) || 'No date'}
                        </Text>
                      </View>
                      <View style={styles.rolloverActions}>
                        {isRescheduled ? (
                          <View style={styles.rescheduledBadge}>
                            <Check size={12} color={colors.forest} />
                            <Text style={styles.rescheduledText}>Moved to next week</Text>
                          </View>
                        ) : (
                          <Button
                            title="Move to Next Week"
                            variant="secondary"
                            onPress={() => handleRescheduleTask(task)}
                            style={styles.rolloverBtn}
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </Card>
            ) : null}

            <View style={styles.buttonRow}>
              <Button
                title="Back"
                variant="secondary"
                onPress={() => setStep(2)}
                leftIcon={<ArrowLeft size={16} color={colors.charcoal} />}
                style={styles.flexBtn}
              />
              <Button
                title="Complete Review"
                variant="primary"
                onPress={handleSaveReview}
                loading={isSaving}
                rightIcon={<Check size={16} color={colors.white} />}
                style={styles.flexBtn}
              />
            </View>
          </View>
        )}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  historyBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.paleSage,
  },
  stepIndicatorContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  stepTrack: {
    height: 4,
    backgroundColor: colors.beige,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  stepProgress: {
    height: '100%',
    backgroundColor: colors.forest,
    borderRadius: radius.full,
  },
  stepTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  stepLabelActive: {
    color: colors.forest,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  card: {
    marginBottom: spacing.base,
  },
  cardSectionTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  cardSubtext: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metricNumber: {
    fontSize: 24,
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
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  milestoneText: {
    ...typography.bodySmall,
    color: colors.charcoal,
    flex: 1,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.charcoal,
  },
  goalMeta: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  goalPercent: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.forest,
  },
  goalNoMilestone: {
    ...typography.caption,
    color: colors.muted,
  },
  stepBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  reflectionInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  miniLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rolloverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.sm,
  },
  rolloverInfo: {
    flex: 1,
  },
  rolloverTitle: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.charcoal,
  },
  rolloverDue: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  rolloverActions: {
    alignItems: 'flex-end',
  },
  rolloverBtn: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rescheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.paleSage,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  rescheduledText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.forest,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  flexBtn: {
    flex: 1,
  },
});
