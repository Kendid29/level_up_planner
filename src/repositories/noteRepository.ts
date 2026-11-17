// Level Up Planner: Note Repository
import { getDatabase } from '../database/db';
import { Note } from '../types/models';

export async function getNotes(userId: string, searchQuery?: string): Promise<Note[]> {
  const db = await getDatabase();
  if (searchQuery && searchQuery.trim().length > 0) {
    const term = `%${searchQuery.trim().toLowerCase()}%`;
    return await db.getAllAsync<Note>(
      'SELECT * FROM notes WHERE user_id = ? AND (LOWER(title) LIKE ? OR LOWER(body) LIKE ?) ORDER BY updated_at DESC',
      [userId, term, term]
    );
  }
  return await db.getAllAsync<Note>(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  );
}

export async function getNoteById(id: string): Promise<Note | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Note>('SELECT * FROM notes WHERE id = ?', [id]);
}

export async function createNote(
  note: Omit<Note, 'id' | 'created_at' | 'updated_at'>
): Promise<Note> {
  const db = await getDatabase();
  const id = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO notes (id, user_id, title, body, category, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      note.user_id,
      note.title.trim(),
      note.body.trim(),
      note.category || null,
      now,
      now,
    ]
  );

  return (await getNoteById(id))!;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const db = await getDatabase();
  const existing = await getNoteById(id);
  if (!existing) {
    throw new Error(`Note with id ${id} not found`);
  }

  const now = new Date().toISOString();
  const updated: Note = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE notes SET
       title = ?,
       body = ?,
       category = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updated.title.trim(),
      updated.body.trim(),
      updated.category || null,
      now,
      id,
    ]
  );

  return (await getNoteById(id))!;
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}
