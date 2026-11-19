// Level Up Planner: Weekly Review Repository
import { getDatabase } from '../database/db';
import { WeeklyReview, WeeklyPriority, WeeklyReviewWithPriorities } from '../types/models';

export async function getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
  const db = await getDatabase();
  return await db.getAllAsync<WeeklyReview>(
    'SELECT * FROM weekly_reviews WHERE user_id = ? ORDER BY week_start_date DESC',
    [userId]
  );
}

export async function getWeeklyReviewById(id: string): Promise<WeeklyReviewWithPriorities | null> {
  const db = await getDatabase();
  const review = await db.getFirstAsync<WeeklyReview>(
    'SELECT * FROM weekly_reviews WHERE id = ?',
    [id]
  );
  if (!review) return null;

  const priorities = await db.getAllAsync<WeeklyPriority>(
    'SELECT * FROM weekly_priorities WHERE weekly_review_id = ? ORDER BY sort_order ASC',
    [id]
  );

  return {
    ...review,
    priorities,
  };
}

export async function getWeeklyReviewByPeriod(
  userId: string,
  periodKey: string
): Promise<WeeklyReviewWithPriorities | null> {
  const db = await getDatabase();
  const review = await db.getFirstAsync<WeeklyReview>(
    'SELECT * FROM weekly_reviews WHERE user_id = ? AND period_key = ?',
    [userId, periodKey]
  );
  if (!review) return null;

  const priorities = await db.getAllAsync<WeeklyPriority>(
    'SELECT * FROM weekly_priorities WHERE weekly_review_id = ? ORDER BY sort_order ASC',
    [review.id]
  );

  return {
    ...review,
    priorities,
  };
}

export async function saveWeeklyReview(
  review: Omit<WeeklyReview, 'id' | 'created_at' | 'updated_at'>,
  priorities: { title: string; related_goal_id: string | null }[] = []
): Promise<WeeklyReviewWithPriorities> {
  const db = await getDatabase();
  const existing = await getWeeklyReviewByPeriod(review.user_id, review.period_key);
  const now = new Date().toISOString();

  let reviewId: string;

  if (existing) {
    reviewId = existing.id;
    await db.runAsync(
      `UPDATE weekly_reviews SET
         total_tasks = ?,
         completed_tasks = ?,
         completion_percentage = ?,
         active_goals_count = ?,
         completed_milestones_count = ?,
         habit_completion_rate = ?,
         reflection_went_well = ?,
         reflection_challenges = ?,
         reflection_learnings = ?,
         reflection_improvements = ?,
         updated_at = ?
       WHERE id = ?`,
      [
        review.total_tasks,
        review.completed_tasks,
        review.completion_percentage,
        review.active_goals_count,
        review.completed_milestones_count,
        review.habit_completion_rate,
        review.reflection_went_well || null,
        review.reflection_challenges || null,
        review.reflection_learnings || null,
        review.reflection_improvements || null,
        now,
        reviewId,
      ]
    );

    // Replace priorities
    await db.runAsync('DELETE FROM weekly_priorities WHERE weekly_review_id = ?', [reviewId]);
  } else {
    reviewId = 'wrev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    await db.runAsync(
      `INSERT INTO weekly_reviews (
         id, user_id, week_start_date, week_end_date, period_key,
         total_tasks, completed_tasks, completion_percentage,
         active_goals_count, completed_milestones_count, habit_completion_rate,
         reflection_went_well, reflection_challenges, reflection_learnings, reflection_improvements,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reviewId,
        review.user_id,
        review.week_start_date,
        review.week_end_date,
        review.period_key,
        review.total_tasks,
        review.completed_tasks,
        review.completion_percentage,
        review.active_goals_count,
        review.completed_milestones_count,
        review.habit_completion_rate,
        review.reflection_went_well || null,
        review.reflection_challenges || null,
        review.reflection_learnings || null,
        review.reflection_improvements || null,
        now,
        now,
      ]
    );
  }

  // Insert priorities (up to 3 as specified in PRD & user prompt)
  const topPriorities = priorities.slice(0, 3);
  for (let i = 0; i < topPriorities.length; i++) {
    const p = topPriorities[i];
    if (p.title && p.title.trim().length > 0) {
      const pId = 'wpri_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4);
      await db.runAsync(
        `INSERT INTO weekly_priorities (id, weekly_review_id, title, related_goal_id, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pId, reviewId, p.title.trim(), p.related_goal_id || null, i, now]
      );
    }
  }

  return (await getWeeklyReviewById(reviewId))!;
}

export async function deleteWeeklyReview(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM weekly_priorities WHERE weekly_review_id = ?', [id]);
  await db.runAsync('DELETE FROM weekly_reviews WHERE id = ?', [id]);
}
