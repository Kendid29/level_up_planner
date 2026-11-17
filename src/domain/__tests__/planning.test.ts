import { describe, it, expect } from '@jest/globals';
import {
  calculateGoalProgress,
  calculateMilestoneTaskProgress,
  filterTasks,
  aggregateGoal,
  aggregateHabit,
} from '../planning';
import {
  formatLocalDate,
  getGreeting,
  formatDisplayDate,
  isDateInThisWeek,
  isDateToday,
  isDateUpcoming,
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
