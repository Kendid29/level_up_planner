// Level Up Planner: Home Dashboard Screen
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  User,
  Plus,
  CheckCircle2,
  Target,
  CheckSquare,
  Repeat,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { TaskItem } from '../../components/tasks/TaskItem';
import { GoalCard } from '../../components/goals/GoalCard';
import { HabitCard } from '../../components/habits/HabitCard';
import { EmptyState } from '../../components/common/EmptyState';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    isLoading,
    profile,
    dashboardSummary,
    toggleTask,
    toggleHabitLog,
  } = useApp();

  // Check onboarding
  useEffect(() => {
    if (!isLoading && profile && profile.onboarding_completed === 0) {
      router.replace('/onboarding');
    }
  }, [isLoading, profile, router]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  const displayName = profile?.display_name || 'Friend';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.headerTitles}>
          <Text style={styles.greetingText}>
            {dashboardSummary.greeting}, {displayName}
          </Text>
          <Text style={styles.dateText}>{dashboardSummary.currentDateFormatted}</Text>
        </View>

        <View style={styles.topActions}>
          <Pressable
            onPress={() => router.push('/calendar')}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open Calendar"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Calendar size={22} color={colors.charcoal} strokeWidth={2} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open Profile & Settings"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <User size={22} color={colors.charcoal} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressCardTitle}>Today's Focus</Text>
              <Text style={styles.progressCardSubtitle}>
                {dashboardSummary.tasksTotalToday === 0
                  ? 'No tasks scheduled for today yet'
                  : `${dashboardSummary.tasksCompletedToday} of ${dashboardSummary.tasksTotalToday} tasks completed`}
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentBadgeText}>
                {dashboardSummary.todayProgressPercent}%
              </Text>
            </View>
          </View>
          <ProgressBar
            progressPercent={dashboardSummary.todayProgressPercent}
            showPercentText={false}
          />
        </Card>

        {/* Overdue Tasks Alert (if any) */}
        {dashboardSummary.overdueTasksCount > 0 ? (
          <Pressable
            onPress={() => router.push('/tasks')}
            style={({ pressed }) => [styles.overdueBanner, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`${dashboardSummary.overdueTasksCount} overdue tasks. Tap to review.`}
          >
            <View style={styles.overdueLeft}>
              <AlertCircle size={18} color="#8A4A36" />
              <Text style={styles.overdueBannerText}>
                {dashboardSummary.overdueTasksCount} task{dashboardSummary.overdueTasksCount > 1 ? 's' : ''} past due. Reschedule or check off.
              </Text>
            </View>
            <ChevronRight size={18} color="#8A4A36" />
          </Pressable>
        ) : null}

        {/* Weekly Review Prompt Banner */}
        <Card style={styles.weeklyReviewCard}>
          <View style={styles.weeklyReviewHeader}>
            <View style={styles.weeklyReviewIcon}>
              <Sparkles size={20} color={colors.forest} />
            </View>
            <View style={styles.weeklyReviewTextContainer}>
              <Text style={styles.weeklyReviewTitle}>
                {dashboardSummary.weeklyReviewPrompt?.isReviewed
                  ? 'Weekly Review Completed'
                  : 'Weekly Review'}
              </Text>
              <Text style={styles.weeklyReviewSubtitle}>
                {dashboardSummary.weeklyReviewPrompt?.isReviewed
                  ? 'Your reflection and intentions for this week are saved.'
                  : 'Reflect on wins, challenges, and plan your next week.'}
              </Text>
            </View>
          </View>
          <Button
            title={
              dashboardSummary.weeklyReviewPrompt?.isReviewed
                ? 'View Review History'
                : 'Start Weekly Review'
            }
            variant={dashboardSummary.weeklyReviewPrompt?.isReviewed ? 'secondary' : 'primary'}
            onPress={() =>
              dashboardSummary.weeklyReviewPrompt?.isReviewed
                ? router.push('/weekly-review/history' as any)
                : router.push('/weekly-review' as any)
            }
            style={styles.weeklyReviewBtn}
          />
        </Card>

        {/* Quick Add Actions */}
        <View style={styles.quickAddRow}>
          <Pressable
            onPress={() => router.push('/tasks/new')}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Add Task"
          >
            <View style={[styles.quickIconBg, { backgroundColor: colors.paleSage }]}>
              <CheckSquare size={18} color={colors.forest} strokeWidth={2.2} />
            </View>
            <Text style={styles.quickLabel}>New Task</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/goals/new')}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Add Goal"
          >
            <View style={[styles.quickIconBg, { backgroundColor: colors.softBlue }]}>
              <Target size={18} color={colors.charcoal} strokeWidth={2.2} />
            </View>
            <Text style={styles.quickLabel}>New Goal</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/habits/new')}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Add Habit"
          >
            <View style={[styles.quickIconBg, { backgroundColor: '#F5ECE3' }]}>
              <Repeat size={18} color={colors.warning} strokeWidth={2.2} />
            </View>
            <Text style={styles.quickLabel}>New Habit</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/notes/new')}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Add Note"
          >
            <View style={[styles.quickIconBg, { backgroundColor: colors.beige }]}>
              <FileText size={18} color={colors.charcoal} strokeWidth={2.2} />
            </View>
            <Text style={styles.quickLabel}>New Note</Text>
          </Pressable>
        </View>

        {/* Priorities Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Priorities</Text>
          <Pressable
            onPress={() => router.push('/tasks')}
            accessibilityRole="button"
            accessibilityLabel="View all tasks"
          >
            <Text style={styles.seeAllText}>View All</Text>
          </Pressable>
        </View>

        {dashboardSummary.prioritiesToday.length > 0 ? (
          dashboardSummary.prioritiesToday.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onPress={() => router.push(`/tasks/${task.id}/edit`)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>
              No high-priority tasks flagged for today.
            </Text>
          </Card>
        )}

        {/* Upcoming Deadlines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        </View>

        {dashboardSummary.upcomingDeadlines.length > 0 ? (
          dashboardSummary.upcomingDeadlines.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onPress={() => router.push(`/tasks/${task.id}/edit`)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>
              Your upcoming agenda is clear.
            </Text>
          </Card>
        )}

        {/* Active Goals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <Pressable
            onPress={() => router.push('/goals')}
            accessibilityRole="button"
            accessibilityLabel="View all goals"
          >
            <Text style={styles.seeAllText}>View All</Text>
          </Pressable>
        </View>

        {dashboardSummary.activeGoals.length > 0 ? (
          dashboardSummary.activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => router.push(`/goals/${goal.id}`)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>
              No active goals yet. Every big journey begins with one clear target.
            </Text>
            <Button
              title="Create a Goal"
              variant="secondary"
              onPress={() => router.push('/goals/new')}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Habits Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Habits</Text>
          <Pressable
            onPress={() => router.push('/habits')}
            accessibilityRole="button"
            accessibilityLabel="View all habits"
          >
            <Text style={styles.seeAllText}>View All</Text>
          </Pressable>
        </View>

        {dashboardSummary.habitsOverview.length > 0 ? (
          dashboardSummary.habitsOverview.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleDay={(dateStr) => toggleHabitLog(habit.id, dateStr)}
              onEdit={() => router.push(`/habits/${habit.id}/edit`)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>
              No habits created yet. Build routines at your own comfortable pace.
            </Text>
            <Button
              title="Add a Habit"
              variant="secondary"
              onPress={() => router.push('/habits/new')}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cream,
  },
  headerTitles: {
    flex: 1,
  },
  greetingText: {
    ...typography.h2,
    color: colors.charcoal,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.base,
    backgroundColor: colors.paper,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressCardTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  progressCardSubtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  percentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: colors.paleSage,
  },
  percentBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.forest,
  },
  quickAddRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickIconBg: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.charcoal,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 18,
    color: colors.charcoal,
  },
  seeAllText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.forest,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyCardText: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDEEE9',
    borderWidth: 1,
    borderColor: '#E8D2C5',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  overdueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    marginRight: spacing.xs,
  },
  overdueBannerText: {
    ...typography.caption,
    fontWeight: '600',
    color: '#8A4A36',
    flex: 1,
  },
  weeklyReviewCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    backgroundColor: '#F4F7F2',
    borderWidth: 1,
    borderColor: colors.paleSage,
  },
  weeklyReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  weeklyReviewIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyReviewTextContainer: {
    flex: 1,
  },
  weeklyReviewTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
  },
  weeklyReviewSubtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  weeklyReviewBtn: {
    marginTop: spacing.xs,
  },
});
