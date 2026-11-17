// Level Up Planner — New Journal Entry Screen
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
import { formatLocalDate } from '../../domain/dates';

export default function NewJournalEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createJournalEntry } = useApp();

  const [date, setDate] = useState(formatLocalDate(new Date()));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!body.trim()) {
      setError('Please write your journal entry.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await createJournalEntry({
        entry_date: date.trim() || formatLocalDate(new Date()),
        title: title.trim() || null,
        body: body.trim(),
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not save journal entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="New Journal Entry" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Entry Date"
          value={date}
          onChangeText={setDate}
          helperText="Format: YYYY-MM-DD"
        />

        <Input
          label="Title (Optional)"
          placeholder="e.g. Morning reflections on focus"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Reflection"
          placeholder="What is on your mind today? Write freely..."
          value={body}
          onChangeText={(text) => {
            setBody(text);
            if (error) setError(null);
          }}
          multiline
          numberOfLines={10}
          style={styles.multilineInput}
          error={error}
          autoFocus
        />

        <View style={styles.actionRow}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.buttonFlex}
          />
          <Button
            title="Save Entry"
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
    minHeight: 220,
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
