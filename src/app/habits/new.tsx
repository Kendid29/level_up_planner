// Level Up Planner: Add Habit Screen
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
import { colors, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Chip } from '../../components/common/Chip';
import { formatLocalDate } from '../../domain/dates';

const FREQUENCIES = [1, 2, 3, 4, 5, 6, 7];

export default function NewHabitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createHabit } = useApp();

  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState(7);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a habit name.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const todayStr = formatLocalDate(new Date());
      await createHabit({
        title: title.trim(),
        frequency,
        active_days: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
        start_date: todayStr,
        archived_at: null,
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not save habit.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="New Habit" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Habit Name"
          placeholder="e.g. Read 15 minutes before bed"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (error) setError(null);
          }}
          error={error}
          autoFocus
        />

        <Text style={styles.sectionLabel}>Target Frequency (Days per week)</Text>
        <View style={styles.chipRow}>
          {FREQUENCIES.map((freq) => (
            <Chip
              key={freq}
              label={freq === 7 ? 'Daily (7d)' : `${freq} days/wk`}
              selected={frequency === freq}
              onPress={() => setFrequency(freq)}
            />
          ))}
        </View>

        <Text style={styles.noteText}>
          Remember: sustainable consistency comes from starting at a gentle, realistic pace.
        </Text>

        <View style={styles.actionRow}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.buttonFlex}
          />
          <Button
            title="Add Habit"
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
  noteText: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  buttonFlex: {
    flex: 1,
  },
});
