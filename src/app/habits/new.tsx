// Level Up Planner: Add Habit Screen
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Chip } from '../../components/common/Chip';
import { formatLocalDate } from '../../domain/dates';
import * as notificationService from '../../services/notificationService';

const DEFAULT_CATEGORIES = [
  'Personal Growth',
  'Health & Wellness',
  'Career',
  'Education',
  'Finance',
  'Relationships',
  'Lifestyle',
];

const FREQUENCIES = [1, 2, 3, 4, 5, 6, 7];

export default function NewHabitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createHabit, categories } = useApp();
  const availableCategories =
    categories.length > 0 ? categories.map((c) => c.name) : DEFAULT_CATEGORIES;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Personal Growth');
  const [frequency, setFrequency] = useState(7);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [enableReminder, setEnableReminder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      const todayStr = formatLocalDate(new Date());
      const activeDays = [0, 1, 2, 3, 4, 5, 6];

      let notificationIds: string[] = [];
      if (enableReminder) {
        notificationIds = await notificationService.scheduleHabitReminders(
          'habit_' + Date.now(),
          title.trim(),
          activeDays,
          reminderTime.trim() || '08:00'
        );
      }

      await createHabit({
        title: title.trim(),
        category,
        frequency,
        active_days: JSON.stringify(activeDays),
        start_date: todayStr,
        archived_at: null,
        reminder_time: enableReminder ? reminderTime.trim() || '08:00' : null,
        reminder_notification_ids: notificationIds.length > 0 ? JSON.stringify(notificationIds) : null,
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

        {/* Category */}
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
                Get a gentle prompt on active days
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
