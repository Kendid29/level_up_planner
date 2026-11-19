// Level Up Planner: Task Repository
import { getDatabase } from '../database/db';
import { Task, TaskStatus } from '../types/models';

export async function getTasks(userId: string): Promise<Task[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_at ASC, priority DESC, created_at DESC',
    [userId]
  );
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
}

export async function getTasksByGoal(goalId: string): Promise<Task[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE goal_id = ? ORDER BY due_at ASC, created_at DESC',
    [goalId]
  );
}

export async function getTasksByMilestone(milestoneId: string): Promise<Task[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE milestone_id = ? ORDER BY due_at ASC, created_at DESC',
    [milestoneId]
  );
}

export async function createTask(
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> {
  const db = await getDatabase();
  const id = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO tasks (id, user_id, goal_id, milestone_id, title, description, due_at, due_time, reminder_at, notification_id, priority, status, category, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      task.user_id,
      task.goal_id || null,
      task.milestone_id || null,
      task.title.trim(),
      task.description ? task.description.trim() : null,
      task.due_at || null,
      task.due_time || null,
      task.reminder_at || null,
      task.notification_id || null,
      task.priority,
      task.status,
      task.category,
      task.completed_at || null,
      now,
      now,
    ]
  );

  return (await getTaskById(id))!;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const db = await getDatabase();
  const existing = await getTaskById(id);
  if (!existing) {
    throw new Error(`Task with id ${id} not found`);
  }

  const now = new Date().toISOString();
  const updated: Task = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE tasks SET
       goal_id = ?,
       milestone_id = ?,
       title = ?,
       description = ?,
       due_at = ?,
       due_time = ?,
       reminder_at = ?,
       notification_id = ?,
       priority = ?,
       status = ?,
       category = ?,
       completed_at = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updated.goal_id || null,
      updated.milestone_id || null,
      updated.title.trim(),
      updated.description ? updated.description.trim() : null,
      updated.due_at || null,
      updated.due_time || null,
      updated.reminder_at || null,
      updated.notification_id || null,
      updated.priority,
      updated.status,
      updated.category,
      updated.completed_at || null,
      now,
      id,
    ]
  );

  return (await getTaskById(id))!;
}

export async function toggleTask(id: string): Promise<Task> {
  const existing = await getTaskById(id);
  if (!existing) {
    throw new Error(`Task with id ${id} not found`);
  }
  const isCompleted = existing.status === 'completed';
  const newStatus: TaskStatus = isCompleted ? 'todo' : 'completed';
  const newCompletedAt = isCompleted ? null : new Date().toISOString();

  return await updateTask(id, {
    status: newStatus,
    completed_at: newCompletedAt,
  });
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}
