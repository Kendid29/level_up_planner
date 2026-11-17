// Level Up Planner — Milestone Repository
import { getDatabase } from '../database/db';
import { Milestone } from '../types/models';

export async function getMilestonesByGoal(goalId: string): Promise<Milestone[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Milestone>(
    'SELECT * FROM milestones WHERE goal_id = ? ORDER BY sort_order ASC, created_at ASC',
    [goalId]
  );
}

export async function getAllMilestones(): Promise<Milestone[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Milestone>(
    'SELECT * FROM milestones ORDER BY sort_order ASC, created_at ASC'
  );
}

export async function getMilestoneById(id: string): Promise<Milestone | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Milestone>('SELECT * FROM milestones WHERE id = ?', [id]);
}

export async function createMilestone(
  milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>
): Promise<Milestone> {
  const db = await getDatabase();
  const id = 'ms_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO milestones (id, goal_id, title, description, sort_order, target_date, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      milestone.goal_id,
      milestone.title.trim(),
      milestone.description ? milestone.description.trim() : null,
      milestone.sort_order,
      milestone.target_date || null,
      milestone.completed_at || null,
      now,
      now,
    ]
  );

  return (await getMilestoneById(id))!;
}

export async function updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
  const db = await getDatabase();
  const existing = await getMilestoneById(id);
  if (!existing) {
    throw new Error(`Milestone with id ${id} not found`);
  }

  const now = new Date().toISOString();
  const updated: Milestone = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE milestones SET
       title = ?,
       description = ?,
       sort_order = ?,
       target_date = ?,
       completed_at = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updated.title.trim(),
      updated.description ? updated.description.trim() : null,
      updated.sort_order,
      updated.target_date || null,
      updated.completed_at || null,
      now,
      id,
    ]
  );

  return (await getMilestoneById(id))!;
}

export async function toggleMilestone(id: string): Promise<Milestone> {
  const existing = await getMilestoneById(id);
  if (!existing) {
    throw new Error(`Milestone with id ${id} not found`);
  }
  const isCompleted = existing.completed_at !== null;
  const newCompletedAt = isCompleted ? null : new Date().toISOString();
  return await updateMilestone(id, { completed_at: newCompletedAt });
}

export async function deleteMilestone(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM milestones WHERE id = ?', [id]);
}
