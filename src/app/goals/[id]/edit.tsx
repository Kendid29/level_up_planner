// Level Up Planner: Edit Goal Screen
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
import { GoalHorizon, PriorityLevel } from '@/types/models';
import { colors, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';

const DEFAULT_CATEGORIES = [
  'Personal Growth',
  'Health & Wellness',
  'Career',
  'Education',
  'Finance',
  'Relationships',
  'Lifestyle',
];

const HORIZONS: { key: GoalHorizon; label: string; period: string }[] = [
  { key: 'short', label: 'Short-term', period: '0–3 mo' },
  { key: 'mid', label: 'Mid-term', period: '3–12 mo' },
  { key: 'long', label: 'Long-term', period: '1–5 yr' },
];

const PRIORITIES: PriorityLevel[] = ['low', 'medium', 'high'];

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goals, updateGoal, categories } = useApp();
  const availableCategories =
    categories.length > 0 ? categories.map((c) => c.name) : DEFAULT_CATEGORIES;

  const goal = goals.find((g) => g.id === id);

  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [horizon, setHorizon] = useState<GoalHorizon>(goal?.horizon || 'short');
  const [category, setCategory] = useState(goal?.category || availableCategories[0]);
  const [priority, setPriority] = useState<PriorityLevel>(goal?.priority || 'medium');
  const [targetDate, setTargetDate] = useState(goal?.target_date || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!goal) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Edit Goal" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Goal not found.</Text>
          <Button title="Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateGoal(goal.id, {
        title: title.trim(),
        description: description.trim() || null,
        horizon,
        category,
        priority,
        target_date: targetDate.trim() || null,
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not update goal.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="Edit Goal" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Goal Title"
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

        <Text style={styles.sectionLabel}>Time Horizon</Text>
        <View style={styles.chipRow}>
          {HORIZONS.map((h) => (
            <Chip
              key={h.key}
              label={`${h.label} (${h.period})`}
              selected={horizon === h.key}
              onPress={() => setHorizon(h.key)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipRow}>
          {availableCategories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>

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

        <Input
          label="Target Date (Optional)"
          placeholder="YYYY-MM-DD"
          value={targetDate}
          onChangeText={setTargetDate}
        />

        <View style={styles.actionRow}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
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
