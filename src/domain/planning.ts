// Level Up Planner: Core Business Logic & Calculations
// Follows PRD.md Sections 7.3 - 7.7 and anti-slop guidelines

import { Goal, Milestone, Task, Habit, HabitLog, TaskFilter, GoalWithProgress, HabitWithWeeklyProgress, WeeklyReviewStats } from '../types/models';
import { formatLocalDate, isDateInThisWeek, parseLocalDate, getLast7Days, getDayAbbr, isTaskOverdue, getWeekPeriod } from './dates';

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
    case 'overdue':
      return tasks.filter(
        (task) => task.status === 'todo' && isTaskOverdue(task.due_at, task.due_time, referenceDate)
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

/**
 * Calculates comprehensive weekly statistics for Weekly Review.
 * Uses exact database-backed records and no-guilt progress framing.
 */
export function calculateWeeklyStats(
  weekStartDate: string,
  weekEndDate: string,
  tasks: Task[],
  goals: Goal[],
  milestones: Milestone[],
  habits: Habit[],
  habitLogs: HabitLog[]
): WeeklyReviewStats {
  const weekTasks = tasks.filter((t) => {
    const isDueInWeek = t.due_at !== null && t.due_at >= weekStartDate && t.due_at <= weekEndDate;
    const isCompletedInWeek =
      t.completed_at !== null &&
      t.completed_at.slice(0, 10) >= weekStartDate &&
      t.completed_at.slice(0, 10) <= weekEndDate;
    return isDueInWeek || isCompletedInWeek;
  });

  const completedTasks = weekTasks.filter((t) => t.status === 'completed');
  const pendingTasks = weekTasks.filter((t) => t.status === 'todo');
  const completionPercentage =
    weekTasks.length > 0 ? Math.round((completedTasks.length / weekTasks.length) * 100) : 0;

  const activeGoals = goals
    .filter((g) => g.status === 'active')
    .map((g) => aggregateGoal(g, milestones, tasks));

  const completedMilestones = milestones.filter(
    (m) =>
      m.completed_at !== null &&
      m.completed_at.slice(0, 10) >= weekStartDate &&
      m.completed_at.slice(0, 10) <= weekEndDate
  );

  const activeHabits = habits.filter((h) => !h.archived_at);
  let totalScheduledHabitDays = 0;
  let completedHabitLogsCount = 0;

  const startDate = parseLocalDate(weekStartDate);
  const daysInWeek: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    daysInWeek.push(formatLocalDate(d));
  }

  for (const habit of activeHabits) {
    let habitActiveDays: number[] = [0, 1, 2, 3, 4, 5, 6];
    try {
      habitActiveDays = JSON.parse(habit.active_days);
    } catch {}

    for (const dayStr of daysInWeek) {
      if (dayStr >= habit.start_date) {
        const dayOfWeek = parseLocalDate(dayStr).getDay();
        if (habitActiveDays.includes(dayOfWeek)) {
          totalScheduledHabitDays++;
          const wasLogged = habitLogs.some(
            (l) => l.habit_id === habit.id && l.log_date === dayStr && l.completed === 1
          );
          if (wasLogged) {
            completedHabitLogsCount++;
          }
        }
      }
    }
  }

  const habitCompletionRate =
    totalScheduledHabitDays > 0
      ? Math.round((completedHabitLogsCount / totalScheduledHabitDays) * 100)
      : 0;

  const { periodKey } = getWeekPeriod(parseLocalDate(weekStartDate));

  return {
    weekStartDate,
    weekEndDate,
    periodKey,
    totalTasks: weekTasks.length,
    completedTasks: completedTasks.length,
    pendingTasks: pendingTasks.length,
    completionPercentage,
    activeGoalsCount: activeGoals.length,
    completedMilestonesCount: completedMilestones.length,
    habitCompletionRate,
    activeGoals,
    completedMilestones,
    pendingTasksList: pendingTasks,
  };
}
