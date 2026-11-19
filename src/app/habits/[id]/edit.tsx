// Level Up Planner: Edit Habit Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import * as notificationService from '@/services/notificationService';

const FREQUENCIES = [1, 2, 3, 4, 5, 6, 7];

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, updateHabit, deleteHabit } = useApp();

  const habit = habits.find((h) => h.id === id);

  const [title, setTitle] = useState(habit?.title || '');
  const [frequency, setFrequency] = useState(habit?.frequency || 7);
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time || '08:00');
  const [enableReminder, setEnableReminder] = useState(Boolean(habit?.reminder_time));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!habit) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Edit Habit" showBack onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Habit not found.</Text>
          <Button title="Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const handleReminderToggle = async (value: boolean) => {
    if (value) {
      const granted = await notificationService.requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Needed',
          'Please allow notifications in device settings to receive habit prompts.'
        );
        setEnableReminder(false);
        return;
      }
    }
    setEnableReminder(value);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a habit name.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      // Cancel previous notifications if any
      if (habit.reminder_notification_ids) {
        try {
          const oldIds = JSON.parse(habit.reminder_notification_ids);
          if (Array.isArray(oldIds)) {
            await notificationService.cancelMultipleNotifications(oldIds);
          }
        } catch {}
      }

      let nextNotificationIds: string[] = [];
      let activeDays = [0, 1, 2, 3, 4, 5, 6];
      try {
        activeDays = JSON.parse(habit.active_days);
      } catch {}

      if (enableReminder) {
        nextNotificationIds = await notificationService.scheduleHabitReminders(
          habit.id,
          title.trim(),
          activeDays,
          reminderTime.trim() || '08:00'
        );
      }

      await updateHabit(habit.id, {
        title: title.trim(),
        frequency,
        reminder_time: enableReminder ? reminderTime.trim() || '08:00' : null,
        reminder_notification_ids:
          nextNotificationIds.length > 0 ? JSON.stringify(nextNotificationIds) : null,
      });
      router.back();
    } catch (e) {
      console.error(e);
      setError('Could not update habit.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <ScreenHeader title="Edit Habit" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Habit Name"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (error) setError(null);
          }}
          error={error}
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

        {/* Habit Reminder */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderInfo}>
            <View style={styles.reminderIconWrapper}>
              <Bell size={18} color={colors.forest} />
            </View>
            <View style={styles.reminderTextContainer}>
              <Text style={styles.reminderTitle}>Habit Reminder</Text>
              <Text style={styles.reminderSubtitle}>
                Notify on active days
              </Text>
            </View>
          </View>
          <Switch
            value={enableReminder}
            onValueChange={handleReminderToggle}
            trackColor={{ false: colors.line, true: colors.paleSage }}
            thumbColor={enableReminder ? colors.forest : '#FFFFFF'}
          />
        </View>

        {enableReminder ? (
          <Input
            label="Reminder Time (HH:mm)"
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholder="08:00"
            helperText="Format: HH:mm (e.g. 07:30)"
          />
        ) : null}

        <View style={styles.actionRow}>
          <Button
            title="Delete Habit"
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
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.title}" and its history?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={async () => {
          await deleteHabit(habit.id);
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
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
    gap: spacing.sm,
  },
  reminderIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
  },
  reminderSubtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
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
