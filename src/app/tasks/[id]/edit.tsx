// Level Up Planner: Edit Task Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { PriorityLevel } from '@/types/models';
import { colors, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { ConfirmModal } from '@/components/common/ConfirmModal';

const CATEGORIES = [
  'Personal Growth',
  'Health & Wellness',
  'Career',
  'Education',
  'Finance',
  'Relationships',
  'Lifestyle',
];

const PRIORITIES: PriorityLevel[] = ['low', 'medium', 'high'];

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, goals, milestones, updateTask, deleteTask } = useApp();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_at || '');
  const [priority, setPriority] = useState<PriorityLevel>(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || CATEGORIES[0]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(
    task?.goal_id || null
  );
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    task?.milestone_id || null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!task) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Edit Task" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Task not found.</Text>
          <Button title="Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const availableMilestones = selectedGoalId
    ? milestones.filter((m) => m.goal_id === selectedGoalId)
    : [];

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        due_at: dueDate.trim() || null,
        priority,
        category,
        goal_id: selectedGoalId,
        milestone_id: selectedMilestoneId,
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not update task.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="Edit Task" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Task Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (error) setError(null);
          }}
          error={error}
        />

        <Input
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.multilineInput}
        />

        <Input
          label="Due Date"
          placeholder="YYYY-MM-DD"
          value={dueDate}
          onChangeText={setDueDate}
        />

        {/* Priority */}
        <Text style={styles.sectionLabel}>Priority</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={p.toUpperCase()}
              selected={priority === p}
              priority={p}
              onPress={() => setPriority(p)}
            />
          ))}
        </View>

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>

        {/* Link to Goal */}
        <Text style={styles.sectionLabel}>Connect to Goal (Optional)</Text>
        <View style={styles.chipRow}>
          <Chip
            label="None"
            selected={selectedGoalId === null}
            onPress={() => {
              setSelectedGoalId(null);
              setSelectedMilestoneId(null);
            }}
          />
          {goals.map((g) => (
            <Chip
              key={g.id}
              label={g.title}
              selected={selectedGoalId === g.id}
              onPress={() => {
                setSelectedGoalId(g.id);
                setSelectedMilestoneId(null);
              }}
            />
          ))}
        </View>

        {/* Link to Milestone if Goal selected */}
        {availableMilestones.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Connect to Milestone (Optional)</Text>
            <View style={styles.chipRow}>
              <Chip
                label="None"
                selected={selectedMilestoneId === null}
                onPress={() => setSelectedMilestoneId(null)}
              />
              {availableMilestones.map((m) => (
                <Chip
                  key={m.id}
                  label={m.title}
                  selected={selectedMilestoneId === m.id}
                  onPress={() => setSelectedMilestoneId(m.id)}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.actionRow}>
          <Button
            title="Delete Task"
            variant="destructive"
            onPress={() => setShowDeleteModal(true)}
            style={styles.buttonFlex}
          />
          <Button
            title="Save Changes"
            variant="primary"
            onPress={handleSave}
            loading={isSaving}
            style={styles.buttonFlex}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={async () => {
          await deleteTask(task.id);
          setShowDeleteModal(false);
          router.back();
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </KeyboardAvoidingView>
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  buttonFlex: {
    flex: 1,
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
