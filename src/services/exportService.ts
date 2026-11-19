// Level Up Planner: CSV Export Service
// Exports domain entities into secure, formatted CSV files with formula injection protection
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../database/db';
import { serializeToCSV } from '../domain/csv';
import { formatLocalDate } from '../domain/dates';

export type ExportEntityType =
  | 'goals'
  | 'milestones'
  | 'tasks'
  | 'habits'
  | 'habit_logs'
  | 'notes'
  | 'journal_entries'
  | 'weekly_reviews'
  | 'categories';

export interface ExportResult {
  fileUri: string;
  fileName: string;
  rowCount: number;
}

export const EXPORT_ENTITY_CONFIGS: Record<
  ExportEntityType,
  { label: string; tableName: string; columns: { key: string; header: string }[] }
> = {
  goals: {
    label: 'Goals',
    tableName: 'goals',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Title' },
      { key: 'horizon', header: 'Time Horizon' },
      { key: 'category', header: 'Category' },
      { key: 'priority', header: 'Priority' },
      { key: 'status', header: 'Status' },
      { key: 'start_date', header: 'Start Date' },
      { key: 'target_date', header: 'Target Date' },
      { key: 'completed_at', header: 'Completed Date' },
      { key: 'completion_note', header: 'Reflection Note' },
      { key: 'description', header: 'Description' },
      { key: 'created_at', header: 'Created At' },
    ],
  },
  milestones: {
    label: 'Milestones',
    tableName: 'milestones',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'goal_id', header: 'Goal ID' },
      { key: 'title', header: 'Title' },
      { key: 'sort_order', header: 'Sort Order' },
      { key: 'target_date', header: 'Target Date' },
      { key: 'completed_at', header: 'Completed At' },
      { key: 'description', header: 'Description' },
      { key: 'created_at', header: 'Created At' },
    ],
  },
  tasks: {
    label: 'Tasks',
    tableName: 'tasks',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Title' },
      { key: 'status', header: 'Status' },
      { key: 'priority', header: 'Priority' },
      { key: 'category', header: 'Category' },
      { key: 'due_at', header: 'Due Date' },
      { key: 'due_time', header: 'Due Time' },
      { key: 'completed_at', header: 'Completed At' },
      { key: 'goal_id', header: 'Goal ID' },
      { key: 'milestone_id', header: 'Milestone ID' },
      { key: 'description', header: 'Description' },
      { key: 'created_at', header: 'Created At' },
    ],
  },
  habits: {
    label: 'Habits',
    tableName: 'habits',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Title' },
      { key: 'category', header: 'Category' },
      { key: 'frequency', header: 'Frequency (days/wk)' },
      { key: 'active_days', header: 'Active Days' },
      { key: 'start_date', header: 'Start Date' },
      { key: 'reminder_time', header: 'Reminder Time' },
      { key: 'archived_at', header: 'Archived At' },
      { key: 'created_at', header: 'Created At' },
    ],
  },
  habit_logs: {
    label: 'Habit Logs',
    tableName: 'habit_logs',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'habit_id', header: 'Habit ID' },
      { key: 'log_date', header: 'Log Date' },
      { key: 'completed', header: 'Completed' },
      { key: 'created_at', header: 'Created At' },
    ],
  },
  notes: {
    label: 'Notes',
    tableName: 'notes',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Title' },
      { key: 'category', header: 'Category' },
      { key: 'body', header: 'Note Content' },
      { key: 'created_at', header: 'Created At' },
      { key: 'updated_at', header: 'Updated At' },
    ],
  },
  journal_entries: {
    label: 'Journal Entries',
    tableName: 'journal_entries',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'entry_date', header: 'Entry Date' },
      { key: 'title', header: 'Title' },
      { key: 'body', header: 'Journal Content' },
      { key: 'created_at', header: 'Created At' },
      { key: 'updated_at', header: 'Updated At' },
    ],
  },
  weekly_reviews: {
    label: 'Weekly Reviews',
    tableName: 'weekly_reviews',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'period_key', header: 'Period Key' },
      { key: 'week_start_date', header: 'Week Start' },
      { key: 'week_end_date', header: 'Week End' },
      { key: 'total_tasks', header: 'Total Tasks' },
      { key: 'completed_tasks', header: 'Completed Tasks' },
      { key: 'completion_percentage', header: 'Completion Rate %' },
      { key: 'active_goals_count', header: 'Active Goals' },
      { key: 'completed_milestones_count', header: 'Completed Milestones' },
      { key: 'habit_completion_rate', header: 'Habit Rate %' },
      { key: 'reflection_went_well', header: 'What Went Well' },
      { key: 'reflection_challenges', header: 'Challenges' },
      { key: 'reflection_learnings', header: 'Learnings' },
      { key: 'reflection_improvements', header: 'Next Improvements' },
      { key: 'created_at', header: 'Created At' },
    ],
  },
  categories: {
    label: 'Categories',
    tableName: 'categories',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Category Name' },
      { key: 'color', header: 'Color Code' },
      { key: 'icon', header: 'Icon' },
      { key: 'is_default', header: 'Is Standard' },
      { key: 'created_at', header: 'Created At' },
    ],
  },
};

/**
 * Exports data for a specific entity type to a CSV file and prompts the native share sheet.
 */
export async function exportEntityToCSV(
  entityType: ExportEntityType,
  options?: { triggerShare?: boolean }
): Promise<ExportResult> {
  const db = await getDatabase();
  const config = EXPORT_ENTITY_CONFIGS[entityType];

  if (!config) {
    throw new Error(`Unsupported export entity type: ${entityType}`);
  }

  const rows = await db.getAllAsync<any>(`SELECT * FROM ${config.tableName} ORDER BY created_at DESC;`);
  const csvContent = serializeToCSV(config.columns, rows);

  const todayStr = formatLocalDate(new Date());
  const fileName = `level_up_planner_${entityType}_${todayStr}.csv`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const shouldShare = options?.triggerShare ?? true;
  if (shouldShare) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Export ${config.label} CSV`,
        UTI: 'public.comma-separated-values-text',
      });
    }
  }

  return {
    fileUri,
    fileName,
    rowCount: rows.length,
  };
}

/**
 * Exports all supported entities as individual CSV files sequentially.
 */
export async function exportAllEntitiesToCSV(): Promise<ExportResult[]> {
  const entityTypes: ExportEntityType[] = [
    'goals',
    'milestones',
    'tasks',
    'habits',
    'habit_logs',
    'notes',
    'journal_entries',
    'weekly_reviews',
    'categories',
  ];

  const results: ExportResult[] = [];
  for (const entity of entityTypes) {
    const res = await exportEntityToCSV(entity, { triggerShare: false });
    results.push(res);
  }

  return results;
}
