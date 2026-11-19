// Level Up Planner: Goal Details Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Target,
  CheckSquare,
  Trophy,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Chip } from '../../components/common/Chip';
import { ProgressBar } from '../../components/common/ProgressBar';
import { MilestoneItem } from '../../components/goals/MilestoneItem';
import { TaskItem } from '../../components/tasks/TaskItem';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatDisplayDate } from '../../domain/dates';
import { calculateGoalProgress } from '../../domain/planning';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    goals,
    milestones,
    tasks,
    toggleMilestone,
    deleteMilestone,
    toggleTask,
    deleteGoal,
    completeGoal,
    reopenGoal,
  } = useApp();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null);

  // Achievement Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Reopen Modal state
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  const goal = goals.find((g) => g.id === id);
  const goalMilestones = milestones.filter((m) => m.goal_id === id);
  const goalTasks = tasks.filter((t) => t.goal_id === id);
  const progressPercent = calculateGoalProgress(goalMilestones);

  if (!goal) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Goal Details" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Goal not found or has been removed.</Text>
          <Button title="Back to Goals" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const horizonLabel =
    goal.horizon === 'short'
      ? 'Short-term'
      : goal.horizon === 'mid'
      ? 'Mid-term'
      : 'Long-term';

  const completedMilestoneCount = goalMilestones.filter(
    (m) => m.completed_at !== null
  ).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={goal.title}
        showBack
        onBack={() => router.back()}
        rightAction={
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push(`/goals/${goal.id}/edit`)}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Edit Goal"
            >
              <Edit2 size={20} color={colors.charcoal} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => setShowDeleteModal(true)}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Delete Goal"
            >
              <Trash2 size={20} color={colors.error} strokeWidth={2} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Overview Card */}
        <Card style={styles.card}>
          {goal.status === 'completed' ? (
            <View style={styles.achievementBanner}>
              <View style={styles.achievementLeft}>
                <View style={styles.trophyIconCircle}>
                  <Trophy size={18} color={colors.forest} strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.achievementTitle}>Goal Achieved!</Text>
                  <Text style={styles.achievementSubtitle}>
                    Honored {goal.completed_at ? formatDisplayDate(goal.completed_at.slice(0, 10)) : 'Recently'}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setShowReopenModal(true)}
                style={({ pressed }) => [styles.reopenBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Reopen Goal"
              >
                <RotateCcw size={14} color={colors.muted} />
                <Text style={styles.reopenBtnText}>Reopen</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.chipRow}>
            <Chip label={goal.category} />
            <Chip label={horizonLabel} horizon={goal.horizon} />
            <Chip label={goal.priority.toUpperCase()} priority={goal.priority} />
          </View>

          {goal.description ? (
            <Text style={styles.description}>{goal.description}</Text>
          ) : null}

          {goal.completion_note ? (
            <View style={styles.noteBox}>
              <Sparkles size={14} color={colors.forest} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteLabel}>Completion Reflection</Text>
                <Text style={styles.noteText}>&ldquo;{goal.completion_note}&rdquo;</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.dateRow}>
            <Calendar size={16} color={colors.muted} strokeWidth={2} />
            <Text style={styles.dateText}>
              Target: {formatDisplayDate(goal.target_date) || 'No deadline'}
            </Text>
          </View>

          <View style={styles.progressBox}>
            <ProgressBar
              progressPercent={progressPercent}
              label={
                goalMilestones.length === 0
                  ? 'No milestones defined'
                  : `${completedMilestoneCount} of ${goalMilestones.length} milestones completed`
              }
            />
          </View>

          {goal.status !== 'completed' ? (
            <Button
              title="Celebrate & Complete Goal"
              variant="secondary"
              leftIcon={<Trophy size={16} color={colors.forest} strokeWidth={2} />}
              onPress={() => {
                setCompletionNote('');
                setShowCompleteModal(true);
              }}
              style={styles.completeGoalBtn}
            />
          ) : null}
        </Card>

        {/* Milestones Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <Text style={styles.sectionSubtitle}>
              Measurable checkpoints to reach this goal
            </Text>
          </View>
          <Button
            title="Add Milestone"
            onPress={() => router.push(`/goals/${goal.id}/milestone-new`)}
            variant="secondary"
            leftIcon={<Plus size={16} color={colors.forest} strokeWidth={2.5} />}
            style={styles.smallBtn}
          />
        </View>

        {goalMilestones.length > 0 ? (
          goalMilestones.map((ms) => {
            const msTasks = goalTasks.filter((t) => t.milestone_id === ms.id);
            const msCompleted = msTasks.filter((t) => t.status === 'completed').length;
            return (
              <MilestoneItem
                key={ms.id}
                milestone={ms}
                onToggle={() => toggleMilestone(ms.id)}
                onDelete={() => setMilestoneToDelete(ms.id)}
                linkedTaskCount={msTasks.length}
                completedTaskCount={msCompleted}
              />
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>
              No milestones yet. Adding milestones helps track concrete progress.
            </Text>
          </Card>
        )}

        {/* Linked Daily Tasks Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Linked Tasks</Text>
            <Text style={styles.sectionSubtitle}>
              Daily actions connected to this goal
            </Text>
          </View>
          <Button
            title="Add Task"
            onPress={() =>
              router.push({
                pathname: '/tasks/new',
                params: { goalId: goal.id },
              })
            }
            variant="secondary"
            leftIcon={<Plus size={16} color={colors.forest} strokeWidth={2.5} />}
            style={styles.smallBtn}
          />
        </View>

        {goalTasks.length > 0 ? (
          goalTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggle={() => toggleTask(t.id)}
              onPress={() => router.push(`/tasks/${t.id}/edit`)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>
              No daily tasks linked to this goal yet.
            </Text>
          </Card>
        )}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Delete Goal Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goal.title}"? Associated milestones and tasks will also be removed.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={async () => {
          await deleteGoal(goal.id);
          setShowDeleteModal(false);
          router.replace('/(tabs)/goals');
        }}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Delete Milestone Modal */}
      <ConfirmModal
        visible={milestoneToDelete !== null}
        title="Delete Milestone"
        message="Are you sure you want to remove this milestone?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={async () => {
          if (milestoneToDelete) {
            await deleteMilestone(milestoneToDelete);
            setMilestoneToDelete(null);
          }
        }}
        onCancel={() => setMilestoneToDelete(null)}
      />

      {/* Reopen Goal Confirmation Modal */}
      <ConfirmModal
        visible={showReopenModal}
        title="Reopen Goal"
        message={`Move "${goal.title}" back to active goals?`}
        confirmLabel="Reopen"
        onConfirm={async () => {
          setIsReopening(true);
          try {
            await reopenGoal(goal.id);
            setShowReopenModal(false);
          } finally {
            setIsReopening(false);
          }
        }}
        onCancel={() => setShowReopenModal(false)}
      />

      {/* Celebrate Goal Completion Modal */}
      <Modal
        visible={showCompleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.celebrationIconRow}>
              <View style={styles.celebrationIconBox}>
                <Trophy size={28} color={colors.forest} strokeWidth={2} />
              </View>
              <Text style={styles.modalTitle}>Goal Accomplished!</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Congratulations on reaching this milestone. Would you like to record a brief reflection on this journey?
            </Text>

            <Input
              label="Reflection Note (Optional)"
              placeholder="e.g. Learned how to pace myself and stay consistent even during busy weeks."
              value={completionNote}
              onChangeText={setCompletionNote}
              multiline
              numberOfLines={3}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowCompleteModal(false)}
                style={styles.modalActionBtn}
              />
              <Button
                title="Mark as Achieved"
                variant="primary"
                loading={isCompleting}
                onPress={async () => {
                  setIsCompleting(true);
                  try {
                    await completeGoal(
                      goal.id,
                      completionNote.trim() ? completionNote.trim() : undefined
                    );
                    setShowCompleteModal(false);
                  } finally {
                    setIsCompleting(false);
                  }
                }}
                style={styles.modalActionBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  card: {
    marginBottom: spacing.base,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.charcoal,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.caption,
    color: colors.muted,
  },
  progressBox: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.muted,
  },
  smallBtn: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyCardText: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
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
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paleSage,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.base,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  trophyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.forest,
  },
  achievementSubtitle: {
    ...typography.caption,
    color: colors.muted,
  },
  reopenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  reopenBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.muted,
  },
  completeGoalBtn: {
    marginTop: spacing.md,
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
  noteLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.forest,
    marginBottom: 2,
  },
  noteText: {
    ...typography.bodySmall,
    fontStyle: 'italic',
    color: colors.charcoal,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(51, 56, 49, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.paper,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  celebrationIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  celebrationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.charcoal,
    flex: 1,
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: spacing.base,
    lineHeight: 20,
  },
  modalInput: {
    minHeight: 80,
    marginBottom: spacing.base,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalActionBtn: {
    flex: 1,
  },
});
