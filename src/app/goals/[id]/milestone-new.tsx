// Level Up Planner: Add Milestone Screen
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
import { colors, spacing } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export default function NewMilestoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { milestones, createMilestone } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a milestone title.');
      return;
    }
    if (!id) {
      setError('Goal ID is missing.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const goalMilestones = milestones.filter((m) => m.goal_id === id);
      await createMilestone({
        goal_id: id,
        title: title.trim(),
        description: description.trim() || null,
        sort_order: goalMilestones.length + 1,
        target_date: targetDate.trim() || null,
        completed_at: null,
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not save milestone.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="New Milestone" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Milestone Title"
          placeholder="e.g. Complete chapter 1-5"
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
          placeholder="Specific outcome or checkpoint requirements"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.multilineInput}
        />

        <Input
          label="Target Date (Optional)"
          placeholder="YYYY-MM-DD"
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
            title="Add Milestone"
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  buttonFlex: {
    flex: 1,
  },
});
