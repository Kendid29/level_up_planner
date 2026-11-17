// Level Up Planner — Habit Repository
import { getDatabase } from '../database/db';
import { Habit, HabitLog } from '../types/models';

export async function getHabits(userId: string, includeArchived: boolean = false): Promise<Habit[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM habits WHERE user_id = ?';
  if (!includeArchived) {
    query += ' AND archived_at IS NULL';
  }
  query += ' ORDER BY created_at ASC';
  return await db.getAllAsync<Habit>(query, [userId]);
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?', [id]);
}

export async function createHabit(
  habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>
): Promise<Habit> {
  const db = await getDatabase();
  const id = 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO habits (id, user_id, title, frequency, active_days, start_date, archived_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      habit.user_id,
      habit.title.trim(),
      habit.frequency,
      habit.active_days,
      habit.start_date,
      habit.archived_at || null,
      now,
      now,
    ]
  );

  return (await getHabitById(id))!;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
  const db = await getDatabase();
  const existing = await getHabitById(id);
  if (!existing) {
    throw new Error(`Habit with id ${id} not found`);
  }

  const now = new Date().toISOString();
  const updated: Habit = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE habits SET
       title = ?,
       frequency = ?,
       active_days = ?,
       start_date = ?,
       archived_at = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updated.title.trim(),
      updated.frequency,
      updated.active_days,
      updated.start_date,
      updated.archived_at || null,
      now,
      id,
    ]
  );

  return (await getHabitById(id))!;
}

export async function archiveHabit(id: string): Promise<void> {
  await updateHabit(id, { archived_at: new Date().toISOString() });
}

export async function unarchiveHabit(id: string): Promise<void> {
  await updateHabit(id, { archived_at: null });
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

export async function getAllHabitLogs(): Promise<HabitLog[]> {
  const db = await getDatabase();
  return await db.getAllAsync<HabitLog>('SELECT * FROM habit_logs ORDER BY log_date DESC');
}

export async function getHabitLogsByHabit(habitId: string): Promise<HabitLog[]> {
  const db = await getDatabase();
  return await db.getAllAsync<HabitLog>(
    'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY log_date DESC',
    [habitId]
  );
}

export async function toggleHabitLog(habitId: string, logDate: string): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<HabitLog>(
    'SELECT * FROM habit_logs WHERE habit_id = ? AND log_date = ?',
    [habitId, logDate]
  );

  if (existing) {
    const nextCompleted = existing.completed === 1 ? 0 : 1;
    await db.runAsync(
      'UPDATE habit_logs SET completed = ? WHERE id = ?',
      [nextCompleted, existing.id]
    );
    return nextCompleted === 1;
  } else {
    const id = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO habit_logs (id, habit_id, log_date, completed, created_at) VALUES (?, ?, ?, 1, ?)',
      [id, habitId, logDate, now]
    );
    return true;
  }
}
