# Phase 3 Changelog — Level Up Planner
**Release:** Phase 3 (Data Ownership & Backup)  
**Date:** 2026-11-19  

---

### Added
- **JSON Data Backup Engine (`src/services/backupService.ts`):**
  - Full application data backup into a structured, validated JSON file.
  - Captures 12 SQLite tables: profiles, categories, goals, milestones, tasks, habits, habit_logs, notes, journal_entries, weekly_reviews, weekly_priorities, reminder_preferences.
  - Native file saving and sharing via `expo-sharing`.
  - Last backup timestamp tracking and display.
- **JSON Data Restore with Integrity Engine (`src/services/restoreService.ts`, `src/domain/backupValidation.ts`):**
  - Document picker integration via `expo-document-picker`.
  - Comprehensive pre-flight validation: verifies application identifier, backup version, primary key uniqueness, and relational foreign keys.
  - Pre-restore safety snapshot capability.
  - Atomic database restoration with rollback guarantee via `db.withTransactionAsync`.
  - Automatic context refresh upon restoration.
- **CSV Data Export with Formula Injection Protection (`src/services/exportService.ts`, `src/domain/csv.ts`):**
  - RFC 4180 compliant CSV export for all domain entities.
  - UTF-8 Byte Order Mark (BOM) inclusion for international glyphs and Indonesian text rendering in spreadsheet apps.
  - Protection against CSV Formula Injection (CWE-1236) by sanitizing leading `=`, `+`, `-`, `@`, `\t`, and `\r` characters.
  - Per-entity export selectors and "Export All Collections" batch mode.
- **Centralized Data Management & Privacy Screen (`src/app/settings/data.tsx`):**
  - Live local storage footprint estimation.
  - Metric breakdown counters for all planner records.
  - Backup & restore control panels.
  - CSV export modal selector.
  - Danger zone with explicit `"DELETE"` confirmation guard to securely erase personal planning records while keeping system categories intact.
- **Dependencies:**
  - Added `expo-sharing` (`~58.0.23`) for native file sharing.
  - Added `expo-document-picker` (`~58.0.5`) for backup JSON file picking.

### Changed
- `src/app/_layout.tsx`: Registered `settings/data` route.
- `src/app/profile.tsx`: Added navigation entry point for "Data Ownership & Backup" linking to `/settings/data`.
- `src/context/AppContext.tsx`: Exposed `refreshData` to synchronize app state across tabs following restore or data purge.

### Security
- CWE-1236 Formula Injection mitigated across all CSV exports.
- Zero external network dependencies for backup, export, or restore; 100% offline local privacy maintained.
- Safe child-to-parent deletion and parent-to-child insertion order preventing foreign key constraint violations.
