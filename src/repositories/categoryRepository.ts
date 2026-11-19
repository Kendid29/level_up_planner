// Level Up Planner: Category Repository (Phase 2)
import { getDatabase } from '../database/db';
import { Category } from '../types/models';

export async function getCategories(
  userId: string,
  includeArchived: boolean = false
): Promise<Category[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM categories WHERE user_id = ?';
  if (!includeArchived) {
    query += ' AND archived_at IS NULL';
  }
  query += ' ORDER BY is_default DESC, name ASC';
  return await db.getAllAsync<Category>(query, [userId]);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', [id]);
}

export async function getCategoryByName(userId: string, name: string): Promise<Category | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Category>(
    'SELECT * FROM categories WHERE user_id = ? AND name = ?',
    [userId, name]
  );
}

export async function createCategory(
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<Category> {
  const db = await getDatabase();
  const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO categories (id, user_id, name, color, icon, is_default, archived_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      category.user_id,
      category.name.trim(),
      category.color,
      category.icon || 'Tag',
      category.is_default ?? 0,
      category.archived_at || null,
      now,
      now,
    ]
  );

  return (await getCategoryById(id))!;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const db = await getDatabase();
  const existing = await getCategoryById(id);
  if (!existing) {
    throw new Error(`Category with id ${id} not found`);
  }

  const now = new Date().toISOString();
  const updated: Category = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  // If the category name changed, update references in tasks, goals, habits atomically
  if (updates.name && updates.name.trim() !== existing.name) {
    const oldName = existing.name;
    const newName = updates.name.trim();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'UPDATE tasks SET category = ?, updated_at = ? WHERE user_id = ? AND category = ?',
        [newName, now, existing.user_id, oldName]
      );
      await db.runAsync(
        'UPDATE goals SET category = ?, updated_at = ? WHERE user_id = ? AND category = ?',
        [newName, now, existing.user_id, oldName]
      );
      await db.runAsync(
        'UPDATE habits SET category = ?, updated_at = ? WHERE user_id = ? AND category = ?',
        [newName, now, existing.user_id, oldName]
      );
      await db.runAsync(
        `UPDATE categories SET
           name = ?,
           color = ?,
           icon = ?,
           archived_at = ?,
           updated_at = ?
         WHERE id = ?`,
        [newName, updated.color, updated.icon, updated.archived_at || null, now, id]
      );
    });
  } else {
    await db.runAsync(
      `UPDATE categories SET
         name = ?,
         color = ?,
         icon = ?,
         archived_at = ?,
         updated_at = ?
       WHERE id = ?`,
      [
        updated.name.trim(),
        updated.color,
        updated.icon,
        updated.archived_at || null,
        now,
        id,
      ]
    );
  }

  return (await getCategoryById(id))!;
}

export async function getCategoryUsageCounts(
  userId: string,
  categoryName: string
): Promise<{ tasksCount: number; goalsCount: number; habitsCount: number; total: number }> {
  const db = await getDatabase();

  const taskRow = await db.getFirstAsync<{ count: number }>(
    'SELECT count(*) as count FROM tasks WHERE user_id = ? AND category = ?',
    [userId, categoryName]
  );
  const goalRow = await db.getFirstAsync<{ count: number }>(
    'SELECT count(*) as count FROM goals WHERE user_id = ? AND category = ?',
    [userId, categoryName]
  );
  const habitRow = await db.getFirstAsync<{ count: number }>(
    'SELECT count(*) as count FROM habits WHERE user_id = ? AND category = ?',
    [userId, categoryName]
  );

  const tasksCount = taskRow?.count ?? 0;
  const goalsCount = goalRow?.count ?? 0;
  const habitsCount = habitRow?.count ?? 0;

  return {
    tasksCount,
    goalsCount,
    habitsCount,
    total: tasksCount + goalsCount + habitsCount,
  };
}

export async function deleteCategory(
  id: string,
  reassignToCategoryName?: string | null
): Promise<void> {
  const db = await getDatabase();
  const existing = await getCategoryById(id);
  if (!existing) return;

  if (existing.is_default === 1) {
    throw new Error('Default system categories cannot be deleted.');
  }

  const fallbackCategory = reassignToCategoryName || 'Personal Growth';
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    // Reassign existing tasks, goals, habits safely
    await db.runAsync(
      'UPDATE tasks SET category = ?, updated_at = ? WHERE user_id = ? AND category = ?',
      [fallbackCategory, now, existing.user_id, existing.name]
    );
    await db.runAsync(
      'UPDATE goals SET category = ?, updated_at = ? WHERE user_id = ? AND category = ?',
      [fallbackCategory, now, existing.user_id, existing.name]
    );
    await db.runAsync(
      'UPDATE habits SET category = ?, updated_at = ? WHERE user_id = ? AND category = ?',
      [fallbackCategory, now, existing.user_id, existing.name]
    );
    // Delete the category
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  });
}
