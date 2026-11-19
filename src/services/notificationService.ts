// Level Up Planner: Local Notification Service
// Implemented with expo-notifications for Android and iOS
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { parseLocalDate } from '../domain/dates';

// Configure notification behavior when app is in foreground
try {
  if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch {
  // Graceful fallback for environments where notifications are unsupported
}

/**
 * Initializes notification channels for Android.
 */
export async function initNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Level Up Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#526B56',
        sound: 'default',
      });
    } catch {
      // Ignored if channel cannot be created
    }
  }
}

/**
 * Checks current notification permission status.
 */
export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (Platform.OS === 'web') return 'denied';
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return 'granted';
    }
    if (settings.status === 'denied') {
      return 'denied';
    }
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

/**
 * Requests notification permissions with contextual explanation.
 * Should be called when user enables a reminder toggle, not during cold onboarding.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    await initNotificationChannel();
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

/**
 * Cancels a scheduled notification safely.
 */
export async function cancelNotification(notificationId: string | null | undefined): Promise<void> {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore error if already dismissed or non-existent
  }
}

/**
 * Cancels multiple scheduled notifications.
 */
export async function cancelMultipleNotifications(notificationIds: string[]): Promise<void> {
  if (Platform.OS === 'web' || !notificationIds || notificationIds.length === 0) return;
  for (const id of notificationIds) {
    await cancelNotification(id);
  }
}

/**
 * Schedules a reminder for a specific task.
 */
export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  dueDateStr: string,
  dueTimeStr?: string | null
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const d = parseLocalDate(dueDateStr);
    let hour = 9;
    let minute = 0;

    if (dueTimeStr) {
      const parts = dueTimeStr.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        hour = parts[0];
        minute = parts[1];
      }
    }

    d.setHours(hour, minute, 0, 0);

    // If the scheduled time is in the past, do not schedule
    if (d.getTime() <= Date.now()) {
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: title,
        data: { taskId, type: 'task' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: d,
        channelId: 'default',
      },
    });

    return id;
  } catch {
    return null;
  }
}

/**
 * Schedules the recurring Daily Planning reminder (default 08:00).
 */
export async function scheduleDailyPlanningReminder(timeStr: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const [h, m] = timeStr.split(':').map(Number);
    const hour = !isNaN(h) ? h : 8;
    const minute = !isNaN(m) ? m : 0;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Planning',
        body: 'Take a calm moment to review your priorities and agenda for today.',
        data: { type: 'daily_planning' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'default',
      },
    });

    return id;
  } catch {
    return null;
  }
}

/**
 * Schedules the recurring Weekly Review reminder (default Sunday 18:00).
 * dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 */
export async function scheduleWeeklyReviewReminder(
  dayOfWeek: number,
  timeStr: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const [h, m] = timeStr.split(':').map(Number);
    const hour = !isNaN(h) ? h : 18;
    const minute = !isNaN(m) ? m : 0;

    // Expo Weekly weekday: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
    const expoWeekday = ((dayOfWeek % 7) + 1);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Review',
        body: 'Reflect on your progress this week and set your focus for next week.',
        data: { type: 'weekly_review' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday: expoWeekday,
        hour,
        minute,
        channelId: 'default',
      },
    });

    return id;
  } catch {
    return null;
  }
}

/**
 * Schedules recurring reminders for a habit on its active days.
 */
export async function scheduleHabitReminders(
  habitId: string,
  title: string,
  activeDays: number[],
  timeStr: string
): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return [];

  const notificationIds: string[] = [];
  const [h, m] = timeStr.split(':').map(Number);
  const hour = !isNaN(h) ? h : 8;
  const minute = !isNaN(m) ? m : 0;

  for (const day of activeDays) {
    try {
      const expoWeekday = ((day % 7) + 1);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Habit Reminder',
          body: `Time for: ${title}`,
          data: { habitId, type: 'habit' },
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoWeekday,
          hour,
          minute,
          channelId: 'default',
        },
      });
      notificationIds.push(id);
    } catch {
      // Continue for remaining days
    }
  }

  return notificationIds;
}
