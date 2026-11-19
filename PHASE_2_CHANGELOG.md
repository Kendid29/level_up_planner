# Phase 2 Changelog — Level Up Planner
**Release:** Phase 2 (Personal Insights)  
**Date:** 2026-11-19  

---

### Added
- **Monthly Progress Summary (`/insights/monthly`):**
  - Real-time month-by-month performance analytics for tasks, goals, milestones, and habits.
  - Interactive month navigation with month jump reset.
  - Monthly highlights spotlighting completed goals/milestones and top consistency habits.
  - Month-over-month comparative progress deltas.
  - Dashboard and profile entry routes.
- **Habit Statistics & Consistency Momentum (`/habits/[id]/stats`):**
  - Habits tab overview banner summarizing active habits and weekly/monthly momentum.
  - Individual habit detailed statistics with weekly and monthly completion percentages.
  - Visual monthly completion calendar matrix and 14-day activity log.
  - Stats navigation icon on individual `HabitCard` components.
- **Custom Categories System (`/settings/categories`):**
  - SQLite `categories` table with 7 default life pillars.
  - Centralized management screen to create, edit, and organize life categories.
  - Design token color swatch palette selection.
  - Atomic reassignment and safety check preventing accidental orphan data upon category deletion.
  - Protected system default categories.
- **Goal Achievement History (`/goals/achievements`, `/goals/achievement-[id]`):**
  - Added `completed_at` and `completion_note` fields to `goals` schema.
  - "Celebrate & Complete Goal" flow with personal reflection note capture.
  - Trophy celebration banner in `GoalDetailScreen` with reversible "Reopen Goal" capability.
  - Achievement history list with horizon breakdown filter chips.
  - Keepsake certificate view honoring finished goals and milestones.
  - Quick access banner with count badge in Goals tab.

### Changed
- `src/database/schema.ts` & `src/database/db.ts`: Added `categories` schema, safe migrations for `goals` and `habits`, and default category seeding.
- `src/repositories/goalRepository.ts`: Added `completeGoal` and `reopenGoal` methods.
- `src/repositories/habitRepository.ts`: Added `category` field mapping to habit creation and updates.
- `src/domain/dates.ts`: Added `MonthPeriod` and `getMonthPeriod` date calculation utilities.
- `src/domain/planning.ts`: Added `calculateMonthlyStats`, `calculateHabitDetailedStats`, and `calculateHabitOverviewStats`.
- `src/context/AppContext.tsx`: Exposed category state and CRUD, completed goals list, habit overview metrics, and monthly summary calculation.
- Goal, Task, and Habit creation/edit forms: Dynamically populate category chips from user categories in SQLite.

### Fixed
- Fixed date boundary evaluations to operate strictly on device local strings, preventing timezone drift.
- Fixed habit card layout to incorporate category pills without disrupting horizontal spacing.
