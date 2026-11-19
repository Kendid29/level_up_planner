// Unit tests for backup payload validation and relational integrity
import { describe, it, expect } from '@jest/globals';
import {
  validateBackupPayload,
  APPLICATION_IDENTIFIER,
} from '../backupValidation';

describe('Backup Payload Validation & Relational Integrity', () => {
  const validBackup = {
    application_identifier: APPLICATION_IDENTIFIER,
    backup_version: 1,
    created_at: '2026-11-19T10:00:00.000Z',
    app_version: '1.0.0',
    schema_version: 2,
    summary: {},
    data: {
      goals: [
        { id: 'goal_1', title: 'Run a marathon', horizon: 'long', category: 'Health' },
      ],
      milestones: [
        { id: 'ms_1', goal_id: 'goal_1', title: 'Run 10k', sort_order: 1 },
      ],
      tasks: [
        { id: 'task_1', title: 'Buy running shoes', goal_id: 'goal_1', milestone_id: 'ms_1' },
      ],
      habits: [
        { id: 'habit_1', title: 'Morning stretch', frequency: 7 },
      ],
      habit_logs: [
        { id: 'hl_1', habit_id: 'habit_1', log_date: '2026-11-19', completed: 1 },
      ],
      notes: [
        { id: 'note_1', title: 'Shoe options', body: 'Brooks or Asics' },
      ],
      journal_entries: [
        { id: 'j_1', title: 'Starting training', body: 'Felt great today', entry_date: '2026-11-19' },
      ],
      weekly_reviews: [
        { id: 'wr_1', week_start_date: '2026-11-16', week_end_date: '2026-11-22', period_key: '2026-W47' },
      ],
      weekly_priorities: [
        { id: 'wp_1', weekly_review_id: 'wr_1', title: 'Consistent morning runs' },
      ],
      categories: [
        { id: 'cat_1', name: 'Health', color: '#526B56', is_default: 1 },
      ],
    },
  };

  it('validates a correct, fully-formed backup payload', () => {
    const result = validateBackupPayload(validBackup);
    expect(result.isValid).toBe(true);
    expect(result.summary?.totalItems).toBe(10);
    expect(result.summary?.breakdown.goals).toBe(1);
    expect(result.summary?.breakdown.milestones).toBe(1);
  });

  it('rejects payload with wrong application identifier', () => {
    const invalid = { ...validBackup, application_identifier: 'other-app' };
    const result = validateBackupPayload(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid application identifier');
  });

  it('rejects unsupported backup versions', () => {
    const invalid = { ...validBackup, backup_version: 99 };
    const result = validateBackupPayload(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Unsupported backup version');
  });

  it('rejects duplicate IDs within entity collections', () => {
    const invalid = {
      ...validBackup,
      data: {
        ...validBackup.data,
        goals: [
          { id: 'goal_dup', title: 'Goal 1' },
          { id: 'goal_dup', title: 'Goal 2' },
        ],
      },
    };
    const result = validateBackupPayload(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Duplicate goal ID detected');
  });

  it('catches broken foreign keys from milestones to goals', () => {
    const invalid = {
      ...validBackup,
      data: {
        ...validBackup.data,
        milestones: [
          { id: 'ms_orphan', goal_id: 'non_existent_goal', title: 'Orphan milestone' },
        ],
      },
    };
    const result = validateBackupPayload(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('references non-existent goal');
  });

  it('catches broken foreign keys from habit logs to habits', () => {
    const invalid = {
      ...validBackup,
      data: {
        ...validBackup.data,
        habit_logs: [
          { id: 'hl_orphan', habit_id: 'non_existent_habit', log_date: '2026-11-19' },
        ],
      },
    };
    const result = validateBackupPayload(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('references non-existent habit');
  });

  it('catches broken foreign keys from weekly priorities to reviews', () => {
    const invalid = {
      ...validBackup,
      data: {
        ...validBackup.data,
        weekly_priorities: [
          { id: 'wp_orphan', weekly_review_id: 'non_existent_review', title: 'Priority' },
        ],
      },
    };
    const result = validateBackupPayload(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('references non-existent review');
  });
});
