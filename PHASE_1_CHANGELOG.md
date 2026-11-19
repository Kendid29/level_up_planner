# Phase 1 Changelog — Level Up Planner

All changes follow the Phase 1 specifications defined in the roadmap and `PRD.md`.

---

## [1.1.0] - Phase 1: Improve Daily Experience (2026-11-19)

### Added
- **Weekly Review System:**
  - `src/app/weekly-review/index.tsx`: 3-step guided wizard for weekly evaluation (Overview, 4-question Reflection, Next Week Planning with top 3 priorities).
  - `src/app/weekly-review/history.tsx`: Review history list with week-over-week completion deltas and reflection snippets.
  - `src/app/weekly-review/[id].tsx`: Detailed view for inspecting past reviews and associated priorities.
  - `src/repositories/weeklyReviewRepository.ts`: SQLite repository for atomic persistence of weekly reviews and weekly priorities.
  - `calculateWeeklyStats` in `src/domain/planning.ts`: Real-time calculation of weekly completion rate, active goals, milestone achievements, and habit consistency.
- **Local Notification Engine:**
  - `expo-notifications` (`~58.1.9`) installed and configured in `app.json`.
  - `src/services/notificationService.ts`: Channel management for Android, permission checks, scheduling for tasks (DATE trigger), daily planning (DAILY trigger), weekly review (WEEKLY trigger), and habits (recurring active-day triggers).
  - `src/repositories/reminderRepository.ts`: CRUD for reminder preferences (`daily_planning`, `weekly_review`).
- **Reminder Settings:**
  - `src/app/settings/reminders.tsx`: Centralized settings screen with permission status banner, interactive switches, quick preset chips, and custom time inputs.
  - Linked from `src/app/profile.tsx` with chevron navigation.
- **Improved Task Scheduling & Overdue Management:**
  - Added optional `due_time` (HH:mm) field to `Task` model, forms, and item displays.
  - Added `isTaskOverdue` calculation in `src/domain/dates.ts` for accurate time-aware overdue determination.
  - Added `overdue` filter tab in `src/components/tasks/TaskFilterTabs.tsx` and `src/app/(tabs)/tasks.tsx`.
  - Added quick reschedule options (`Today`, `Tomorrow`, `+3 Days`, `Next Week`) in task edit screen.
  - Added overdue tasks alert banner in Home Dashboard (`src/app/(tabs)/index.tsx`).

### Changed
- `src/database/schema.ts` & `src/database/db.ts`: Added tables `weekly_reviews`, `weekly_priorities`, and `reminder_preferences`, with safe migrations for existing tables (`tasks`, `habits`).
- `src/components/tasks/TaskItem.tsx`: Enhanced with `due_time` display, subtle reminder bell indicator, and warm overdue badge styling.
- `src/components/common/Button.tsx`: Added `rightIcon` support for flexible UI design.
- `src/context/AppContext.tsx`: Integrated notification auto-cancellation on task complete/delete and habit delete, and exposed weekly review and reminder preference actions.

### Removed
- Placeholder notification cards in `src/app/profile.tsx`, replaced with the functional `/settings/reminders` screen.
