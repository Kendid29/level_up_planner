// Level Up Planner — Edit Journal Entry Screen
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
import { colors, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export default function EditJournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { journalEntries, updateJournalEntry, deleteJournalEntry } = useApp();

  const entry = journalEntries.find((e) => e.id === id);

  const [date, setDate] = useState(entry?.entry_date || '');
  const [title, setTitle] = useState(entry?.title || '');
  const [body, setBody] = useState(entry?.body || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!entry) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Edit Entry" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Entry not found.</Text>
          <Button title="Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    if (!body.trim()) {
      setError('Please provide entry content.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateJournalEntry(entry.id, {
        entry_date: date.trim() || entry.entry_date,
        title: title.trim() || null,
        body: body.trim(),
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not update entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="Edit Entry" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Entry Date"
          value={date}
          onChangeText={setDate}
        />

        <Input
          label="Title (Optional)"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Reflection"
          value={body}
          onChangeText={(text) => {
            setBody(text);
            if (error) setError(null);
          }}
          multiline
          numberOfLines={10}
          style={styles.multilineInput}
          error={error}
        />

        <View style={styles.actionRow}>
          <Button
            title="Delete Entry"
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
        title="Delete Entry"
        message="Are you sure you want to delete this journal entry?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={async () => {
          await deleteJournalEntry(entry.id);
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
    minHeight: 220,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
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
