-- Level Up Planner: Phase 4.2A - Initial Cloud Database Schema
-- Compatible with PostgreSQL 15+ (Supabase)
-- Source of truth: SQLite schema (src/database/schema.ts) & Proposal Revision 5

-- ============================================================================
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function: Automatically update updated_at timestamp on row mutation
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: Automatically record tombstone on deletion for delta sync
-- Hardened with SECURITY DEFINER, search_path isolation, and foreign_key_violation handling
CREATE OR REPLACE FUNCTION public.record_sync_tombstone()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  BEGIN
    INSERT INTO public.sync_tombstones (user_id, table_name, record_id, deleted_at)
    VALUES (OLD.user_id, TG_TABLE_NAME, OLD.id::text, now());
  EXCEPTION
    -- If user account is being deleted from auth.users (CASCADE deletion),
    -- foreign_key_violation is safely caught to allow complete account cleanup.
    WHEN foreign_key_violation THEN
      RETURN OLD;
  END;
  RETURN OLD;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_sync_tombstone() FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 2. SYNC TOMBSTONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sync_tombstones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_tombstones_user_lookup 
  ON public.sync_tombstones (user_id, table_name, deleted_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_tombstones_retention 
  ON public.sync_tombstones (deleted_at);

ALTER TABLE public.sync_tombstones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read their own tombstones"
  ON public.sync_tombstones
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 3. PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Planner User',
  week_start INTEGER NOT NULL DEFAULT 1 CHECK (week_start IN (0, 1)),
  theme_preference TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_categories_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_updated 
  ON public.categories (user_id, updated_at DESC);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_categories_tombstone
  AFTER DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 5. GOALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.goals (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  horizon TEXT NOT NULL CHECK (horizon IN ('short', 'mid', 'long')),
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  completed_at TIMESTAMPTZ,
  completion_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_goals_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_goals_user_status_updated 
  ON public.goals (user_id, status, updated_at DESC);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own goals"
  ON public.goals
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_goals_tombstone
  AFTER DELETE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 6. MILESTONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_milestones_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_milestones_id_goal_user UNIQUE (id, goal_id, user_id),
  CONSTRAINT fk_milestones_goal FOREIGN KEY (goal_id, user_id)
    REFERENCES public.goals (id, user_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_milestones_user_goal_sort 
  ON public.milestones (user_id, goal_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_milestones_user_updated 
  ON public.milestones (user_id, updated_at DESC);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own milestones"
  ON public.milestones
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_milestones_tombstone
  AFTER DELETE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 7. TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id TEXT,
  milestone_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_at TEXT,
  due_time TEXT,
  reminder_at TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'completed')),
  category TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_tasks_id_user UNIQUE (id, user_id),
  -- Foreign key to goal: only goal_id becomes NULL when goal is deleted (PG15+ syntax)
  CONSTRAINT fk_tasks_goal FOREIGN KEY (goal_id, user_id)
    REFERENCES public.goals (id, user_id)
    ON DELETE SET NULL (goal_id),
  -- Foreign key to milestone: binds milestone to same goal and user
  CONSTRAINT fk_tasks_milestone_goal_user FOREIGN KEY (milestone_id, goal_id, user_id)
    REFERENCES public.milestones (id, goal_id, user_id)
    ON DELETE SET NULL (milestone_id),
  -- Relational integrity: milestone cannot exist on a task without goal_id
  CONSTRAINT chk_tasks_milestone_requires_goal 
    CHECK (milestone_id IS NULL OR goal_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_status_due 
  ON public.tasks (user_id, status, due_at ASC);

CREATE INDEX IF NOT EXISTS idx_tasks_user_goal_milestone 
  ON public.tasks (user_id, goal_id, milestone_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_updated 
  ON public.tasks (user_id, updated_at DESC);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_tasks_tombstone
  AFTER DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 8. HABITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.habits (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  frequency INTEGER NOT NULL DEFAULT 7 CHECK (frequency >= 1 AND frequency <= 7),
  active_days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
  start_date DATE NOT NULL,
  archived_at TIMESTAMPTZ,
  reminder_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_habits_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_habits_user_archived_updated 
  ON public.habits (user_id, archived_at, updated_at DESC);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own habits"
  ON public.habits
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_habits_tombstone
  AFTER DELETE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 9. HABIT_LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.habit_logs (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_habit_logs_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_habit_logs_user_habit_date UNIQUE (user_id, habit_id, log_date),
  CONSTRAINT fk_habit_logs_habit FOREIGN KEY (habit_id, user_id)
    REFERENCES public.habits (id, user_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date 
  ON public.habit_logs (user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_updated 
  ON public.habit_logs (user_id, updated_at DESC);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own habit logs"
  ON public.habit_logs
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_habit_logs_updated_at
  BEFORE UPDATE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_habit_logs_tombstone
  AFTER DELETE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 10. NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_notes_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notes_user_updated 
  ON public.notes (user_id, updated_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notes"
  ON public.notes
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_notes_tombstone
  AFTER DELETE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 11. JOURNAL_ENTRIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_journal_entries_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date 
  ON public.journal_entries (user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_updated 
  ON public.journal_entries (user_id, updated_at DESC);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journal entries"
  ON public.journal_entries
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_journal_entries_tombstone
  AFTER DELETE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 12. WEEKLY_REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  period_key TEXT NOT NULL,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_weekly_reviews_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_weekly_reviews_user_period UNIQUE (user_id, period_key)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_period 
  ON public.weekly_reviews (user_id, period_key DESC);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_updated 
  ON public.weekly_reviews (user_id, updated_at DESC);

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own weekly reviews"
  ON public.weekly_reviews
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_weekly_reviews_updated_at
  BEFORE UPDATE ON public.weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_weekly_reviews_tombstone
  AFTER DELETE ON public.weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 13. WEEKLY_PRIORITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_priorities (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_review_id TEXT NOT NULL,
  title TEXT NOT NULL,
  related_goal_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_weekly_priorities_id_user UNIQUE (id, user_id),
  CONSTRAINT fk_weekly_priorities_review FOREIGN KEY (weekly_review_id, user_id)
    REFERENCES public.weekly_reviews (id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_weekly_priorities_goal FOREIGN KEY (related_goal_id, user_id)
    REFERENCES public.goals (id, user_id)
    ON DELETE SET NULL (related_goal_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_priorities_user_review_sort 
  ON public.weekly_priorities (user_id, weekly_review_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_weekly_priorities_user_updated 
  ON public.weekly_priorities (user_id, updated_at DESC);

ALTER TABLE public.weekly_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own weekly priorities"
  ON public.weekly_priorities
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_weekly_priorities_updated_at
  BEFORE UPDATE ON public.weekly_priorities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_weekly_priorities_tombstone
  AFTER DELETE ON public.weekly_priorities
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();

-- ============================================================================
-- 14. REMINDER_PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reminder_preferences (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('daily_planning', 'weekly_review', 'task_default', 'habit_default')),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  scheduled_time TEXT NOT NULL,
  scheduled_day INTEGER NOT NULL DEFAULT 0 CHECK (scheduled_day >= 0 AND scheduled_day <= 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_reminder_preferences_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_reminder_preferences_user_type UNIQUE (user_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_reminder_preferences_user 
  ON public.reminder_preferences (user_id, updated_at DESC);

ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminder preferences"
  ON public.reminder_preferences
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER trg_reminder_preferences_updated_at
  BEFORE UPDATE ON public.reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_reminder_preferences_tombstone
  AFTER DELETE ON public.reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION public.record_sync_tombstone();
