// Level Up Planner — Add Goal Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { GoalHorizon, PriorityLevel } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';
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

const HORIZONS: { key: GoalHorizon; label: string; period: string }[] = [
  { key: 'short', label: 'Short-term', period: '0–3 mo' },
  { key: 'mid', label: 'Mid-term', period: '3–12 mo' },
  { key: 'long', label: 'Long-term', period: '1–5 yr' },
];

const PRIORITIES: PriorityLevel[] = ['low', 'medium', 'high'];

export default function NewGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createGoal } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [horizon, setHorizon] = useState<GoalHorizon>('short');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const todayStr = formatLocalDate(new Date());
      await createGoal({
        title: title.trim(),
        description: description.trim() || null,
        horizon,
        category,
        priority,
        start_date: todayStr,
        target_date: targetDate.trim() || null,
        status: 'active',
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not save goal. Please check input.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="New Goal" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Goal Title"
          placeholder="e.g. Run a half marathon"
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
          placeholder="Why does this goal matter to you?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.multilineInput}
        />

        {/* Horizon Selection */}
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

        {/* Category Selection */}
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

        {/* Priority Selection */}
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
          placeholder="YYYY-MM-DD (e.g. 2026-12-31)"
          value={targetDate}
          onChangeText={setTargetDate}
          helperText="Format: YYYY-MM-DD"
        />

        <View style={styles.actionRow}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.buttonFlex}
          />
          <Button
            title="Create Goal"
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
