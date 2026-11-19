# Phase 1 Implementation Summary — Level Up Planner
**Goal:** Improve Daily Experience  
**Platforms:** Android-first, iOS compatible  
**Tech Stack:** React Native, Expo SDK 58, Expo Router, TypeScript, SQLite (`expo-sqlite`), Local Notifications (`expo-notifications`).

---

## 1. Scope & Delivered Features

### Feature A: Weekly Review
- **Guided Review Wizard (`/weekly-review`):**
  - **Step 1 (Overview):** Computes real, database-backed stats for the current week (period key like `2026-W47`): total tasks, completed tasks, completion percentage, active goals count, completed milestone list, and habit completion rate.
  - **Step 2 (Reflection):** 4 reflection questions designed with calm, no-guilt UX:
    1. *What went well this week?*
    2. *What challenged me this week?*
    3. *What did I learn?*
    4. *What do I want to improve next week?*
  - **Step 3 (Next Week Planning):**
    - Top 3 focal priorities for the upcoming week, each with optional linking to an active goal.
    - Pending task rollover: explicitly displays uncompleted tasks with a manual action to reschedule them to next week. *No deadlines are changed automatically.*
  - **Step 4 (Completion):** Saves the weekly review and its top priorities atomically in SQLite; pre-populates existing entries when re-visiting the same period to avoid duplicates.
- **Review History (`/weekly-review/history`):** Chronological list of past reviews with week-over-week completion deltas and reflection previews.
- **Review Detail (`/weekly-review/[id]`):** In-depth view of past reflections, priorities, and stats, with safe deletion.
- **Dashboard Prompt:** Prompts users on the Home dashboard when a weekly review is ready or provides quick access to past review history.

### Feature B: Local Notifications
- **Expo Notifications Integration:**
  - Configured via `expo-notifications` (`~58.1.9`) with custom notification channels for Android (`default`, high importance, vibration, sage light color).
  - Web & unsupported environment graceful fallbacks.
- **Permission Flow:** Permissions are requested contextually when the user enables a reminder toggle (not abruptly on cold app launch or onboarding).
- **Scheduled Triggers:**
  - **Task Reminders:** Date-based trigger (`SchedulableTriggerInputTypes.DATE`) with sound and title. Automatically canceled when task is marked completed or deleted.
  - **Daily Planning Reminder:** Daily recurring trigger (`SchedulableTriggerInputTypes.DAILY`) at user-defined time (default `08:00`).
  - **Weekly Review Reminder:** Weekly recurring trigger (`SchedulableTriggerInputTypes.WEEKLY`) on user-selected day (default Sunday `18:00`).
  - **Habit Reminders:** Recurring triggers for each of the habit's active days at the habit's designated reminder time. Automatically canceled when habit is archived or deleted.

### Feature C: Centralized Reminder Settings
- **Route:** `/settings/reminders` (accessible via Profile & Settings).
- **Controls:**
  - Permission status banner with clear state indicators and a manual permission request button.
  - Daily Planning toggle with quick presets (`07:00`, `08:00`, `09:00`) and custom 24h time input.
  - Weekly Review toggle with day selector (`Sunday`, `Friday`, `Saturday`, `Monday`), quick presets (`17:00`, `18:00`, `19:00`, `20:00`), and custom 24h time input.
  - Informative guidance on task and habit notifications.

### Feature D: Improved Task Scheduling & Overdue Handling
- **Time-Aware Scheduling:**
  - Tasks support optional `due_time` (`HH:mm`, e.g. `09:30`).
  - Quick reschedule action buttons (`Today`, `Tomorrow`, `+3 Days`, `Next Week`) in task edit screen.
- **Overdue Computation (`isTaskOverdue`):**
  - Accurately computes overdue status based on device local date and time.
  - Respects whole-day tasks (not overdue until midnight) while flagging time-specific tasks immediately once their due time elapses.
- **Overdue Tab in Tasks Screen:**
  - Dedicated `Overdue` tab in `TaskFilterTabs` with count badges.
  - Warm, non-punitive overdue indicators on task cards (`#8A4A36` text on `#FDEEE9` background).
  - Dashboard banner informing the user of overdue tasks with a direct link to review them.

---

## 2. Architecture & Data Model Changes

### Database Migrations (`levelup_planner.db`):
- `tasks`: added `due_time TEXT`, `reminder_at TEXT`, `notification_id TEXT`.
- `habits`: added `reminder_time TEXT`, `reminder_notification_ids TEXT`.
- `weekly_reviews`: `id`, `user_id`, `week_start_date`, `week_end_date`, `period_key` (UNIQUE), stats columns, reflection columns, timestamps.
- `weekly_priorities`: `id`, `weekly_review_id`, `title`, `related_goal_id`, `sort_order`, `created_at`.
- `reminder_preferences`: `id`, `user_id`, `reminder_type`, `enabled`, `scheduled_time`, `scheduled_day`, `notification_id`, `updated_at`.

### Repositories Added:
- `src/repositories/weeklyReviewRepository.ts`: CRUD for weekly reviews & associated priorities.
- `src/repositories/reminderRepository.ts`: CRUD for reminder preferences.

### Services Added:
- `src/services/notificationService.ts`: Local notification scheduling, channel creation, permission handling, and safe cancellation.
