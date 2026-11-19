// Level Up Planner: SQLite Database Management
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, DEFAULT_USER_ID } from './schema';
import { formatLocalDate } from '../domain/dates';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  const db = await SQLite.openDatabaseAsync('levelup_planner.db');
  dbInstance = db;
  await initDatabase(db);
  return db;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_TABLES_SQL);

  // Safe migrations for Phase 1 columns if existing tables existed
  const alterColumns = [
    'ALTER TABLE tasks ADD COLUMN due_time TEXT;',
    'ALTER TABLE tasks ADD COLUMN reminder_at TEXT;',
    'ALTER TABLE tasks ADD COLUMN notification_id TEXT;',
    'ALTER TABLE habits ADD COLUMN reminder_time TEXT;',
    'ALTER TABLE habits ADD COLUMN reminder_notification_ids TEXT;',
  ];

  for (const sql of alterColumns) {
    try {
      await db.execAsync(sql);
    } catch {
      // Column already exists or table freshly created
    }
  }

  // Ensure default profile exists
  const existingProfile = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM profiles WHERE id = ?',
    [DEFAULT_USER_ID]
  );

  if (!existingProfile) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO profiles (id, display_name, week_start, theme_preference, onboarding_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [DEFAULT_USER_ID, 'Planner User', 1, 'light', 0, now, now]
    );

    // Seed starter content to provide a helpful first experience without being overwhelming
    await seedStarterData(db);
  }

  // Ensure default reminder preferences exist
  await seedDefaultReminders(db);
}

async function seedDefaultReminders(db: SQLite.SQLiteDatabase): Promise<void> {
  const now = new Date().toISOString();
  
  const dailyPref = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM reminder_preferences WHERE user_id = ? AND reminder_type = ?',
    [DEFAULT_USER_ID, 'daily_planning']
  );
  if (!dailyPref) {
    await db.runAsync(
      `INSERT INTO reminder_preferences (id, user_id, reminder_type, enabled, scheduled_time, scheduled_day, notification_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['pref_daily_plan', DEFAULT_USER_ID, 'daily_planning', 1, '08:00', 0, null, now]
    );
  }

  const weeklyPref = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM reminder_preferences WHERE user_id = ? AND reminder_type = ?',
    [DEFAULT_USER_ID, 'weekly_review']
  );
  if (!weeklyPref) {
    await db.runAsync(
      `INSERT INTO reminder_preferences (id, user_id, reminder_type, enabled, scheduled_time, scheduled_day, notification_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['pref_weekly_rev', DEFAULT_USER_ID, 'weekly_review', 1, '18:00', 0, null, now] // 0 = Sunday
    );
  }
}

async function seedStarterData(db: SQLite.SQLiteDatabase): Promise<void> {
  const now = new Date().toISOString();
  const todayStr = formatLocalDate(new Date());

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatLocalDate(tomorrow);

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 3);
  const nextMonthStr = formatLocalDate(nextMonth);

  // Starter Goal
  const goalId = 'seed_goal_1';
  await db.runAsync(
    `INSERT INTO goals (id, user_id, title, description, horizon, category, start_date, target_date, priority, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      goalId,
      DEFAULT_USER_ID,
      'Build Healthy Morning Routine',
      'Establish a grounding morning ritual to improve focus and daily energy.',
      'short',
      'Health & Wellness',
      todayStr,
      nextMonthStr,
      'high',
      'active',
      now,
      now,
    ]
  );

  // Milestones for the goal
  const m1Id = 'seed_m_1';
  const m2Id = 'seed_m_2';
  await db.runAsync(
    `INSERT INTO milestones (id, goal_id, title, description, sort_order, target_date, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [m1Id, goalId, 'Wake up at 6:30 AM consistently for 14 days', null, 1, nextMonthStr, null, now, now]
  );
  await db.runAsync(
    `INSERT INTO milestones (id, goal_id, title, description, sort_order, target_date, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [m2Id, goalId, 'Create 20-minute morning journaling and reading habit', null, 2, nextMonthStr, null, now, now]
  );

  // Starter Tasks linked to goal and milestone
  await db.runAsync(
    `INSERT INTO tasks (id, user_id, goal_id, milestone_id, title, description, due_at, priority, status, category, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'seed_task_1',
      DEFAULT_USER_ID,
      goalId,
      m1Id,
      'Set alarm for 6:30 AM and prepare bedside water',
      'Keep phone across the room to avoid snoozing.',
      todayStr,
      'high',
      'todo',
      'Health & Wellness',
      null,
      now,
      now,
    ]
  );

  await db.runAsync(
    `INSERT INTO tasks (id, user_id, goal_id, milestone_id, title, description, due_at, priority, status, category, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'seed_task_2',
      DEFAULT_USER_ID,
      goalId,
      m2Id,
      'Read 10 pages of personal development book',
      'Spend quiet time reading before checking email.',
      tomorrowStr,
      'medium',
      'todo',
      'Personal Growth',
      null,
      now,
      now,
    ]
  );

  // Starter Habit
  const habitId = 'seed_habit_1';
  await db.runAsync(
    `INSERT INTO habits (id, user_id, title, frequency, active_days, start_date, archived_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [habitId, DEFAULT_USER_ID, 'Morning Hydration & Sunlight', 7, '[0,1,2,3,4,5,6]', todayStr, null, now, now]
  );

  // Starter Note
  await db.runAsync(
    `INSERT INTO notes (id, user_id, title, body, category, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'seed_note_1',
      DEFAULT_USER_ID,
      'Core Life Principles',
      '1. Focus on what you can control.\n2. Small daily actions compound over years.\n3. Rest is a prerequisite for sustained growth.',
      'Personal Growth',
      now,
      now,
    ]
  );

  // Starter Journal Entry
  await db.runAsync(
    `INSERT INTO journal_entries (id, user_id, title, body, entry_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'seed_journal_1',
      DEFAULT_USER_ID,
      'Fresh Beginnings',
      'Starting today with intention. Taking time each day to review my priorities and align daily steps with my bigger goals.',
      todayStr,
      now,
      now,
    ]
  );
}
