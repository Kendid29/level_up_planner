// Level Up Planner: Restore Service
// Handles backup file picking, schema & foreign key validation, and transactional database restoration
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { getDatabase } from '../database/db';
import {
  validateBackupPayload,
  BackupMetadata,
  ValidationResult,
} from '../domain/backupValidation';
import { createDatabaseBackup } from './backupService';
import { DEFAULT_USER_ID } from '../database/schema';

export interface PickResult {
  canceled: boolean;
  fileUri?: string;
  fileName?: string;
  validation?: ValidationResult;
  payload?: BackupMetadata;
}

export interface RestoreResult {
  success: boolean;
  totalRestored: number;
  breakdown: Record<string, number>;
  preRestoreBackupUri?: string;
}

/**
 * Prompts user to pick a backup JSON file from device storage, reads it, and validates it.
 */
export async function pickAndValidateBackupFile(): Promise<PickResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'application/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return { canceled: true };
  }

  const asset = result.assets[0];
  const fileUri = asset.uri;
  const fileName = asset.name;

  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let jsonPayload: any;
    try {
      jsonPayload = JSON.parse(fileContent);
    } catch {
      return {
        canceled: false,
        fileUri,
        fileName,
        validation: {
          isValid: false,
          error: 'The selected file is not a valid JSON document.',
        },
      };
    }

    const validation = validateBackupPayload(jsonPayload);

    return {
      canceled: false,
      fileUri,
      fileName,
      validation,
      payload: validation.isValid ? jsonPayload : undefined,
    };
  } catch (err: any) {
    return {
      canceled: false,
      fileUri,
      fileName,
      validation: {
        isValid: false,
        error: `Could not read file: ${err?.message || 'Unknown error'}`,
      },
    };
  }
}

/**
 * Restores the database from a validated backup payload within a single atomic SQLite transaction.
 */
export async function executeRestore(
  payload: BackupMetadata,
  options?: { backupCurrentFirst?: boolean }
): Promise<RestoreResult> {
  let preRestoreBackupUri: string | undefined;

  // 1. Create a safety snapshot of current data if requested
  if (options?.backupCurrentFirst) {
    try {
      const backup = await createDatabaseBackup();
      preRestoreBackupUri = backup.fileUri;
    } catch (e) {
      console.warn('Pre-restore backup failed, continuing with user confirmation', e);
    }
  }

  const db = await getDatabase();
  const { data } = payload;

  const restoredBreakdown: Record<string, number> = {
    goals: (data.goals || []).length,
    milestones: (data.milestones || []).length,
    tasks: (data.tasks || []).length,
    habits: (data.habits || []).length,
    habit_logs: (data.habit_logs || []).length,
    notes: (data.notes || []).length,
    journal_entries: (data.journal_entries || []).length,
    categories: (data.categories || []).length,
    weekly_reviews: (data.weekly_reviews || []).length,
    weekly_priorities: (data.weekly_priorities || []).length,
  };

  const totalRestored = Object.values(restoredBreakdown).reduce((a, b) => a + b, 0);

  // 2. Perform atomic replace inside withTransactionAsync
  await db.withTransactionAsync(async () => {
    // A. Clear existing records in reverse foreign-key order
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
      DELETE FROM reminder_preferences;
      DELETE FROM categories;
      DELETE FROM profiles;
    `);

    // B. Insert Profiles
    for (const p of data.profiles || []) {
      await db.runAsync(
        `INSERT INTO profiles (id, display_name, week_start, theme_preference, onboarding_completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [p.id, p.display_name, p.week_start ?? 1, p.theme_preference ?? 'light', p.onboarding_completed ?? 1, p.created_at, p.updated_at]
      );
    }

    // Ensure default profile exists if none was in the backup
    if (!data.profiles || data.profiles.length === 0) {
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT OR IGNORE INTO profiles (id, display_name, week_start, theme_preference, onboarding_completed, created_at, updated_at)
         VALUES (?, ?, 1, 'light', 1, ?, ?);`,
        [DEFAULT_USER_ID, 'Planner User', now, now]
      );
    }

    // C. Insert Categories
    for (const c of data.categories || []) {
      await db.runAsync(
        `INSERT INTO categories (id, user_id, name, color, icon, is_default, archived_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [c.id, c.user_id ?? DEFAULT_USER_ID, c.name, c.color, c.icon ?? 'Tag', c.is_default ?? 0, c.archived_at ?? null, c.created_at, c.updated_at]
      );
    }

    // D. Insert Goals
    for (const g of data.goals || []) {
      await db.runAsync(
        `INSERT INTO goals (id, user_id, title, description, horizon, category, start_date, target_date, priority, status, completed_at, completion_note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          g.id,
          g.user_id ?? DEFAULT_USER_ID,
          g.title,
          g.description ?? null,
          g.horizon,
          g.category,
          g.start_date,
          g.target_date ?? null,
          g.priority ?? 'medium',
          g.status ?? 'active',
          g.completed_at ?? null,
          g.completion_note ?? null,
          g.created_at,
          g.updated_at,
        ]
      );
    }

    // E. Insert Milestones
    for (const m of data.milestones || []) {
      await db.runAsync(
        `INSERT INTO milestones (id, goal_id, title, description, sort_order, target_date, completed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          m.id,
          m.goal_id,
          m.title,
          m.description ?? null,
          m.sort_order ?? 0,
          m.target_date ?? null,
          m.completed_at ?? null,
          m.created_at,
          m.updated_at,
        ]
      );
    }

    // F. Insert Tasks
    for (const t of data.tasks || []) {
      await db.runAsync(
        `INSERT INTO tasks (id, user_id, goal_id, milestone_id, title, description, due_at, due_time, reminder_at, notification_id, priority, status, category, completed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          t.id,
          t.user_id ?? DEFAULT_USER_ID,
          t.goal_id ?? null,
          t.milestone_id ?? null,
          t.title,
          t.description ?? null,
          t.due_at ?? null,
          t.due_time ?? null,
          t.reminder_at ?? null,
          t.notification_id ?? null,
          t.priority ?? 'medium',
          t.status ?? 'todo',
          t.category,
          t.completed_at ?? null,
          t.created_at,
          t.updated_at,
        ]
      );
    }

    // G. Insert Habits
    for (const h of data.habits || []) {
      await db.runAsync(
        `INSERT INTO habits (id, user_id, title, category, frequency, active_days, start_date, archived_at, reminder_time, reminder_notification_ids, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          h.id,
          h.user_id ?? DEFAULT_USER_ID,
          h.title,
          h.category ?? null,
          h.frequency ?? 7,
          h.active_days ?? '[0,1,2,3,4,5,6]',
          h.start_date,
          h.archived_at ?? null,
          h.reminder_time ?? null,
          h.reminder_notification_ids ?? null,
          h.created_at,
          h.updated_at,
        ]
      );
    }

    // H. Insert Habit Logs
    for (const hl of data.habit_logs || []) {
      await db.runAsync(
        `INSERT INTO habit_logs (id, habit_id, log_date, completed, created_at)
         VALUES (?, ?, ?, ?, ?);`,
        [hl.id, hl.habit_id, hl.log_date, hl.completed ?? 1, hl.created_at]
      );
    }

    // I. Insert Notes
    for (const n of data.notes || []) {
      await db.runAsync(
        `INSERT INTO notes (id, user_id, title, body, category, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [n.id, n.user_id ?? DEFAULT_USER_ID, n.title, n.body, n.category ?? null, n.created_at, n.updated_at]
      );
    }

    // J. Insert Journal Entries
    for (const j of data.journal_entries || []) {
      await db.runAsync(
        `INSERT INTO journal_entries (id, user_id, title, body, entry_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [j.id, j.user_id ?? DEFAULT_USER_ID, j.title ?? null, j.body, j.entry_date, j.created_at, j.updated_at]
      );
    }

    // K. Insert Weekly Reviews
    for (const wr of data.weekly_reviews || []) {
      await db.runAsync(
        `INSERT INTO weekly_reviews (id, user_id, week_start_date, week_end_date, period_key, total_tasks, completed_tasks, completion_percentage, active_goals_count, completed_milestones_count, habit_completion_rate, reflection_went_well, reflection_challenges, reflection_learnings, reflection_improvements, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          wr.id,
          wr.user_id ?? DEFAULT_USER_ID,
          wr.week_start_date,
          wr.week_end_date,
          wr.period_key,
          wr.total_tasks ?? 0,
          wr.completed_tasks ?? 0,
          wr.completion_percentage ?? 0,
          wr.active_goals_count ?? 0,
          wr.completed_milestones_count ?? 0,
          wr.habit_completion_rate ?? 0,
          wr.reflection_went_well ?? null,
          wr.reflection_challenges ?? null,
          wr.reflection_learnings ?? null,
          wr.reflection_improvements ?? null,
          wr.created_at,
          wr.updated_at,
        ]
      );
    }

    // L. Insert Weekly Priorities
    for (const wp of data.weekly_priorities || []) {
      await db.runAsync(
        `INSERT INTO weekly_priorities (id, weekly_review_id, title, related_goal_id, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [wp.id, wp.weekly_review_id, wp.title, wp.related_goal_id ?? null, wp.sort_order ?? 0, wp.created_at]
      );
    }

    // M. Insert Reminder Preferences
    for (const rp of data.reminder_preferences || []) {
      await db.runAsync(
        `INSERT INTO reminder_preferences (id, user_id, reminder_type, enabled, scheduled_time, scheduled_day, notification_id, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [rp.id, rp.user_id ?? DEFAULT_USER_ID, rp.reminder_type, rp.enabled ?? 1, rp.scheduled_time, rp.scheduled_day ?? 0, rp.notification_id ?? null, rp.updated_at]
      );
    }
  });

  return {
    success: true,
    totalRestored,
    breakdown: restoredBreakdown,
    preRestoreBackupUri,
  };
}
