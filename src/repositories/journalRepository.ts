// Level Up Planner: Journal Repository
import { getDatabase } from '../database/db';
import { JournalEntry } from '../types/models';

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const db = await getDatabase();
  return await db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC',
    [userId]
  );
}

export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<JournalEntry>('SELECT * FROM journal_entries WHERE id = ?', [id]);
}

export async function getJournalEntryByDate(userId: string, date: string): Promise<JournalEntry | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE user_id = ? AND entry_date = ? ORDER BY created_at DESC',
    [userId, date]
  );
}

export async function createJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>
): Promise<JournalEntry> {
  const db = await getDatabase();
  const id = 'journal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO journal_entries (id, user_id, title, body, entry_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      entry.user_id,
      entry.title ? entry.title.trim() : null,
      entry.body.trim(),
      entry.entry_date,
      now,
      now,
    ]
  );

  return (await getJournalEntryById(id))!;
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
  const db = await getDatabase();
  const existing = await getJournalEntryById(id);
  if (!existing) {
    throw new Error(`Journal entry with id ${id} not found`);
  }

  const now = new Date().toISOString();
  const updated: JournalEntry = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE journal_entries SET
       title = ?,
       body = ?,
       entry_date = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updated.title ? updated.title.trim() : null,
      updated.body.trim(),
      updated.entry_date,
      now,
      id,
    ]
  );

  return (await getJournalEntryById(id))!;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}
