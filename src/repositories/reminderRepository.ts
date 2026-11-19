// Level Up Planner: Reminder Preferences Repository
import { getDatabase } from '../database/db';
import { ReminderPreference, ReminderType } from '../types/models';

export async function getReminderPreferences(userId: string): Promise<ReminderPreference[]> {
  const db = await getDatabase();
  return await db.getAllAsync<ReminderPreference>(
    'SELECT * FROM reminder_preferences WHERE user_id = ? ORDER BY reminder_type ASC',
    [userId]
  );
}

export async function getReminderPreference(
  userId: string,
  type: ReminderType
): Promise<ReminderPreference | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<ReminderPreference>(
    'SELECT * FROM reminder_preferences WHERE user_id = ? AND reminder_type = ?',
    [userId, type]
  );
}

export async function updateReminderPreference(
  userId: string,
  type: ReminderType,
  updates: Partial<Omit<ReminderPreference, 'id' | 'user_id' | 'reminder_type' | 'updated_at'>>
): Promise<ReminderPreference> {
  const db = await getDatabase();
  const existing = await getReminderPreference(userId, type);
  const now = new Date().toISOString();

  if (existing) {
    const updated: ReminderPreference = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    await db.runAsync(
      `UPDATE reminder_preferences SET
         enabled = ?,
         scheduled_time = ?,
         scheduled_day = ?,
         notification_id = ?,
         updated_at = ?
       WHERE user_id = ? AND reminder_type = ?`,
      [
        updated.enabled,
        updated.scheduled_time,
        updated.scheduled_day,
        updated.notification_id || null,
        now,
        userId,
        type,
      ]
    );

    return (await getReminderPreference(userId, type))!;
  } else {
    const id = 'pref_' + type + '_' + Date.now();
    const enabled = updates.enabled !== undefined ? updates.enabled : 1;
    const scheduledTime = updates.scheduled_time || '08:00';
    const scheduledDay = updates.scheduled_day !== undefined ? updates.scheduled_day : 0;
    const notificationId = updates.notification_id || null;

    await db.runAsync(
      `INSERT INTO reminder_preferences (id, user_id, reminder_type, enabled, scheduled_time, scheduled_day, notification_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, type, enabled, scheduledTime, scheduledDay, notificationId, now]
    );

    return (await getReminderPreference(userId, type))!;
  }
}
