// Level Up Planner: Backup Validation & Integrity Verification
// Strictly validates application identity, schema version, and foreign-key integrity

export const APPLICATION_IDENTIFIER = 'level-up-planner';
export const SUPPORTED_BACKUP_VERSIONS = [1];
export const CURRENT_BACKUP_VERSION = 1;
export const CURRENT_SCHEMA_VERSION = 2;

export interface BackupMetadata {
  application_identifier: string;
  backup_version: number;
  created_at: string;
  app_version: string;
  schema_version: number;
  summary: Record<string, number>;
  data: {
    profiles?: any[];
    categories?: any[];
    goals?: any[];
    milestones?: any[];
    tasks?: any[];
    habits?: any[];
    habit_logs?: any[];
    notes?: any[];
    journal_entries?: any[];
    weekly_reviews?: any[];
    weekly_priorities?: any[];
    reminder_preferences?: any[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  summary?: {
    totalItems: number;
    breakdown: Record<string, number>;
    createdAt: string;
    appVersion: string;
  };
}

/**
 * Validates a parsed JSON backup object against schema requirements and foreign key constraints.
 */
export function validateBackupPayload(payload: any): ValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Invalid backup: content is not a JSON object.' };
  }

  // 1. Verify Application Identifier
  if (payload.application_identifier !== APPLICATION_IDENTIFIER) {
    return {
      isValid: false,
      error: `Invalid application identifier. Expected "${APPLICATION_IDENTIFIER}", got "${payload.application_identifier}".`,
    };
  }

  // 2. Verify Backup Version
  if (!SUPPORTED_BACKUP_VERSIONS.includes(payload.backup_version)) {
    return {
      isValid: false,
      error: `Unsupported backup version: ${payload.backup_version}. Supported versions: ${SUPPORTED_BACKUP_VERSIONS.join(', ')}.`,
    };
  }

  // 3. Verify Data Object
  if (!payload.data || typeof payload.data !== 'object') {
    return { isValid: false, error: 'Backup is missing data object.' };
  }

  const { data } = payload;
  const tables = [
    'goals',
    'milestones',
    'tasks',
    'habits',
    'habit_logs',
    'notes',
    'journal_entries',
    'categories',
  ];

  for (const table of tables) {
    if (data[table] !== undefined && !Array.isArray(data[table])) {
      return {
        isValid: false,
        error: `Invalid data format: "${table}" must be an array.`,
      };
    }
  }

  // 4. Primary Key Uniqueness & ID Checks
  const goalIds = new Set<string>();
  for (const g of data.goals || []) {
    if (!g.id || typeof g.id !== 'string') {
      return { isValid: false, error: 'Invalid goal: missing primary key ID.' };
    }
    if (goalIds.has(g.id)) {
      return { isValid: false, error: `Duplicate goal ID detected: ${g.id}.` };
    }
    goalIds.add(g.id);
  }

  const milestoneIds = new Set<string>();
  for (const m of data.milestones || []) {
    if (!m.id || typeof m.id !== 'string') {
      return { isValid: false, error: 'Invalid milestone: missing primary key ID.' };
    }
    if (milestoneIds.has(m.id)) {
      return { isValid: false, error: `Duplicate milestone ID detected: ${m.id}.` };
    }
    // Foreign key check: milestone -> goal
    if (!m.goal_id || !goalIds.has(m.goal_id)) {
      return {
        isValid: false,
        error: `Milestone "${m.title || m.id}" references non-existent goal "${m.goal_id}".`,
      };
    }
    milestoneIds.add(m.id);
  }

  const habitIds = new Set<string>();
  for (const h of data.habits || []) {
    if (!h.id || typeof h.id !== 'string') {
      return { isValid: false, error: 'Invalid habit: missing primary key ID.' };
    }
    if (habitIds.has(h.id)) {
      return { isValid: false, error: `Duplicate habit ID detected: ${h.id}.` };
    }
    habitIds.add(h.id);
  }

  for (const hl of data.habit_logs || []) {
    if (!hl.id || !hl.habit_id || !habitIds.has(hl.habit_id)) {
      return {
        isValid: false,
        error: `Habit log references non-existent habit "${hl.habit_id}".`,
      };
    }
  }

  const reviewIds = new Set<string>();
  for (const wr of data.weekly_reviews || []) {
    if (!wr.id) {
      return { isValid: false, error: 'Invalid weekly review: missing ID.' };
    }
    reviewIds.add(wr.id);
  }

  for (const wp of data.weekly_priorities || []) {
    if (!wp.id || !wp.weekly_review_id || !reviewIds.has(wp.weekly_review_id)) {
      return {
        isValid: false,
        error: `Weekly priority references non-existent review "${wp.weekly_review_id}".`,
      };
    }
  }

  // 5. Calculate summary
  const breakdown: Record<string, number> = {
    goals: (data.goals || []).length,
    milestones: (data.milestones || []).length,
    tasks: (data.tasks || []).length,
    habits: (data.habits || []).length,
    habit_logs: (data.habit_logs || []).length,
    notes: (data.notes || []).length,
    journal_entries: (data.journal_entries || []).length,
    categories: (data.categories || []).length,
    weekly_reviews: (data.weekly_reviews || []).length,
    weekly_priorities: (data.weekly_priorities || []).length,
  };

  const totalItems = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    isValid: true,
    summary: {
      totalItems,
      breakdown,
      createdAt: payload.created_at || new Date().toISOString(),
      appVersion: payload.app_version || '1.0.0',
    },
  };
}
