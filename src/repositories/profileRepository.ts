// Level Up Planner: Profile & Settings Repository
import { getDatabase } from '../database/db';
import { Profile } from '../types/models';
import { DEFAULT_USER_ID, CREATE_TABLES_SQL } from '../database/schema';

export async function getProfile(userId: string = DEFAULT_USER_ID): Promise<Profile | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Profile>('SELECT * FROM profiles WHERE id = ?', [userId]);
}

export async function updateProfile(
  userId: string = DEFAULT_USER_ID,
  updates: Partial<Profile>
): Promise<Profile> {
  const db = await getDatabase();
  const existing = await getProfile(userId);
  if (!existing) {
    throw new Error(`Profile with id ${userId} not found`);
  }

  const now = new Date().toISOString();
  const updated: Profile = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.runAsync(
    `UPDATE profiles SET
       display_name = ?,
       week_start = ?,
       theme_preference = ?,
       onboarding_completed = ?,
       updated_at = ?
     WHERE id = ?`,
    [
      updated.display_name.trim(),
      updated.week_start,
      updated.theme_preference,
      updated.onboarding_completed,
      now,
      userId,
    ]
  );

  return (await getProfile(userId))!;
}

export async function resetAllUserData(userId: string = DEFAULT_USER_ID): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM tasks WHERE user_id = '${userId}';
    DELETE FROM milestones WHERE goal_id IN (SELECT id FROM goals WHERE user_id = '${userId}');
    DELETE FROM goals WHERE user_id = '${userId}';
    DELETE FROM habit_logs WHERE habit_id IN (SELECT id FROM habits WHERE user_id = '${userId}');
    DELETE FROM habits WHERE user_id = '${userId}';
    DELETE FROM notes WHERE user_id = '${userId}';
    DELETE FROM journal_entries WHERE user_id = '${userId}';
  `);
}
