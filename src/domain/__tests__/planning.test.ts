import { describe, it, expect } from '@jest/globals';
import {
  calculateGoalProgress,
  calculateMilestoneTaskProgress,
  filterTasks,
  aggregateGoal,
  aggregateHabit,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateHabitDetailedStats,
  calculateHabitOverviewStats,
} from '../planning';
import {
  formatLocalDate,
  getGreeting,
  formatDisplayDate,
  isDateInThisWeek,
  isDateToday,
  isDateUpcoming,
  isTaskOverdue,
  getWeekPeriod,
  getMonthPeriod,
} from '../dates';
import { Milestone, Task, Goal, Habit, HabitLog } from '../../types/models';

describe('Goal Progress Calculations', () => {
  it('returns null when a goal has no milestones to avoid misleading 0%', () => {
    expect(calculateGoalProgress([])).toBeNull();
  });

  it('calculates 0% when milestones exist but none are completed', () => {
    const milestones: Milestone[] = [
      {
        id: 'm1',
        goal_id: 'g1',
        title: 'Milestone 1',
        description: null,
        sort_order: 1,
        target_date: null,
        completed_at: null,
        created_at: '',
        updated_at: '',
      },
    ];
    expect(calculateGoalProgress(milestones)).toBe(0);
  });

  it('calculates 50% when 1 of 2 milestones is completed', () => {
    const milestones: Milestone[] = [
      {
        id: 'm1',
        goal_id: 'g1',
        title: 'Milestone 1',
        description: null,
        sort_order: 1,
        target_date: null,
        completed_at: '2026-11-17T10:00:00Z',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'm2',
        goal_id: 'g1',
        title: 'Milestone 2',
        description: null,
        sort_order: 2,
        target_date: null,
        completed_at: null,
        created_at: '',
        updated_at: '',
      },
    ];
    expect(calculateGoalProgress(milestones)).toBe(50);
  });

  it('calculates 100% when all milestones are completed', () => {
    const milestones: Milestone[] = [
      {
        id: 'm1',
        goal_id: 'g1',
        title: 'M1',
        description: null,
        sort_order: 1,
        target_date: null,
        completed_at: '2026-11-17T10:00:00Z',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'm2',
        goal_id: 'g1',
        title: 'M2',
        description: null,
        sort_order: 2,
        target_date: null,
        completed_at: '2026-11-17T11:00:00Z',
        created_at: '',
        updated_at: '',
      },
    ];
    expect(calculateGoalProgress(milestones)).toBe(100);
  });
});

describe('Milestone Task Progress Calculations', () => {
  it('returns null when no tasks are linked to milestone', () => {
    expect(calculateMilestoneTaskProgress([])).toBeNull();
  });

  it('calculates completion percentage from linked tasks', () => {
    const tasks: Task[] = [
      {
        id: 't1',
        user_id: 'u1',
        goal_id: 'g1',
        milestone_id: 'm1',
        title: 'Task 1',
        description: null,
        due_at: '2026-11-17',
        priority: 'high',
        status: 'completed',
        category: 'Personal Growth',
        completed_at: '2026-11-17T10:00:00Z',
        created_at: '',
        updated_at: '',
      },
      {
        id: 't2',
        user_id: 'u1',
        goal_id: 'g1',
        milestone_id: 'm1',
        title: 'Task 2',
        description: null,
        due_at: '2026-11-18',
        priority: 'medium',
        status: 'todo',
        category: 'Personal Growth',
        completed_at: null,
        created_at: '',
        updated_at: '',
      },
    ];
    expect(calculateMilestoneTaskProgress(tasks)).toBe(50);
  });
});

describe('Task Filtering', () => {
  const referenceDate = '2026-11-17';
  const sampleTasks: Task[] = [
    {
      id: 't1',
      user_id: 'u1',
      goal_id: null,
      milestone_id: null,
      title: 'Due today',
      description: null,
      due_at: '2026-11-17',
      priority: 'high',
      status: 'todo',
      category: 'Career',
      completed_at: null,
      created_at: '',
      updated_at: '',
    },
    {
      id: 't2',
      user_id: 'u1',
      goal_id: null,
      milestone_id: null,
      title: 'Due tomorrow (upcoming)',
      description: null,
      due_at: '2026-11-18',
      priority: 'medium',
      status: 'todo',
      category: 'Education',
      completed_at: null,
      created_at: '',
      updated_at: '',
    },
    {
      id: 't3',
      user_id: 'u1',
      goal_id: null,
      milestone_id: null,
      title: 'Completed task',
      description: null,
      due_at: '2026-11-17',
      priority: 'low',
      status: 'completed',
      category: 'Health',
      completed_at: '2026-11-17T09:00:00Z',
      created_at: '',
      updated_at: '',
    },
  ];

  it('filters today tasks correctly', () => {
    const result = filterTasks(sampleTasks, 'today', referenceDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t1');
  });

  it('filters upcoming tasks correctly', () => {
    const result = filterTasks(sampleTasks, 'upcoming', referenceDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t2');
  });

  it('filters completed tasks regardless of date', () => {
    const result = filterTasks(sampleTasks, 'completed', referenceDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t3');
  });

  it('filters overdue tasks correctly', () => {
    const tasksWithPast: Task[] = [
      ...sampleTasks,
      {
        id: 't_past',
        user_id: 'u1',
        goal_id: null,
        milestone_id: null,
        title: 'Yesterday task pending',
        description: null,
        due_at: '2026-11-16',
        due_time: null,
        reminder_at: null,
        notification_id: null,
        priority: 'high',
        status: 'todo',
        category: 'Work',
        completed_at: null,
        created_at: '',
        updated_at: '',
      },
    ];
    const result = filterTasks(tasksWithPast, 'overdue', referenceDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t_past');
  });
});

describe('Overdue and Time Logic', () => {
  it('identifies past dates as overdue', () => {
    expect(isTaskOverdue('2026-11-16', null, '2026-11-17', '10:00')).toBe(true);
  });

  it('identifies future dates as not overdue', () => {
    expect(isTaskOverdue('2026-11-18', null, '2026-11-17', '10:00')).toBe(false);
  });

  it('handles same-day tasks with due time', () => {
    expect(isTaskOverdue('2026-11-17', '09:00', '2026-11-17', '10:00')).toBe(true);
    expect(isTaskOverdue('2026-11-17', '11:00', '2026-11-17', '10:00')).toBe(false);
  });

  it('handles same-day tasks without due time as not overdue during the day', () => {
    expect(isTaskOverdue('2026-11-17', null, '2026-11-17', '10:00')).toBe(false);
  });
});

describe('Weekly Review Statistics', () => {
  it('calculates weekly stats and completion rate accurately', () => {
    const weekStart = '2026-11-16';
    const weekEnd = '2026-11-22';

    const tasks: Task[] = [
      {
        id: 't1',
        user_id: 'u1',
        goal_id: 'g1',
        milestone_id: null,
        title: 'Task 1',
        description: null,
        due_at: '2026-11-17',
        due_time: null,
        reminder_at: null,
        notification_id: null,
        priority: 'high',
        status: 'completed',
        category: 'Health',
        completed_at: '2026-11-17T12:00:00Z',
        created_at: '',
        updated_at: '',
      },
      {
        id: 't2',
        user_id: 'u1',
        goal_id: 'g1',
        milestone_id: null,
        title: 'Task 2',
        description: null,
        due_at: '2026-11-18',
        due_time: null,
        reminder_at: null,
        notification_id: null,
        priority: 'medium',
        status: 'todo',
        category: 'Health',
        completed_at: null,
        created_at: '',
        updated_at: '',
      },
    ];

    const goals: Goal[] = [
      {
        id: 'g1',
        user_id: 'u1',
        title: 'Goal 1',
        description: null,
        horizon: 'short',
        category: 'Health',
        start_date: '2026-11-01',
        target_date: '2026-12-01',
        priority: 'high',
        status: 'active',
        created_at: '',
        updated_at: '',
      },
    ];

    const milestones: Milestone[] = [
      {
        id: 'm1',
        goal_id: 'g1',
        title: 'Milestone 1',
        description: null,
        sort_order: 1,
        target_date: '2026-11-20',
        completed_at: '2026-11-17T15:00:00Z',
        created_at: '',
        updated_at: '',
      },
    ];

    const habits: Habit[] = [
      {
        id: 'h1',
        user_id: 'u1',
        title: 'Morning Walk',
        frequency: 7,
        active_days: '[0,1,2,3,4,5,6]',
        start_date: '2026-11-01',
        archived_at: null,
        reminder_time: null,
        reminder_notification_ids: null,
        created_at: '',
        updated_at: '',
      },
    ];

    const habitLogs: HabitLog[] = [
      { id: 'hl1', habit_id: 'h1', log_date: '2026-11-16', completed: 1, created_at: '' },
      { id: 'hl2', habit_id: 'h1', log_date: '2026-11-17', completed: 1, created_at: '' },
    ];

    const stats = calculateWeeklyStats(weekStart, weekEnd, tasks, goals, milestones, habits, habitLogs);

    expect(stats.totalTasks).toBe(2);
    expect(stats.completedTasks).toBe(1);
    expect(stats.pendingTasks).toBe(1);
    expect(stats.completionPercentage).toBe(50);
    expect(stats.activeGoalsCount).toBe(1);
    expect(stats.completedMilestonesCount).toBe(1);
    // Habit active for 7 days in week, logged 2 days => 2/7 ≈ 29%
    expect(stats.habitCompletionRate).toBe(29);
  });

  it('determines week period and period key', () => {
    const d = new Date(2026, 10, 19); // Nov 19 2026 (Thursday)
    const period = getWeekPeriod(d, 1);
    expect(period.periodKey).toContain('2026-W');
    expect(period.weekStartDate).toBe('2026-11-16'); // Monday
    expect(period.weekEndDate).toBe('2026-11-22'); // Sunday
  });
});

describe('Habit Aggregation', () => {
  const habit: Habit = {
    id: 'h1',
    user_id: 'u1',
    title: 'Morning Meditation',
    frequency: 5,
    active_days: '[1,2,3,4,5]',
    start_date: '2026-11-01',
    archived_at: null,
    created_at: '',
    updated_at: '',
  };

  const logs: HabitLog[] = [
    {
      id: 'l1',
      habit_id: 'h1',
      log_date: '2026-11-17',
      completed: 1,
      created_at: '',
    },
    {
      id: 'l2',
      habit_id: 'h1',
      log_date: '2026-11-16',
      completed: 1,
      created_at: '',
    },
  ];

  it('detects whether habit is logged today', () => {
    const refDate = new Date(2026, 10, 17); // Nov 17 2026
    const agg = aggregateHabit(habit, logs, refDate);
    expect(agg.loggedToday).toBe(true);
    expect(agg.completedThisWeek).toBe(2);
    expect(agg.historyLast7Days).toHaveLength(7);
  });
});

describe('Date Utilities', () => {
  it('formats greetings properly', () => {
    expect(getGreeting(9)).toBe('Good morning');
    expect(getGreeting(14)).toBe('Good afternoon');
    expect(getGreeting(20)).toBe('Good evening');
  });

  it('formats display dates', () => {
    const today = formatLocalDate(new Date());
    expect(formatDisplayDate(today)).toBe('Today');
  });
});

describe('Phase 2: Monthly Progress Summary', () => {
  const sampleTasks: Task[] = [
    {
      id: 't_nov_1',
      user_id: 'u1',
      goal_id: 'g1',
      milestone_id: null,
      title: 'Nov Task 1',
      description: null,
      due_at: '2026-11-05',
      priority: 'high',
      status: 'completed',
      category: 'Health',
      completed_at: '2026-11-05T10:00:00Z',
      created_at: '',
      updated_at: '',
    },
    {
      id: 't_nov_2',
      user_id: 'u1',
      goal_id: 'g1',
      milestone_id: null,
      title: 'Nov Task 2',
      description: null,
      due_at: '2026-11-15',
      priority: 'medium',
      status: 'todo',
      category: 'Health',
      completed_at: null,
      created_at: '',
      updated_at: '',
    },
    {
      id: 't_oct_1',
      user_id: 'u1',
      goal_id: null,
      milestone_id: null,
      title: 'Oct Task 1',
      description: null,
      due_at: '2026-10-20',
      priority: 'low',
      status: 'completed',
      category: 'Career',
      completed_at: '2026-10-20T09:00:00Z',
      created_at: '',
      updated_at: '',
    },
  ];

  const sampleGoals: Goal[] = [
    {
      id: 'g1',
      user_id: 'u1',
      title: 'Active Goal',
      description: null,
      horizon: 'short',
      category: 'Health',
      start_date: '2026-11-01',
      target_date: '2026-12-01',
      priority: 'high',
      status: 'active',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'g2',
      user_id: 'u1',
      title: 'Completed Goal in Nov',
      description: null,
      horizon: 'short',
      category: 'Personal Growth',
      start_date: '2026-10-01',
      target_date: '2026-11-15',
      priority: 'medium',
      status: 'completed',
      completed_at: '2026-11-12T15:00:00Z',
      completion_note: 'Reached key morning routine milestone!',
      created_at: '',
      updated_at: '',
    },
  ];

  const sampleMilestones: Milestone[] = [
    {
      id: 'm1',
      goal_id: 'g1',
      title: 'Milestone in Nov',
      description: null,
      sort_order: 1,
      target_date: '2026-11-20',
      completed_at: '2026-11-10T12:00:00Z',
      created_at: '',
      updated_at: '',
    },
  ];

  const sampleHabits: Habit[] = [
    {
      id: 'h1',
      user_id: 'u1',
      title: 'Daily Walk',
      category: 'Health',
      frequency: 7,
      active_days: '[0,1,2,3,4,5,6]',
      start_date: '2026-11-01',
      archived_at: null,
      created_at: '',
      updated_at: '',
    },
  ];

  const sampleLogs: HabitLog[] = [
    { id: 'l1', habit_id: 'h1', log_date: '2026-11-01', completed: 1, created_at: '' },
    { id: 'l2', habit_id: 'h1', log_date: '2026-11-02', completed: 1, created_at: '' },
    { id: 'l3', habit_id: 'h1', log_date: '2026-11-03', completed: 1, created_at: '' },
  ];

  it('calculates monthly summary stats accurately without cross-month leakage', () => {
    const summary = calculateMonthlyStats(2026, 11, sampleTasks, sampleGoals, sampleMilestones, sampleHabits, sampleLogs);

    expect(summary.monthName).toBe('November');
    expect(summary.totalTasks).toBe(2); // Only Nov tasks
    expect(summary.completedTasks).toBe(1);
    expect(summary.pendingTasks).toBe(1);
    expect(summary.taskCompletionRate).toBe(50);
    expect(summary.activeGoalsCount).toBe(1);
    expect(summary.completedGoalsCount).toBe(1);
    expect(summary.completedMilestonesCount).toBe(1);
    expect(summary.bestHabit).not.toBeNull();
    expect(summary.bestHabit?.habit.id).toBe('h1');
  });

  it('correctly compares with previous month when previous data exists', () => {
    const summary = calculateMonthlyStats(2026, 11, sampleTasks, sampleGoals, sampleMilestones, sampleHabits, sampleLogs);
    // Oct had 1 task, completed 1 => 100%
    // Nov has 50% => delta is 50 - 100 = -50%
    expect(summary.comparisonWithPreviousMonth.hasPreviousMonth).toBe(true);
    expect(summary.comparisonWithPreviousMonth.taskRateDelta).toBe(-50);
  });

  it('handles empty previous month cleanly without synthetic values', () => {
    const summary = calculateMonthlyStats(2026, 10, sampleTasks, sampleGoals, sampleMilestones, sampleHabits, sampleLogs);
    // Sept has 0 tasks => hasPreviousMonth false
    expect(summary.comparisonWithPreviousMonth.hasPreviousMonth).toBe(false);
    expect(summary.comparisonWithPreviousMonth.taskRateDelta).toBeNull();
  });
});

describe('Phase 2: Habit Detailed & Overview Statistics', () => {
  const habit: Habit = {
    id: 'h_test',
    user_id: 'u1',
    title: 'Workout',
    category: 'Health',
    frequency: 3,
    active_days: '[1,3,5]', // Mon, Wed, Fri
    start_date: '2026-11-01',
    archived_at: null,
    created_at: '',
    updated_at: '',
  };

  const logs: HabitLog[] = [
    { id: 'hl1', habit_id: 'h_test', log_date: '2026-11-02', completed: 1, created_at: '' }, // Monday
    { id: 'hl2', habit_id: 'h_test', log_date: '2026-11-04', completed: 1, created_at: '' }, // Wednesday
    { id: 'hl3', habit_id: 'h_test', log_date: '2026-11-06', completed: 1, created_at: '' }, // Friday
  ];

  it('calculates individual habit detailed statistics and calendar accurately', () => {
    const refDate = new Date(2026, 10, 8); // Nov 8 2026 (Sunday)
    const stats = calculateHabitDetailedStats(habit, logs, 2026, 11, refDate);

    expect(stats.activeDaysFormatted).toBe('Mon, Wed, Fri');
    expect(stats.monthlyCalendarDays.length).toBe(30); // November has 30 days
    expect(stats.totalCompletionsAllTime).toBe(3);
    // In that first week, 3 scheduled, 3 completed => target 3 achieved!
    expect(stats.isTargetAchievedThisWeek).toBe(true);
  });

  it('calculates habit overview statistics across multiple habits', () => {
    const refDate = new Date(2026, 10, 8);
    const overview = calculateHabitOverviewStats([habit], logs, refDate);

    expect(overview.totalActiveHabits).toBe(1);
    expect(overview.habitsMeetingTargetCount).toBe(1);
    expect(overview.habitsWithProgress).toHaveLength(1);
    expect(overview.habitsWithProgress[0].meetsFrequencyTarget).toBe(true);
  });
});

describe('Month Period Calculations', () => {
  it('computes correct start, end, and navigation for month boundaries', () => {
    const nov = getMonthPeriod(2026, 11);
    expect(nov.monthStartDate).toBe('2026-11-01');
    expect(nov.monthEndDate).toBe('2026-11-30');
    expect(nov.prevMonth).toBe(10);
    expect(nov.prevYear).toBe(2026);
    expect(nov.nextMonth).toBe(12);
    expect(nov.nextYear).toBe(2026);

    const jan = getMonthPeriod(2026, 1);
    expect(jan.prevMonth).toBe(12);
    expect(jan.prevYear).toBe(2025);

    const dec = getMonthPeriod(2026, 12);
    expect(dec.nextMonth).toBe(1);
    expect(dec.nextYear).toBe(2027);
  });
});
