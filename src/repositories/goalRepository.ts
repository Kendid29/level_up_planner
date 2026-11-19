// Level Up Planner: Goal Repository
import { getDatabase } from '../database/db';
import { Goal, GoalHorizon, GoalStatus, PriorityLevel } from '../types/models';

export async function getGoals(userId: string, statusFilter?: GoalStatus): Promise<Goal[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM goals WHERE user_id = ?';
  const params: (string | number)[] = [userId];

  if (statusFilter) {
    query += ' AND status = ?';
    params.push(statusFilter);
  } else {
    query += " AND status != 'archived'";
  }

  query += ' ORDER BY created_at DESC';
  return await db.getAllAsync<Goal>(query, params);
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Goal>('SELECT * FROM goals WHERE id = ?', [id]);
}

export async function createGoal(
  goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>
): Promise<Goal> {
  const db = await getDatabase();
  const id = 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO goals (id, user_id, title, description, horizon, category, start_date, target_date, priority, status, completed_at, completion_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      goal.user_id,
      goal.title.trim(),
      goal.description ? goal.description.trim() : null,
      goal.horizon,
      goal.category,
      goal.start_date,
      goal.target_date || null,
      goal.priority,
      goal.status,
      goal.completed_at || null,
      goal.completion_note || null,
      now,
      now,
    ]
  );

  return (await getGoalById(id))!;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  const db = await getDatabase();
  const existing = await getGoalById(id);
  if (!existing) {
    throw new Error(`Goal with id ${id} not found`);
  }

  const now = new Date().toISOString();
  const updated: Goal = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE goals SET
       title = ?,
       description = ?,
       horizon = ?,
       category = ?,
       start_date = ?,
       target_date = ?,
       priority = ?,
       status = ?,
       completed_at = ?,
       completion_note = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updated.title.trim(),
      updated.description ? updated.description.trim() : null,
      updated.horizon,
      updated.category,
      updated.start_date,
      updated.target_date || null,
      updated.priority,
      updated.status,
      updated.completed_at || null,
      updated.completion_note || null,
      now,
      id,
    ]
  );

  return (await getGoalById(id))!;
}

export async function completeGoal(id: string, completionNote?: string): Promise<Goal> {
  const now = new Date().toISOString();
  return await updateGoal(id, {
    status: 'completed',
    completed_at: now,
    completion_note: completionNote ? completionNote.trim() : null,
  });
}

export async function reopenGoal(id: string): Promise<Goal> {
  return await updateGoal(id, {
    status: 'active',
    completed_at: null,
  });
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
}

export async function archiveGoal(id: string): Promise<void> {
  await updateGoal(id, { status: 'archived' });
}
