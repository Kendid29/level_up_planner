// Level Up Planner: Data Models & Types
// Based on PRD.md and Phase 1 Specifications

export type GoalHorizon = 'short' | 'mid' | 'long';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'completed';
export type TaskFilter = 'today' | 'upcoming' | 'this_week' | 'overdue' | 'completed';

export interface Profile {
  id: string;
  display_name: string;
  week_start: number; // 0 = Sunday, 1 = Monday
  theme_preference: 'light' | 'dark' | 'system';
  onboarding_completed: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  horizon: GoalHorizon;
  category: string;
  start_date: string;
  target_date: string | null;
  priority: PriorityLevel;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  target_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  milestone_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null; // YYYY-MM-DD
  due_time?: string | null; // HH:mm (e.g. "09:30")
  reminder_at?: string | null; // ISO datetime string or trigger time
  notification_id?: string | null; // Identifier from expo-notifications
  priority: PriorityLevel;
  status: TaskStatus;
  category: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  frequency: number; // e.g. 7 days a week, 5 days, etc.
  active_days: string; // JSON array of numbers [0,1,2,3,4,5,6]
  start_date: string; // YYYY-MM-DD
  archived_at: string | null;
  reminder_time?: string | null; // HH:mm (e.g. "07:00")
  reminder_notification_ids?: string | null; // JSON array of string IDs
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string; // YYYY-MM-DD
  completed: number; // 1 or 0
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  entry_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

// Phase 1: Weekly Review Models
export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start_date: string; // YYYY-MM-DD
  week_end_date: string; // YYYY-MM-DD
  period_key: string; // e.g. "2026-W47"
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  active_goals_count: number;
  completed_milestones_count: number;
  habit_completion_rate: number; // percentage (0-100)
  reflection_went_well: string | null;
  reflection_challenges: string | null;
  reflection_learnings: string | null;
  reflection_improvements: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPriority {
  id: string;
  weekly_review_id: string;
  title: string;
  related_goal_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface WeeklyReviewWithPriorities extends WeeklyReview {
  priorities: WeeklyPriority[];
}

export interface WeeklyReviewStats {
  weekStartDate: string;
  weekEndDate: string;
  periodKey: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  activeGoalsCount: number;
  completedMilestonesCount: number;
  habitCompletionRate: number;
  activeGoals: GoalWithProgress[];
  completedMilestones: Milestone[];
  pendingTasksList: Task[];
}

// Phase 1: Reminders & Notification Preferences
export type ReminderType = 'daily_planning' | 'weekly_review' | 'task_default' | 'habit_default';

export interface ReminderPreference {
  id: string;
  user_id: string;
  reminder_type: ReminderType;
  enabled: number; // 1 or 0
  scheduled_time: string; // HH:mm (e.g. "08:00")
  scheduled_day: number; // 0-6 (e.g. 0 for Sunday)
  notification_id: string | null;
  updated_at: string;
}

// Aggregated View Types
export interface GoalWithProgress extends Goal {
  totalMilestones: number;
  completedMilestones: number;
  progressPercent: number | null; // null if 0 milestones, as requested by PRD (not misleading 0%)
  linkedTaskCount: number;
  completedTaskCount: number;
}

export interface MilestoneWithTasks extends Milestone {
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
}

export interface HabitWithWeeklyProgress extends Habit {
  completedThisWeek: number;
  loggedToday: boolean;
  historyLast7Days: { date: string; completed: boolean; isToday: boolean; dayName: string }[];
}

export interface DashboardSummary {
  greeting: string;
  currentDateFormatted: string;
  tasksTotalToday: number;
  tasksCompletedToday: number;
  todayProgressPercent: number;
  prioritiesToday: Task[];
  upcomingDeadlines: Task[];
  activeGoals: GoalWithProgress[];
  habitsOverview: HabitWithWeeklyProgress[];
  overdueTasksCount: number;
  weeklyReviewPrompt: {
    weekStartDate: string;
    weekEndDate: string;
    isReviewed: boolean;
  } | null;
}
