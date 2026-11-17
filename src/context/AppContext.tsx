// Level Up Planner — Global Reactive Application Context
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Profile,
  Goal,
  Milestone,
  Task,
  Habit,
  HabitLog,
  Note,
  JournalEntry,
  GoalWithProgress,
  HabitWithWeeklyProgress,
  DashboardSummary,
} from '../types/models';
import { getDatabase } from '../database/db';
import { DEFAULT_USER_ID } from '../database/schema';
import * as goalRepo from '../repositories/goalRepository';
import * as milestoneRepo from '../repositories/milestoneRepository';
import * as taskRepo from '../repositories/taskRepository';
import * as habitRepo from '../repositories/habitRepository';
import * as noteRepo from '../repositories/noteRepository';
import * as journalRepo from '../repositories/journalRepository';
import * as profileRepo from '../repositories/profileRepository';
import { aggregateGoal, aggregateHabit } from '../domain/planning';
import { formatLocalDate, getGreeting, formatHeaderDate } from '../domain/dates';

interface AppContextValue {
  isLoading: boolean;
  profile: Profile | null;
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  notes: Note[];
  journalEntries: JournalEntry[];

  // Aggregated Views
  goalsWithProgress: GoalWithProgress[];
  habitsWithProgress: HabitWithWeeklyProgress[];
  dashboardSummary: DashboardSummary;

  // Actions
  refreshData: () => Promise<void>;

  // Goals & Milestones
  createGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  archiveGoal: (id: string) => Promise<void>;

  createMilestone: (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => Promise<Milestone>;
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<Milestone>;
  toggleMilestone: (id: string) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;

  // Tasks
  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Habits
  createHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>;
  toggleHabitLog: (habitId: string, logDate: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Notes
  createNote: (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;

  // Journal
  createJournalEntry: (entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<JournalEntry>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<JournalEntry>;
  deleteJournalEntry: (id: string) => Promise<void>;

  // Profile & Settings
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const loadData = useCallback(async () => {
    try {
      await getDatabase();
      const p = await profileRepo.getProfile(DEFAULT_USER_ID);
      const g = await goalRepo.getGoals(DEFAULT_USER_ID);
      const m = await milestoneRepo.getAllMilestones();
      const t = await taskRepo.getTasks(DEFAULT_USER_ID);
      const h = await habitRepo.getHabits(DEFAULT_USER_ID, true);
      const hl = await habitRepo.getAllHabitLogs();
      const n = await noteRepo.getNotes(DEFAULT_USER_ID);
      const j = await journalRepo.getJournalEntries(DEFAULT_USER_ID);

      setProfile(p);
      setGoals(g);
      setMilestones(m);
      setTasks(t);
      setHabits(h);
      setHabitLogs(hl);
      setNotes(n);
      setJournalEntries(j);
    } catch (error) {
      console.error('Failed to load local data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregated goals
  const goalsWithProgress = useMemo(() => {
    return goals
      .filter((g) => g.status !== 'archived')
      .map((g) => aggregateGoal(g, milestones, tasks));
  }, [goals, milestones, tasks]);

  // Aggregated habits
  const habitsWithProgress = useMemo(() => {
    const activeHabits = habits.filter((h) => h.archived_at === null);
    const weekStart = profile?.week_start ?? 1;
    return activeHabits.map((h) => aggregateHabit(h, habitLogs, new Date(), weekStart));
  }, [habits, habitLogs, profile?.week_start]);

  // Dashboard summary computed from real SQLite application data
  const dashboardSummary = useMemo<DashboardSummary>(() => {
    const todayStr = formatLocalDate(new Date());
    const tasksForToday = tasks.filter((t) => t.due_at === todayStr);
    const tasksCompletedToday = tasksForToday.filter((t) => t.status === 'completed').length;
    const todayProgressPercent =
      tasksForToday.length > 0 ? Math.round((tasksCompletedToday / tasksForToday.length) * 100) : 0;

    const prioritiesToday = tasks.filter(
      (t) => t.status === 'todo' && t.due_at === todayStr && t.priority === 'high'
    );

    const upcomingDeadlines = tasks
      .filter((t) => t.status === 'todo' && t.due_at !== null && t.due_at >= todayStr)
      .slice(0, 5);

    const activeGoals = goalsWithProgress.slice(0, 3);
    const habitsOverview = habitsWithProgress.slice(0, 4);

    return {
      greeting: getGreeting(),
      currentDateFormatted: formatHeaderDate(),
      tasksTotalToday: tasksForToday.length,
      tasksCompletedToday,
      todayProgressPercent,
      prioritiesToday,
      upcomingDeadlines,
      activeGoals,
      habitsOverview,
    };
  }, [tasks, goalsWithProgress, habitsWithProgress]);

  // Goal actions
  const createGoal = useCallback(
    async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const created = await goalRepo.createGoal({
        ...goalData,
        user_id: DEFAULT_USER_ID,
      });
      await loadData();
      return created;
    },
    [loadData]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<Goal>) => {
      const updated = await goalRepo.updateGoal(id, updates);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      await goalRepo.deleteGoal(id);
      await loadData();
    },
    [loadData]
  );

  const archiveGoal = useCallback(
    async (id: string) => {
      await goalRepo.archiveGoal(id);
      await loadData();
    },
    [loadData]
  );

  // Milestone actions
  const createMilestone = useCallback(
    async (milestoneData: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
      const created = await milestoneRepo.createMilestone(milestoneData);
      await loadData();
      return created;
    },
    [loadData]
  );

  const updateMilestone = useCallback(
    async (id: string, updates: Partial<Milestone>) => {
      const updated = await milestoneRepo.updateMilestone(id, updates);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const toggleMilestone = useCallback(
    async (id: string) => {
      await milestoneRepo.toggleMilestone(id);
      await loadData();
    },
    [loadData]
  );

  const deleteMilestone = useCallback(
    async (id: string) => {
      await milestoneRepo.deleteMilestone(id);
      await loadData();
    },
    [loadData]
  );

  // Task actions
  const createTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const created = await taskRepo.createTask({
        ...taskData,
        user_id: DEFAULT_USER_ID,
      });
      await loadData();
      return created;
    },
    [loadData]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const updated = await taskRepo.updateTask(id, updates);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      await taskRepo.toggleTask(id);
      await loadData();
    },
    [loadData]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await taskRepo.deleteTask(id);
      await loadData();
    },
    [loadData]
  );

  // Habit actions
  const createHabit = useCallback(
    async (habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const created = await habitRepo.createHabit({
        ...habitData,
        user_id: DEFAULT_USER_ID,
      });
      await loadData();
      return created;
    },
    [loadData]
  );

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>) => {
      const updated = await habitRepo.updateHabit(id, updates);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const toggleHabitLog = useCallback(
    async (habitId: string, logDate: string) => {
      await habitRepo.toggleHabitLog(habitId, logDate);
      await loadData();
    },
    [loadData]
  );

  const archiveHabit = useCallback(
    async (id: string) => {
      await habitRepo.archiveHabit(id);
      await loadData();
    },
    [loadData]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await habitRepo.deleteHabit(id);
      await loadData();
    },
    [loadData]
  );

  // Note actions
  const createNote = useCallback(
    async (noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const created = await noteRepo.createNote({
        ...noteData,
        user_id: DEFAULT_USER_ID,
      });
      await loadData();
      return created;
    },
    [loadData]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      const updated = await noteRepo.updateNote(id, updates);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await noteRepo.deleteNote(id);
      await loadData();
    },
    [loadData]
  );

  // Journal actions
  const createJournalEntry = useCallback(
    async (entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const created = await journalRepo.createJournalEntry({
        ...entryData,
        user_id: DEFAULT_USER_ID,
      });
      await loadData();
      return created;
    },
    [loadData]
  );

  const updateJournalEntry = useCallback(
    async (id: string, updates: Partial<JournalEntry>) => {
      const updated = await journalRepo.updateJournalEntry(id, updates);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const deleteJournalEntry = useCallback(
    async (id: string) => {
      await journalRepo.deleteJournalEntry(id);
      await loadData();
    },
    [loadData]
  );

  // Profile actions
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      const updated = await profileRepo.updateProfile(DEFAULT_USER_ID, updates);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const resetAllData = useCallback(async () => {
    await profileRepo.resetAllUserData(DEFAULT_USER_ID);
    await loadData();
  }, [loadData]);

  const value = useMemo<AppContextValue>(() => ({
    isLoading,
    profile,
    goals,
    milestones,
    tasks,
    habits,
    habitLogs,
    notes,
    journalEntries,
    goalsWithProgress,
    habitsWithProgress,
    dashboardSummary,
    refreshData: loadData,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    createMilestone,
    updateMilestone,
    toggleMilestone,
    deleteMilestone,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    createHabit,
    updateHabit,
    toggleHabitLog,
    archiveHabit,
    deleteHabit,
    createNote,
    updateNote,
    deleteNote,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    updateProfile,
    resetAllData,
  }), [
    isLoading,
    profile,
    goals,
    milestones,
    tasks,
    habits,
    habitLogs,
    notes,
    journalEntries,
    goalsWithProgress,
    habitsWithProgress,
    dashboardSummary,
    loadData,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    createMilestone,
    updateMilestone,
    toggleMilestone,
    deleteMilestone,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    createHabit,
    updateHabit,
    toggleHabitLog,
    archiveHabit,
    deleteHabit,
    createNote,
    updateNote,
    deleteNote,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    updateProfile,
    resetAllData,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
