// Level Up Planner — Add Task Screen
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
import { useApp } from '../../context/AppContext';
import { PriorityLevel } from '../../types/models';
import { colors, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Chip } from '../../components/common/Chip';
import { formatLocalDate } from '../../domain/dates';

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

export default function NewTaskScreen() {
  const params = useLocalSearchParams<{ goalId?: string; dueDate?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goals, milestones, createTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(params.dueDate || formatLocalDate(new Date()));
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(
    params.goalId || null
  );
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter milestones to chosen goal
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
      await createTask({
        title: title.trim(),
        description: description.trim() || null,
        due_at: dueDate.trim() || null,
        priority,
        status: 'todo',
        category,
        goal_id: selectedGoalId,
        milestone_id: selectedMilestoneId,
        completed_at: null,
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not save task.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="New Task" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Task Title"
          placeholder="e.g. Review quarter financial goals"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (error) setError(null);
          }}
          error={error}
          autoFocus
        />

        <Input
          label="Description (Optional)"
          placeholder="Notes or checklist details"
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
          helperText="Format: YYYY-MM-DD"
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
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.buttonFlex}
          />
          <Button
            title="Create Task"
            variant="primary"
            onPress={handleSave}
            loading={isSaving}
            style={styles.buttonFlex}
          />
        </View>
      </ScrollView>
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
});
