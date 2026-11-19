// Level Up Planner: Data Management & Privacy Service
// Provides live database metric overviews, size estimations, and safe data deletion
import * as FileSystem from 'expo-file-system/legacy';
import { getDatabase } from '../database/db';
import { getLastBackupTimestamp } from './backupService';
import { DEFAULT_USER_ID } from '../database/schema';

export interface DatabaseOverview {
  goalsCount: number;
  tasksCount: number;
  habitsCount: number;
  notesCount: number;
  journalCount: number;
  reviewsCount: number;
  categoriesCount: number;
  totalRecords: number;
  estimatedSizeBytes: number;
  lastBackupDate: string | null;
}

/**
 * Calculates live item counts and estimated database size.
 */
export async function getDatabaseOverview(): Promise<DatabaseOverview> {
  const db = await getDatabase();

  const [
    goalsRes,
    tasksRes,
    habitsRes,
    notesRes,
    journalRes,
    reviewsRes,
    categoriesRes,
  ] = await Promise.all([
    db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM goals;'),
    db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM tasks;'),
    db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM habits;'),
    db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM notes;'),
    db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM journal_entries;'),
    db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM weekly_reviews;'),
    db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM categories;'),
  ]);

  const goalsCount = goalsRes?.count || 0;
  const tasksCount = tasksRes?.count || 0;
  const habitsCount = habitsRes?.count || 0;
  const notesCount = notesRes?.count || 0;
  const journalCount = journalRes?.count || 0;
  const reviewsCount = reviewsRes?.count || 0;
  const categoriesCount = categoriesRes?.count || 0;

  const totalRecords =
    goalsCount +
    tasksCount +
    habitsCount +
    notesCount +
    journalCount +
    reviewsCount +
    categoriesCount;

  // Try to inspect physical SQLite file size if available in standard location,
  // or calculate realistic byte size based on average record footprint
  let estimatedSizeBytes = 0;
  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite/levelup_planner.db`;
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists && 'size' in fileInfo) {
      estimatedSizeBytes = fileInfo.size;
    }
  } catch {
    // Fallback estimation: base SQLite overhead (24KB) + average 512 bytes per record
  }

  if (estimatedSizeBytes === 0) {
    estimatedSizeBytes = 24576 + totalRecords * 640;
  }

  const lastBackupDate = await getLastBackupTimestamp();

  return {
    goalsCount,
    tasksCount,
    habitsCount,
    notesCount,
    journalCount,
    reviewsCount,
    categoriesCount,
    totalRecords,
    estimatedSizeBytes,
    lastBackupDate,
  };
}

/**
 * Safely deletes all personal user planning data while keeping core system settings
 * and default life categories intact so the app remains operational and clean.
 */
export async function clearAllUserData(): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    // 1. Delete planning items
    await db.execAsync(`
      DELETE FROM weekly_priorities;
      DELETE FROM weekly_reviews;
      DELETE FROM habit_logs;
      DELETE FROM habits;
      DELETE FROM tasks;
      DELETE FROM milestones;
      DELETE FROM goals;
      DELETE FROM notes;
      DELETE FROM journal_entries;
    `);

    // 2. Delete only custom categories, leaving default standard categories intact
    await db.runAsync('DELETE FROM categories WHERE is_default = 0;');

    // 3. Clear backup tracking key
    await db.runAsync(
      'DELETE FROM reminder_preferences WHERE user_id = ? AND reminder_type = ?;',
      [DEFAULT_USER_ID, 'last_backup_timestamp']
    );
  });
}
