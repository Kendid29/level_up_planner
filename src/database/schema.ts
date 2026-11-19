// Level Up Planner: SQLite Database Schema & Migrations
// Based on PRD.md Section 10

export const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  week_start INTEGER NOT NULL DEFAULT 1,
  theme_preference TEXT NOT NULL DEFAULT 'light',
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  horizon TEXT NOT NULL,
  category TEXT NOT NULL,
  start_date TEXT NOT NULL,
  target_date TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active',
  completed_at TEXT,
  completion_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target_date TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TEXT,
  due_time TEXT,
  reminder_at TEXT,
  notification_id TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  category TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  frequency INTEGER NOT NULL DEFAULT 7,
  active_days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
  start_date TEXT NOT NULL,
  archived_at TEXT,
  reminder_time TEXT,
  reminder_notification_ids TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  UNIQUE(habit_id, log_date)
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  entry_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start_date TEXT NOT NULL,
  week_end_date TEXT NOT NULL,
  period_key TEXT NOT NULL UNIQUE,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  completion_percentage REAL NOT NULL DEFAULT 0,
  active_goals_count INTEGER NOT NULL DEFAULT 0,
  completed_milestones_count INTEGER NOT NULL DEFAULT 0,
  habit_completion_rate REAL NOT NULL DEFAULT 0,
  reflection_went_well TEXT,
  reflection_challenges TEXT,
  reflection_learnings TEXT,
  reflection_improvements TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS weekly_priorities (
  id TEXT PRIMARY KEY,
  weekly_review_id TEXT NOT NULL REFERENCES weekly_reviews(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  related_goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminder_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  scheduled_time TEXT NOT NULL,
  scheduled_day INTEGER NOT NULL DEFAULT 0,
  notification_id TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, reminder_type)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, name)
);
`;

export const DEFAULT_USER_ID = 'local_user_default';
