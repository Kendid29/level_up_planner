# Phase 3 Implementation Summary — Level Up Planner
**Goal:** Data Ownership & Backup  
**Platforms:** Android-first, iOS compatible  
**Tech Stack:** React Native, Expo SDK 58, Expo Router, TypeScript, SQLite (`expo-sqlite`), `expo-file-system`, `expo-sharing`, `expo-document-picker`.

---

## 1. Scope & Delivered Features

### Feature A: Complete JSON Data Backup
- **Service:** `src/services/backupService.ts`
- **Specification:**
  - Standardized JSON container with complete metadata:
    - `application_identifier`: `"level-up-planner"`
    - `backup_version`: `1`
    - `created_at`: ISO 8601 timestamp
    - `app_version`: `"1.0.0"`
    - `schema_version`: `2`
    - `summary`: Entity count breakdown dictionary
    - `data`: Complete entity arrays preserving all primary keys, foreign keys, timestamps, and relations.
  - Entities Included:
    1. Profiles (`profiles`)
    2. Life Categories (`categories`)
    3. Goals (`goals` with `completed_at` & `completion_note`)
    4. Milestones (`milestones`)
    5. Tasks (`tasks` with `due_time`, `reminder_at`, `notification_id`)
    6. Habits (`habits` with `reminder_time`, `category`)
    7. Habit Logs (`habit_logs`)
    8. Notes (`notes`)
    9. Journal Entries (`journal_entries`)
    10. Weekly Reviews (`weekly_reviews`)
    11. Weekly Priorities (`weekly_priorities`)
    12. Reminder Preferences (`reminder_preferences`)
- **File Management & Sharing:**
  - Written to device cache as `level_up_planner_backup_YYYY-MM-DD_HH-mm-ss.json`.
  - Dispatched via native OS share dialog (`expo-sharing`).
  - Persists and displays last backup timestamp.

### Feature B: Validated Data Restore with Transactional Rollback
- **Service:** `src/services/restoreService.ts`
- **Validation Engine:** `src/domain/backupValidation.ts`
  - Rejects malformed JSON documents.
  - Verifies exact `application_identifier === 'level-up-planner'`.
  - Enforces supported `backup_version`.
  - Validates array structures and primary key uniqueness.
  - Checks foreign key relational integrity:
    - Milestones point to existing goals.
    - Tasks point to existing goals and milestones.
    - Habit logs point to existing habits.
    - Weekly priorities point to existing weekly reviews.
- **Safety & Atomic Execution:**
  - Shows clear pre-restore summary breakdown (item counts and creation date).
  - Offers toggle to create an automatic safety backup of current data before replacement.
  - Operates inside `db.withTransactionAsync`:
    - Deletion executed in strict child-to-parent order (`weekly_priorities` -> `weekly_reviews` -> `habit_logs` -> `habits` -> `tasks` -> `milestones` -> `goals` -> `notes` -> `journal_entries` -> `reminder_preferences` -> `categories` -> `profiles`).
    - Insertion executed in strict parent-to-child order.
    - Automatic rollback on any failure; zero partial or corrupted database states.
  - Seamlessly reloads all reactive app context (`refreshData()`).

### Feature C: CSV Data Export with Formula Injection Protection
- **Service:** `src/services/exportService.ts`
- **Serialization Engine:** `src/domain/csv.ts`
  - RFC 4180 compliance: Properly escapes commas, double quotes (`""`), and multiline strings.
  - UTF-8 BOM (`\uFEFF`) included so spreadsheet software (Excel, Numbers, Google Sheets, LibreOffice) cleanly displays Indonesian and accented characters.
  - **CSV Formula Injection (CWE-1236) Protection:**
    - Cells beginning with formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are automatically escaped with a leading single quote (`'`), preventing malicious execution in spreadsheet environments.
- **Entity Collections Supported:**
  - Goals (`level_up_planner_goals_YYYY-MM-DD.csv`)
  - Milestones (`level_up_planner_milestones_YYYY-MM-DD.csv`)
  - Tasks (`level_up_planner_tasks_YYYY-MM-DD.csv`)
  - Habits (`level_up_planner_habits_YYYY-MM-DD.csv`)
  - Habit Logs (`level_up_planner_habit_logs_YYYY-MM-DD.csv`)
  - Notes (`level_up_planner_notes_YYYY-MM-DD.csv`)
  - Journal Entries (`level_up_planner_journal_entries_YYYY-MM-DD.csv`)
  - Weekly Reviews (`level_up_planner_weekly_reviews_YYYY-MM-DD.csv`)
  - Categories (`level_up_planner_categories_YYYY-MM-DD.csv`)
  - "Export All" batch mode generating individual CSVs for all collections.

### Feature D: Centralized Data Management & Privacy Dashboard
- **Screen:** `src/app/settings/data.tsx` (accessible from Profile & Settings)
- **Live Overview Metrics:**
  - Local database storage footprint (in KB/MB).
  - Live counts for Goals, Tasks, Habits, Notes, Journal entries, and Categories.
  - Last backup timestamp.
- **Action Modules:**
  - One-tap "Create Backup (JSON)" with share sheet.
  - "Restore from Backup (JSON)" with preview modal and safety snapshot toggle.
  - "Export Data to CSV" modal with per-entity selectors.
  - **Danger Zone ("Delete All Data"):**
    - Double confirmation modal requiring user to type `"DELETE"` explicitly.
    - Wipes personal planning data atomically while preserving default life categories and system configuration.

---

## 2. Privacy & Security Audit
- **Zero Cloud Leakage:** 100% offline, local-first. No network calls or third-party tracking.
- **Log Sanitation:** Personal note and journal contents are strictly excluded from console logs and error traces.
- **Temp File Hygiene:** Backups and exports are generated in dedicated sandbox cache directories.
