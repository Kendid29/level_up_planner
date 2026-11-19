// Level Up Planner: Core Business Logic & Calculations
// Follows PRD.md Sections 7.3 - 7.7 and anti-slop guidelines

import {
  Goal,
  Milestone,
  Task,
  Habit,
  HabitLog,
  TaskFilter,
  GoalWithProgress,
  HabitWithWeeklyProgress,
  WeeklyReviewStats,
  MonthlyProgressSummary,
  HabitDetailedStats,
  HabitOverviewStats,
} from '../types/models';
import {
  formatLocalDate,
  isDateInThisWeek,
  parseLocalDate,
  getLast7Days,
  getDayAbbr,
  isTaskOverdue,
  getWeekPeriod,
  getMonthPeriod,
} from './dates';

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

/**
 * Calculates monthly progress statistics and month-over-month comparisons (Phase 2).
 * Uses pure database-backed data without synthetic inflation.
 */
export function calculateMonthlyStats(
  year: number,
  month: number,
  tasks: Task[],
  goals: Goal[],
  milestones: Milestone[],
  habits: Habit[],
  habitLogs: HabitLog[]
): MonthlyProgressSummary {
  const period = getMonthPeriod(year, month);
  const { monthStartDate, monthEndDate, monthName, monthLabel, prevYear, prevMonth } = period;

  // Filter tasks in target month
  const monthTasks = tasks.filter((t) => {
    const isDueInMonth = t.due_at !== null && t.due_at >= monthStartDate && t.due_at <= monthEndDate;
    const isCompletedInMonth =
      t.completed_at !== null &&
      t.completed_at.slice(0, 10) >= monthStartDate &&
      t.completed_at.slice(0, 10) <= monthEndDate;
    return isDueInMonth || isCompletedInMonth;
  });

  const completedTasks = monthTasks.filter((t) => t.status === 'completed');
  const pendingTasks = monthTasks.filter((t) => t.status === 'todo');
  const taskCompletionRate =
    monthTasks.length > 0 ? Math.round((completedTasks.length / monthTasks.length) * 100) : 0;

  // Active goals and goals completed in this month
  const activeGoals = goals
    .filter((g) => g.status === 'active')
    .map((g) => aggregateGoal(g, milestones, tasks));

  const completedGoals = goals
    .filter(
      (g) =>
        g.status === 'completed' &&
        Boolean(g.completed_at) &&
        g.completed_at!.slice(0, 10) >= monthStartDate &&
        g.completed_at!.slice(0, 10) <= monthEndDate
    )
    .map((g) => aggregateGoal(g, milestones, tasks));

  // Milestones completed in this month
  const completedMilestones = milestones.filter(
    (m) =>
      m.completed_at !== null &&
      m.completed_at.slice(0, 10) >= monthStartDate &&
      m.completed_at.slice(0, 10) <= monthEndDate
  );

  // Generate array of all dates in target month
  const daysInMonthCount = new Date(year, month, 0).getDate();
  const allMonthDates: string[] = [];
  for (let d = 1; d <= daysInMonthCount; d++) {
    allMonthDates.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  // Calculate habit stats for this month
  const activeHabits = habits.filter((h) => !h.archived_at);
  let totalScheduledHabitDays = 0;
  let totalCompletedHabitDays = 0;

  let bestHabitCandidate: {
    habit: Habit;
    completionRate: number;
    completedDays: number;
    scheduledDays: number;
  } | null = null;

  for (const habit of activeHabits) {
    let habitActiveDays: number[] = [0, 1, 2, 3, 4, 5, 6];
    try {
      habitActiveDays = JSON.parse(habit.active_days);
    } catch {}

    let habitScheduled = 0;
    let habitCompleted = 0;

    for (const dateStr of allMonthDates) {
      if (dateStr >= habit.start_date) {
        const dayOfWeek = parseLocalDate(dateStr).getDay();
        if (habitActiveDays.includes(dayOfWeek)) {
          habitScheduled++;
          const wasLogged = habitLogs.some(
            (l) => l.habit_id === habit.id && l.log_date === dateStr && l.completed === 1
          );
          if (wasLogged) {
            habitCompleted++;
          }
        }
      }
    }

    totalScheduledHabitDays += habitScheduled;
    totalCompletedHabitDays += habitCompleted;

    const rate = habitScheduled > 0 ? Math.round((habitCompleted / habitScheduled) * 100) : 0;
    if (
      habitScheduled > 0 &&
      (!bestHabitCandidate || rate > bestHabitCandidate.completionRate)
    ) {
      bestHabitCandidate = {
        habit,
        completionRate: rate,
        completedDays: habitCompleted,
        scheduledDays: habitScheduled,
      };
    }
  }

  const habitCompletionRate =
    totalScheduledHabitDays > 0
      ? Math.round((totalCompletedHabitDays / totalScheduledHabitDays) * 100)
      : 0;

  // Previous month calculation for comparison
  const prevPeriod = getMonthPeriod(prevYear, prevMonth);
  const prevMonthTasks = tasks.filter((t) => {
    const isDue = t.due_at !== null && t.due_at >= prevPeriod.monthStartDate && t.due_at <= prevPeriod.monthEndDate;
    const isComp =
      t.completed_at !== null &&
      t.completed_at.slice(0, 10) >= prevPeriod.monthStartDate &&
      t.completed_at.slice(0, 10) <= prevPeriod.monthEndDate;
    return isDue || isComp;
  });

  const prevCompletedTasks = prevMonthTasks.filter((t) => t.status === 'completed');
  const prevTaskRate =
    prevMonthTasks.length > 0
      ? Math.round((prevCompletedTasks.length / prevMonthTasks.length) * 100)
      : null;

  const hasPreviousMonthData = prevMonthTasks.length > 0;

  return {
    year,
    month,
    monthName,
    monthLabel,
    monthStartDate,
    monthEndDate,
    totalTasks: monthTasks.length,
    completedTasks: completedTasks.length,
    pendingTasks: pendingTasks.length,
    taskCompletionRate,
    activeGoalsCount: activeGoals.length,
    completedGoalsCount: completedGoals.length,
    completedMilestonesCount: completedMilestones.length,
    habitCompletionRate,
    completedGoals,
    completedMilestones,
    bestHabit: bestHabitCandidate,
    comparisonWithPreviousMonth: {
      hasPreviousMonth: hasPreviousMonthData,
      taskRateDelta:
        hasPreviousMonthData && prevTaskRate !== null
          ? taskCompletionRate - prevTaskRate
          : null,
      habitRateDelta: null, // Only compare if previous habit logs exist
      completedTasksDelta: hasPreviousMonthData
        ? completedTasks.length - prevCompletedTasks.length
        : null,
    },
  };
}

/**
 * Calculates in-depth statistics and calendar view for an individual habit (Phase 2).
 */
export function calculateHabitDetailedStats(
  habit: Habit,
  habitLogs: HabitLog[],
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1,
  today: Date = new Date(),
  weekStart: number = 1
): HabitDetailedStats {
  const todayStr = formatLocalDate(today);
  const habitLogsForHabit = habitLogs.filter((l) => l.habit_id === habit.id && l.completed === 1);

  let habitActiveDays: number[] = [0, 1, 2, 3, 4, 5, 6];
  try {
    habitActiveDays = JSON.parse(habit.active_days);
  } catch {}

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activeDaysFormatted =
    habitActiveDays.length === 7
      ? 'Daily'
      : habitActiveDays.map((d) => dayNames[d]).join(', ');

  // Generate calendar days for the selected month
  const daysInMonthCount = new Date(year, month, 0).getDate();
  const monthlyCalendarDays: HabitDetailedStats['monthlyCalendarDays'] = [];

  let scheduledInMonthCount = 0;
  let completedInMonthCount = 0;

  for (let d = 1; d <= daysInMonthCount; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = parseLocalDate(dateStr).getDay();
    const isScheduled = dateStr >= habit.start_date && habitActiveDays.includes(dayOfWeek);
    const isCompleted = habitLogsForHabit.some((l) => l.log_date === dateStr);
    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;

    if (isScheduled) {
      scheduledInMonthCount++;
      if (isCompleted) {
        completedInMonthCount++;
      }
    }

    monthlyCalendarDays.push({
      dateStr,
      dayNumber: d,
      isScheduled,
      isCompleted,
      isFuture,
      isToday,
    });
  }

  const monthlyCompletionRate =
    scheduledInMonthCount > 0
      ? Math.round((completedInMonthCount / scheduledInMonthCount) * 100)
      : 0;

  // Weekly completion rate and target achievement
  const currentWeek = getWeekPeriod(today, weekStart);
  let scheduledInWeekCount = 0;
  let completedInWeekCount = 0;

  const startDate = parseLocalDate(currentWeek.weekStartDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dStr = formatLocalDate(d);
    if (dStr >= habit.start_date) {
      const dayOfWeek = d.getDay();
      if (habitActiveDays.includes(dayOfWeek)) {
        scheduledInWeekCount++;
        if (habitLogsForHabit.some((l) => l.log_date === dStr)) {
          completedInWeekCount++;
        }
      }
    }
  }

  const weeklyCompletionRate =
    scheduledInWeekCount > 0
      ? Math.round((completedInWeekCount / scheduledInWeekCount) * 100)
      : 0;

  const isTargetAchievedThisWeek = completedInWeekCount >= habit.frequency;

  // Recent 14-day history
  const recentHistory: HabitDetailedStats['recentHistory'] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = formatLocalDate(d);
    recentHistory.push({
      dateStr: dStr,
      completed: habitLogsForHabit.some((l) => l.log_date === dStr),
    });
  }

  return {
    habit,
    weeklyCompletionRate,
    monthlyCompletionRate,
    isTargetAchievedThisWeek,
    totalCompletionsAllTime: habitLogsForHabit.length,
    activeDaysFormatted,
    monthlyCalendarDays,
    recentHistory,
  };
}

/**
 * Calculates aggregate habit overview statistics across all active habits (Phase 2).
 */
export function calculateHabitOverviewStats(
  habits: Habit[],
  habitLogs: HabitLog[],
  today: Date = new Date(),
  weekStart: number = 1
): HabitOverviewStats {
  const activeHabits = habits.filter((h) => !h.archived_at);
  const nowYear = today.getFullYear();
  const nowMonth = today.getMonth() + 1;

  let totalWeeklyScheduled = 0;
  let totalWeeklyCompleted = 0;
  let totalMonthlyScheduled = 0;
  let totalMonthlyCompleted = 0;
  let meetingTargetCount = 0;

  const habitsWithProgress = activeHabits.map((h) => {
    const baseAgg = aggregateHabit(h, habitLogs, today, weekStart);
    const detailed = calculateHabitDetailedStats(h, habitLogs, nowYear, nowMonth, today, weekStart);

    if (detailed.isTargetAchievedThisWeek) {
      meetingTargetCount++;
    }

    totalWeeklyCompleted += baseAgg.completedThisWeek;
    totalWeeklyScheduled += h.frequency;

    return {
      ...baseAgg,
      monthlyCompletionRate: detailed.monthlyCompletionRate,
      meetsFrequencyTarget: detailed.isTargetAchievedThisWeek,
    };
  });

  const weeklyRate =
    totalWeeklyScheduled > 0
      ? Math.round((totalWeeklyCompleted / totalWeeklyScheduled) * 100)
      : 0;

  return {
    totalActiveHabits: activeHabits.length,
    weeklyCompletionRate: Math.min(100, weeklyRate),
    monthlyCompletionRate:
      activeHabits.length > 0
        ? Math.round(
            habitsWithProgress.reduce((sum, h) => sum + h.monthlyCompletionRate, 0) /
              activeHabits.length
          )
        : 0,
    habitsMeetingTargetCount: meetingTargetCount,
    habitsWithProgress,
  };
}
