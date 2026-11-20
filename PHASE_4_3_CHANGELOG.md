# Phase 4.3 Changelog: Authentication System

All notable changes made during Phase 4.3 implementation.

---

## [Phase 4.3] - 2026-11-19

### Added
- **Database Migration:**
  - `supabase/migrations/002_profile_trigger.sql`: Trigger function `handle_new_user()` on `auth.users` (`AFTER INSERT`) with `SECURITY DEFINER`, search path isolation, and `ON CONFLICT (id) DO NOTHING`.
- **Services & Context:**
  - `src/services/authService.ts`: Core Supabase authentication service (email validation, password strength rating, error formatting, signUp, signIn, signOut, password recovery).
  - `src/context/AuthContext.tsx`: Reactive authentication provider with session restoration, deep link listener (`expo-linking`), and auth event handler (`onAuthStateChange`).
  - `src/services/__tests__/authService.test.ts`: Complete unit test suite with 26 test cases for authentication logic and input validations.
- **UI Screens:**
  - `src/app/auth/login.tsx`: Sign In screen with email/password validation, show/hide password toggle, error banner, and offline note.
  - `src/app/auth/register.tsx`: Create Account screen with live password strength checklist and email confirmation instruction state.
  - `src/app/auth/forgot-password.tsx`: Forgot Password screen with reset email dispatcher and confirmation card.
  - `src/app/auth/reset-password.tsx`: Update Password screen with session validity check and password strength feedback.
- **Dependencies:**
  - `@react-native-async-storage/async-storage` (`v2.2.0`): SDK 58 compatible session storage adapter.

### Changed
- `src/lib/supabase.ts`: Configured with `safeStorage` adapter (AsyncStorage with SSR/Node guards), enabling `persistSession: true` and `autoRefreshToken: true`.
- `src/app/_layout.tsx`: Wrapped component tree with `<AuthProvider>`, registered `auth/login`, `auth/register`, `auth/forgot-password`, and `auth/reset-password` screen routes.
- `src/app/profile.tsx`: Added "Cloud Account (Supabase)" card displaying connection status, user email, "Change Password", and "Sign Out" with confirmation dialog.

### Boundaries & Safeguards Preserved
- No modifications to SQLite schema (`src/database/schema.ts`).
- No migration of `local_user_default` data (isolated for Phase 4.4).
- No sync engine or cloud mutations executed.
- No service_role or secret keys used.
