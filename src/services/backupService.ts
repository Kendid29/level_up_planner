// Level Up Planner: Backup Service
// Creates full database JSON backups, handles file persistence, and manages native sharing
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../database/db';
import {
  APPLICATION_IDENTIFIER,
  CURRENT_BACKUP_VERSION,
  CURRENT_SCHEMA_VERSION,
  BackupMetadata,
} from '../domain/backupValidation';
import { DEFAULT_USER_ID } from '../database/schema';

const LAST_BACKUP_KEY = 'last_backup_timestamp';

export interface BackupResult {
  fileUri: string;
  fileName: string;
  fileSizeBytes: number;
  createdAt: string;
  summary: Record<string, number>;
}

/**
 * Creates a complete JSON backup of the user's data from SQLite.
 */
export async function createDatabaseBackup(): Promise<BackupResult> {
  const db = await getDatabase();

  // Fetch all entities across the application
  const [
    profiles,
    categories,
    goals,
    milestones,
    tasks,
    habits,
    habit_logs,
    notes,
    journal_entries,
    weekly_reviews,
    weekly_priorities,
    reminder_preferences,
  ] = await Promise.all([
    db.getAllAsync<any>('SELECT * FROM profiles;'),
    db.getAllAsync<any>('SELECT * FROM categories;'),
    db.getAllAsync<any>('SELECT * FROM goals;'),
    db.getAllAsync<any>('SELECT * FROM milestones;'),
    db.getAllAsync<any>('SELECT * FROM tasks;'),
    db.getAllAsync<any>('SELECT * FROM habits;'),
    db.getAllAsync<any>('SELECT * FROM habit_logs;'),
    db.getAllAsync<any>('SELECT * FROM notes;'),
    db.getAllAsync<any>('SELECT * FROM journal_entries;'),
    db.getAllAsync<any>('SELECT * FROM weekly_reviews;'),
    db.getAllAsync<any>('SELECT * FROM weekly_priorities;'),
    db.getAllAsync<any>('SELECT * FROM reminder_preferences;'),
  ]);

  const summary: Record<string, number> = {
    profiles: profiles.length,
    categories: categories.length,
    goals: goals.length,
    milestones: milestones.length,
    tasks: tasks.length,
    habits: habits.length,
    habit_logs: habit_logs.length,
    notes: notes.length,
    journal_entries: journal_entries.length,
    weekly_reviews: weekly_reviews.length,
    weekly_priorities: weekly_priorities.length,
    reminder_preferences: reminder_preferences.length,
  };

  const createdAt = new Date().toISOString();

  const backupPayload: BackupMetadata = {
    application_identifier: APPLICATION_IDENTIFIER,
    backup_version: CURRENT_BACKUP_VERSION,
    created_at: createdAt,
    app_version: '1.0.0',
    schema_version: CURRENT_SCHEMA_VERSION,
    summary,
    data: {
      profiles,
      categories,
      goals,
      milestones,
      tasks,
      habits,
      habit_logs,
      notes,
      journal_entries,
      weekly_reviews,
      weekly_priorities,
      reminder_preferences,
    },
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);

  // Generate safe filename with timestamp: level_up_planner_backup_YYYY-MM-DD_HH-mm-ss.json
  const safeTimestamp = createdAt
    .slice(0, 19)
    .replace('T', '_')
    .replace(/:/g, '-');
  const fileName = `level_up_planner_backup_${safeTimestamp}.json`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  // Write file to device cache
  await FileSystem.writeAsStringAsync(fileUri, jsonString, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  const fileSizeBytes = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : jsonString.length;

  // Persist last backup timestamp
  await setLastBackupTimestamp(createdAt);

  return {
    fileUri,
    fileName,
    fileSizeBytes,
    createdAt,
    summary,
  };
}

/**
 * Shares the backup file using native OS share dialog.
 */
export async function shareBackupFile(fileUri: string): Promise<boolean> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not supported on this platform or device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Save or Share Level Up Planner Backup',
    UTI: 'public.json',
  });
  return true;
}

/**
 * Retrieves the timestamp of the last successful backup.
 */
export async function getLastBackupTimestamp(): Promise<string | null> {
  const db = await getDatabase();
  try {
    // Check if preferences table has a backup timestamp entry
    const pref = await db.getFirstAsync<{ scheduled_time: string }>(
      'SELECT scheduled_time FROM reminder_preferences WHERE user_id = ? AND reminder_type = ?',
      [DEFAULT_USER_ID, LAST_BACKUP_KEY]
    );
    return pref?.scheduled_time || null;
  } catch {
    return null;
  }
}

/**
 * Persists the timestamp of the last successful backup.
 */
export async function setLastBackupTimestamp(timestamp: string): Promise<void> {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `INSERT INTO reminder_preferences (id, user_id, reminder_type, enabled, scheduled_time, scheduled_day, notification_id, updated_at)
       VALUES (?, ?, ?, 1, ?, 0, null, ?)
       ON CONFLICT(user_id, reminder_type) DO UPDATE SET scheduled_time = excluded.scheduled_time, updated_at = excluded.updated_at;`,
      [`pref_${LAST_BACKUP_KEY}`, DEFAULT_USER_ID, LAST_BACKUP_KEY, timestamp, timestamp]
    );
  } catch {
    // Graceful fallback if table is unavailable
  }
}
