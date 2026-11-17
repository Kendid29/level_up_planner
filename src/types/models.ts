// Level Up Planner: Data Models & Types
// Based on PRD.md Section 10

export type GoalHorizon = 'short' | 'mid' | 'long';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'completed';
export type TaskFilter = 'today' | 'upcoming' | 'this_week' | 'completed';

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
}
