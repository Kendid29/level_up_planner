// Level Up Planner — Core Business Logic & Calculations
// Follows PRD.md Sections 7.3 - 7.7 and anti-slop guidelines

import { Goal, Milestone, Task, Habit, HabitLog, TaskFilter, GoalWithProgress, HabitWithWeeklyProgress } from '../types/models';
import { formatLocalDate, isDateInThisWeek, parseLocalDate, getLast7Days, getDayAbbr } from './dates';

/**
 * Calculates goal progress percentage based on completed milestones.
 * In accordance with PRD 7.4:
 * If there are no milestones, returns null so the UI indicates "Not started" / "No milestones",
 * rather than a misleading 0%.
 */
export function calculateGoalProgress(milestones: Milestone[]): number | null {
  if (!milestones || milestones.length === 0) {
    return null;
  }
  const completedCount = milestones.filter((m) => m.completed_at !== null).length;
  return Math.round((completedCount / milestones.length) * 100);
}

/**
 * Calculates milestone completion rate from associated tasks.
 * If no tasks are linked, returns null indicating manual milestone completion.
 */
export function calculateMilestoneTaskProgress(tasks: Task[]): number | null {
  if (!tasks || tasks.length === 0) {
    return null;
  }
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completedCount / tasks.length) * 100);
}

/**
 * Filters tasks according to the active tab filter.
 */
export function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  referenceDate: string = formatLocalDate(new Date()),
  weekStart: number = 1
): Task[] {
  switch (filter) {
    case 'today':
      return tasks.filter((task) => task.status === 'todo' && task.due_at === referenceDate);
    case 'upcoming':
      return tasks.filter((task) => task.status === 'todo' && task.due_at !== null && task.due_at > referenceDate);
    case 'this_week':
      return tasks.filter(
        (task) => task.status === 'todo' && task.due_at !== null && isDateInThisWeek(task.due_at, weekStart)
      );
    case 'completed':
      return tasks.filter((task) => task.status === 'completed');
    default:
      return tasks;
  }
}

/**
 * Aggregates goal information with milestone and task metrics.
 */
export function aggregateGoal(
  goal: Goal,
  milestones: Milestone[],
  tasks: Task[]
): GoalWithProgress {
  const goalMilestones = milestones.filter((m) => m.goal_id === goal.id);
  const goalTasks = tasks.filter((t) => t.goal_id === goal.id);
  const completedMilestones = goalMilestones.filter((m) => m.completed_at !== null).length;
  const completedTasks = goalTasks.filter((t) => t.status === 'completed').length;

  return {
    ...goal,
    totalMilestones: goalMilestones.length,
    completedMilestones,
    progressPercent: calculateGoalProgress(goalMilestones),
    linkedTaskCount: goalTasks.length,
    completedTaskCount: completedTasks,
  };
}

/**
 * Aggregates habit history and weekly progress.
 * Avoids negative streak or guilt mechanics per PRD 7.7.
 */
export function aggregateHabit(
  habit: Habit,
  logs: HabitLog[],
  today: Date = new Date(),
  weekStart: number = 1
): HabitWithWeeklyProgress {
  const habitLogs = logs.filter((l) => l.habit_id === habit.id);
  const todayStr = formatLocalDate(today);

  // Compute completions in current week
  const completedThisWeek = habitLogs.filter(
    (l) => l.completed === 1 && isDateInThisWeek(l.log_date, weekStart)
  ).length;

  // Check if logged today
  const loggedToday = habitLogs.some((l) => l.log_date === todayStr && l.completed === 1);

  // Build 7-day rolling window
  const last7DaysDates = getLast7Days(today);
  const historyLast7Days = last7DaysDates.map((dateStr) => {
    const isCompleted = habitLogs.some((l) => l.log_date === dateStr && l.completed === 1);
    return {
      date: dateStr,
      completed: isCompleted,
      isToday: dateStr === todayStr,
      dayName: getDayAbbr(dateStr),
    };
  });

  return {
    ...habit,
    completedThisWeek,
    loggedToday,
    historyLast7Days,
  };
}
