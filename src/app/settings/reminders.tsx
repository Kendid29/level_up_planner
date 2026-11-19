// Level Up Planner: Centralized Reminder Settings Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { Input } from '@/components/common/Input';
import * as notificationService from '@/services/notificationService';
import { formatTimeDisplay } from '@/domain/dates';

const DAY_OPTIONS = [
  { day: 0, label: 'Sunday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
  { day: 1, label: 'Monday' },
];

const DAILY_PRESETS = ['07:00', '08:00', '09:00'];
const WEEKLY_PRESETS = ['17:00', '18:00', '19:00', '20:00'];

export default function ReminderSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reminderPreferences, updateReminderPreference } = useApp();

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [dailyTimeInput, setDailyTimeInput] = useState('08:00');
  const [weeklyTimeInput, setWeeklyTimeInput] = useState('18:00');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const dailyPref = reminderPreferences.find((rp) => rp.reminder_type === 'daily_planning');
  const weeklyPref = reminderPreferences.find((rp) => rp.reminder_type === 'weekly_review');

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (dailyPref?.scheduled_time) {
      setDailyTimeInput(dailyPref.scheduled_time);
    }
    if (weeklyPref?.scheduled_time) {
      setWeeklyTimeInput(weeklyPref.scheduled_time);
    }
  }, [dailyPref?.scheduled_time, weeklyPref?.scheduled_time]);

  const checkPermissions = async () => {
    const status = await notificationService.getNotificationPermissionStatus();
    setPermissionStatus(status);
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestNotificationPermissions();
    await checkPermissions();
    if (granted) {
      Alert.alert('Permissions Granted', 'Notifications are now active for Level Up Planner.');
    } else {
      Alert.alert(
        'Permission Needed',
        'Please allow notifications in your device settings to receive timely reminders.'
      );
    }
  };

  const showSaveSuccess = (message: string) => {
    setSaveFeedback(message);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleToggleDaily = async (enabled: boolean) => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await notificationService.requestNotificationPermissions();
      await checkPermissions();
      if (!granted) return;
    }
    setIsSaving(true);
    try {
      await updateReminderPreference('daily_planning', {
        enabled: enabled ? 1 : 0,
        scheduled_time: dailyTimeInput,
      });
      showSaveSuccess(enabled ? 'Daily planning reminder activated.' : 'Daily planning reminder disabled.');
    } catch {
      Alert.alert('Error', 'Could not update daily planning reminder.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDailyTime = async (time: string) => {
    setDailyTimeInput(time);
    if (dailyPref?.enabled === 1) {
      setIsSaving(true);
      try {
        await updateReminderPreference('daily_planning', { scheduled_time: time });
        showSaveSuccess(`Daily reminder set to ${formatTimeDisplay(time)}.`);
      } catch {
        // Handled silently
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleToggleWeekly = async (enabled: boolean) => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await notificationService.requestNotificationPermissions();
      await checkPermissions();
      if (!granted) return;
    }
    setIsSaving(true);
    try {
      await updateReminderPreference('weekly_review', {
        enabled: enabled ? 1 : 0,
        scheduled_time: weeklyTimeInput,
        scheduled_day: weeklyPref?.scheduled_day ?? 0,
      });
      showSaveSuccess(enabled ? 'Weekly review reminder activated.' : 'Weekly review reminder disabled.');
    } catch {
      Alert.alert('Error', 'Could not update weekly review reminder.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectWeeklyDay = async (day: number) => {
    setIsSaving(true);
    try {
      await updateReminderPreference('weekly_review', {
        scheduled_day: day,
        scheduled_time: weeklyTimeInput,
      });
      const dayLabel = DAY_OPTIONS.find((d) => d.day === day)?.label || 'Selected day';
      showSaveSuccess(`Weekly review reminder set to ${dayLabel}.`);
    } catch {
      Alert.alert('Error', 'Could not update weekly day.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWeeklyTime = async (time: string) => {
    setWeeklyTimeInput(time);
    if (weeklyPref?.enabled === 1) {
      setIsSaving(true);
      try {
        await updateReminderPreference('weekly_review', { scheduled_time: time });
        showSaveSuccess(`Weekly review set to ${formatTimeDisplay(time)}.`);
      } catch {
        // Handled silently
      } finally {
        setIsSaving(false);
      }
    }
  };

  const isDailyEnabled = dailyPref?.enabled === 1;
  const isWeeklyEnabled = weeklyPref?.enabled === 1;
  const currentWeeklyDay = weeklyPref?.scheduled_day ?? 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Reminders & Notifications"
        subtitle="Manage daily planning and weekly reviews"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Status Banner */}
        <Card style={styles.card}>
          <View style={styles.permissionRow}>
            {permissionStatus === 'granted' ? (
              <CheckCircle2 size={22} color={colors.forest} />
            ) : (
              <AlertCircle size={22} color="#8A4A36" />
            )}
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>
                {permissionStatus === 'granted'
                  ? 'Notifications Active'
                  : permissionStatus === 'denied'
                  ? 'Notifications Disabled'
                  : 'Notification Permission Required'}
              </Text>
              <Text style={styles.permissionDescription}>
                {permissionStatus === 'granted'
                  ? 'Your device will receive gentle local reminder alerts as scheduled.'
                  : 'Allow notifications so Level Up Planner can alert you for scheduled tasks and reviews.'}
              </Text>
            </View>
          </View>

          {permissionStatus !== 'granted' ? (
            <Button
              title="Allow Notifications"
              variant="primary"
              onPress={handleRequestPermission}
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
        </Card>

        {saveFeedback ? (
          <View style={styles.feedbackBanner}>
            <CheckCircle2 size={16} color={colors.forest} />
            <Text style={styles.feedbackText}>{saveFeedback}</Text>
          </View>
        ) : null}

        {/* Daily Planning Reminder */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <View style={styles.iconWrapper}>
                <Clock size={18} color={colors.forest} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Daily Planning Reminder</Text>
                <Text style={styles.cardSubtitle}>
                  {isDailyEnabled
                    ? `Active daily at ${formatTimeDisplay(dailyTimeInput)}`
                    : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDailyEnabled}
              onValueChange={handleToggleDaily}
              trackColor={{ false: colors.line, true: colors.paleSage }}
              thumbColor={isDailyEnabled ? colors.forest : '#FFFFFF'}
            />
          </View>

          <Text style={styles.sectionDescription}>
            A calm morning invitation to check your priorities, upcoming deadlines, and habits.
          </Text>

          {isDailyEnabled ? (
            <View style={styles.timeSection}>
              <Text style={styles.subLabel}>Reminder Time</Text>
              <View style={styles.presetRow}>
                {DAILY_PRESETS.map((p) => (
                  <Chip
                    key={p}
                    label={formatTimeDisplay(p)}
                    selected={dailyTimeInput === p}
                    onPress={() => handleSaveDailyTime(p)}
                  />
                ))}
              </View>
              <Input
                label="Custom Time (HH:mm)"
                value={dailyTimeInput}
                onChangeText={handleSaveDailyTime}
                placeholder="08:00"
                helperText="24-hour format (e.g. 08:30)"
              />
            </View>
          ) : null}
        </Card>

        {/* Weekly Review Reminder */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <View style={styles.iconWrapper}>
                <Calendar size={18} color={colors.forest} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Weekly Review Reminder</Text>
                <Text style={styles.cardSubtitle}>
                  {isWeeklyEnabled
                    ? `Every ${DAY_OPTIONS.find((d) => d.day === currentWeeklyDay)?.label} at ${formatTimeDisplay(weeklyTimeInput)}`
                    : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isWeeklyEnabled}
              onValueChange={handleToggleWeekly}
              trackColor={{ false: colors.line, true: colors.paleSage }}
              thumbColor={isWeeklyEnabled ? colors.forest : '#FFFFFF'}
            />
          </View>

          <Text style={styles.sectionDescription}>
            A dedicated weekly prompt to celebrate your completed milestones and set next week's focus.
          </Text>

          {isWeeklyEnabled ? (
            <View style={styles.timeSection}>
              <Text style={styles.subLabel}>Scheduled Day</Text>
              <View style={styles.presetRow}>
                {DAY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.day}
                    label={opt.label}
                    selected={currentWeeklyDay === opt.day}
                    onPress={() => handleSelectWeeklyDay(opt.day)}
                  />
                ))}
              </View>

              <Text style={styles.subLabel}>Reminder Time</Text>
              <View style={styles.presetRow}>
                {WEEKLY_PRESETS.map((p) => (
                  <Chip
                    key={p}
                    label={formatTimeDisplay(p)}
                    selected={weeklyTimeInput === p}
                    onPress={() => handleSaveWeeklyTime(p)}
                  />
                ))}
              </View>
              <Input
                label="Custom Time (HH:mm)"
                value={weeklyTimeInput}
                onChangeText={handleSaveWeeklyTime}
                placeholder="18:00"
                helperText="24-hour format (e.g. 18:00)"
              />
            </View>
          ) : null}
        </Card>

        {/* Tasks and Habits Information Card */}
        <Card style={styles.card}>
          <View style={styles.rowTitle}>
            <Bell size={18} color={colors.forest} />
            <Text style={[styles.cardTitle, { marginLeft: spacing.xs }]}>
              Task & Habit Reminders
            </Text>
          </View>
          <Text style={styles.sectionDescription}>
            • Individual tasks can be scheduled with alarms in the task editor.{'\n'}
            • Habits notify you on their specific active days.{'\n'}
            • All reminders are stored offline on your device without transmitting personal data.
          </Text>
        </Card>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </View>
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
  card: {
    marginBottom: spacing.base,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
  },
  permissionDescription: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.paleSage,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.base,
  },
  feedbackText: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  timeSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  subLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});
