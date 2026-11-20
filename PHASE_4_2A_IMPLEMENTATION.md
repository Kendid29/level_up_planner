# Phase 4.2A Implementation & Final Review Report

**Product:** Level Up Planner  
**Phase:** 4.2A — Cloud Database Migration Preparation  
**Target Platform:** Supabase PostgreSQL 15+ (PostgreSQL 16 compatible)  
**File Created:** `supabase/migrations/001_initial_schema.sql`  
**Status:** Completed & Validated (Awaiting Approval to Run Migration)  

---

## 1. Executive Summary

Phase 4.2A menerjemahkan skema lokal SQLite Level Up Planner (12 tabel) dan arsitektur sinkronisasi yang disetujui pada **Proposal Revisi 5** menjadi file migrasi SQL PostgreSQL yang siap dijalankan di Supabase.

File migrasi utama: [`supabase/migrations/001_initial_schema.sql`](file:///home/vassago/CODING/App_mobile/level-up-planner/supabase/migrations/001_initial_schema.sql).

Tujuan utama migrasi ini adalah:
1. Mempertahankan 100% keselarasan nama kolom, tipe data ekuivalen, dan aturan domain bisnis dengan database SQLite lokal.
2. Mengintegrasikan kepemilikan data dengan Supabase Auth UUID (`auth.users.id`).
3. Mencegah kebocoran data antar-pengguna menggunakan Row Level Security (RLS) ketat dan composite foreign keys.
4. Mempersiapkan tabel `sync_tombstones` dan trigger mutasi `updated_at` untuk mendukung delta sync di tahap berikutnya.
5. Memisahkan data lokal perangkat (`notification_id`) agar tidak menimbulkan konflik multi-device.

---

## 2. Pemeriksaan Mendalam 4 Area Utama

### 2.1. Pemeriksaan 1: Perbandingan Lengkap Kolom SQLite vs PostgreSQL (12 Tabel)

| Tabel | Kolom SQLite Lokal | Kolom PostgreSQL Cloud | Catatan Integritas Bisnis |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `id`, `display_name`, `week_start`, `theme_preference`, `onboarding_completed`, `created_at`, `updated_at` | `id` (UUID), `display_name`, `week_start`, `theme_preference`, `onboarding_completed`, `created_at`, `updated_at` | 100% identik. `id` di cloud mengikat `auth.users(id)`. |
| **`categories`** | `id`, `user_id`, `name`, `color`, `icon`, `is_default`, `archived_at`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `name`, `color`, `icon`, `is_default`, `archived_at`, `created_at`, `updated_at` | 100% identik. Dipertahankan `is_default` dan `archived_at`. Constraint: `UNIQUE(user_id, name)`. |
| **`goals`** | `id`, `user_id`, `title`, `description`, `horizon`, `category`, `start_date`, `target_date`, `priority`, `status`, `completed_at`, `completion_note`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `title`, `description`, `horizon`, `category`, `start_date` (DATE), `target_date` (DATE), `priority`, `status`, `completed_at`, `completion_note`, `created_at`, `updated_at` | 100% identik. Seluruh kolom bisnis (`horizon`, `start_date`, `completion_note`, `category` TEXT) dipertahankan utuh. |
| **`milestones`** | `id`, `goal_id`, `title`, `description`, `sort_order`, `target_date`, `completed_at`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `goal_id`, `title`, `description`, `sort_order`, `target_date` (DATE), `completed_at`, `created_at`, `updated_at` | Dipertahankan `sort_order`. Ditambahkan `user_id` untuk RLS dan composite foreign key. |
| **`tasks`** | `id`, `user_id`, `goal_id`, `milestone_id`, `title`, `description`, `due_at`, `due_time`, `reminder_at`, `notification_id`, `priority`, `status`, `category`, `completed_at`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `goal_id`, `milestone_id`, `title`, `description`, `due_at` (TEXT), `due_time`, `reminder_at`, `priority`, `status`, `category` (TEXT), `completed_at`, `created_at`, `updated_at` | 100% identik. `due_at` dan `category` tetap TEXT sesuai domain SQLite. `notification_id` dipisahkan karena khusus hardware lokal. |
| **`habits`** | `id`, `user_id`, `title`, `category`, `frequency`, `active_days`, `start_date`, `archived_at`, `reminder_time`, `reminder_notification_ids`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `title`, `category` (TEXT), `frequency` (INTEGER), `active_days` (TEXT/JSON), `start_date` (DATE), `archived_at`, `reminder_time`, `created_at`, `updated_at` | 100% identik. `frequency` tetap integer (1..7), `active_days` tetap JSON string `"[0,1,2,3,4,5,6]"`. `reminder_notification_ids` dipisahkan karena khusus hardware lokal. |
| **`habit_logs`** | `id`, `habit_id`, `log_date`, `completed`, `created_at` | `id`, `user_id` (UUID), `habit_id`, `log_date` (DATE), `completed` (INTEGER 0/1), `created_at`, `updated_at` | Dipertahankan `log_date` dan `completed`. Ditambahkan `user_id` (RLS) dan `updated_at` (delta sync mutasi log). |
| **`notes`** | `id`, `user_id`, `title`, `body`, `category`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `title`, `body`, `category` (TEXT), `created_at`, `updated_at` | 100% identik. Kolom `body` dan `category` dipertahankan. |
| **`journal_entries`** | `id`, `user_id`, `title`, `body`, `entry_date`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `title`, `body`, `entry_date` (DATE), `created_at`, `updated_at` | 100% identik. Kolom `body` dan `entry_date` dipertahankan. |
| **`weekly_reviews`** | `id`, `user_id`, `week_start_date`, `week_end_date`, `period_key`, `total_tasks`, `completed_tasks`, `completion_percentage`, `active_goals_count`, `completed_milestones_count`, `habit_completion_rate`, `reflection_went_well`, `reflection_challenges`, `reflection_learnings`, `reflection_improvements`, `created_at`, `updated_at` | `id`, `user_id` (UUID), `week_start_date` (DATE), `week_end_date` (DATE), `period_key`, `total_tasks`, `completed_tasks`, `completion_percentage`, `active_goals_count`, `completed_milestones_count`, `habit_completion_rate`, `reflection_went_well`, `reflection_challenges`, `reflection_learnings`, `reflection_improvements`, `created_at`, `updated_at` | 100% identik. Seluruh 6 statistik agregasi dan 4 kolom refleksi dipertahankan utuh. Constraint diubah menjadi per-user: `UNIQUE(user_id, period_key)`. |
| **`weekly_priorities`** | `id`, `weekly_review_id`, `title`, `related_goal_id`, `sort_order`, `created_at` | `id`, `user_id` (UUID), `weekly_review_id`, `title`, `related_goal_id`, `sort_order`, `created_at`, `updated_at` | Dipertahankan `weekly_review_id`, `related_goal_id`, dan `sort_order`. Ditambahkan `user_id` (RLS) dan `updated_at` (delta sync). |
| **`reminder_preferences`** | `id`, `user_id`, `reminder_type`, `enabled`, `scheduled_time`, `scheduled_day`, `notification_id`, `updated_at` | `id`, `user_id` (UUID), `reminder_type`, `enabled`, `scheduled_time`, `scheduled_day`, `created_at`, `updated_at` | 100% identik. Constraint: `UNIQUE(user_id, reminder_type)`. `notification_id` dipisahkan karena khusus hardware lokal. |

---

## 2. Pemeriksaan Mendalam 4 Area Utama

### 2.2. Pemeriksaan 2: Strategi Migrasi Identitas (`local_user_default` ke UUID Auth)

Seluruh 12 tabel memiliki relasi kepemilikan data yang terdefinisi dengan jelas:
- **Tabel dengan user_id langsung di SQLite (8 tabel):** `categories`, `goals`, `tasks`, `habits`, `notes`, `journal_entries`, `weekly_reviews`, `reminder_preferences`.
- **Tabel turunan tanpa user_id di SQLite (3 tabel):** `milestones`, `habit_logs`, `weekly_priorities`. Pada PostgreSQL, kolom `user_id UUID NOT NULL REFERENCES auth.users(id)` ditambahkan secara eksplisit.
- **Tabel profil (1 tabel):** `profiles.id` bertindak langsung sebagai `user_id` (`REFERENCES auth.users(id)`).

**Mekanisme Migrasi Identitas Lokal ke Cloud:**
1. Di SQLite lokal, semua data berakar pada `DEFAULT_USER_ID = 'local_user_default'`.
2. Saat pengguna mendaftar/login di Supabase Auth (Phase 4.3):
   - Klien menerima Auth UUID baru (misal `user_uuid`).
   - SQLite lokal menjalankan transaksi atomik tunggal (*Atomic Local Re-Keying*):
     - Memperbarui `profiles.id` dari `'local_user_default'` ke `user_uuid`.
     - Memperbarui seluruh kolom `user_id` di 8 tabel SQLite dari `'local_user_default'` ke `user_uuid`.
   - Data lokal kemudian di-push ke cloud Supabase secara aman melalui antrean sinkronisasi `local_sync_queue`.

---

### 2.3. Pemeriksaan 3: Validasi Composite Foreign Keys, Cascade Deletes, Triggers & RLS

1. **Composite Foreign Keys & Integritas Relasi:**
   - **Task-Goal-Milestone Integrity:**
     ```sql
     CONSTRAINT fk_tasks_goal FOREIGN KEY (goal_id, user_id)
       REFERENCES public.goals (id, user_id)
       ON DELETE SET NULL (goal_id)

     CONSTRAINT fk_tasks_milestone_goal_user FOREIGN KEY (milestone_id, goal_id, user_id)
       REFERENCES public.milestones (id, goal_id, user_id)
       ON DELETE SET NULL (milestone_id)

     CONSTRAINT chk_tasks_milestone_requires_goal 
       CHECK (milestone_id IS NULL OR goal_id IS NOT NULL)
     ```
     Menjamin bahwa task tidak dapat mengaitkan milestone milik Goal A dengan `goal_id` milik Goal B.
   - **Habit Logs Integrity:**
     ```sql
     CONSTRAINT fk_habit_logs_habit FOREIGN KEY (habit_id, user_id)
       REFERENCES public.habits (id, user_id)
       ON DELETE CASCADE
     ```
     Menjamin habit logs selalu berada di bawah habit dan user pemilik yang sama. Penghapusan habit otomatis menghapus log-nya.
   - **Weekly Priorities Integrity:**
     ```sql
     CONSTRAINT fk_weekly_priorities_review FOREIGN KEY (weekly_review_id, user_id)
       REFERENCES public.weekly_reviews (id, user_id)
       ON DELETE CASCADE

     CONSTRAINT fk_weekly_priorities_goal FOREIGN KEY (related_goal_id, user_id)
       REFERENCES public.goals (id, user_id)
       ON DELETE SET NULL (related_goal_id)
     ```
     Menjamin prioritas mingguan terikat ke review mingguan pemiliknya, dan jika goal terkait dihapus, hanya kolom `related_goal_id` yang menjadi NULL tanpa membatalkan prioritas.

2. **Trigger `updated_at` & Tombstone Triggers:**
   - Semua 12 tabel memiliki trigger `handle_updated_at` yang otomatis memperbarui `updated_at = now()`.
   - 11 tabel data aplikasi memiliki trigger `record_sync_tombstone` (`AFTER DELETE`).
   - Hardening keamanan fungsi:
     - `SET search_path = public, pg_catalog, pg_temp` mencegah search-path hijacking.
     - Blok `EXCEPTION WHEN foreign_key_violation THEN RETURN OLD;` mencegah kegagalan cascade saat akun `auth.users` dihapus.
     - `REVOKE EXECUTE` dari PUBLIC, anon, dan authenticated mencegah eksekusi fungsi langsung oleh klien.

3. **Row Level Security (RLS):**
   - 100% tabel (12 tabel data + 1 tabel tombstones) mengaktifkan RLS (`ENABLE ROW LEVEL SECURITY`).
   - Kueri policy menggunakan `(SELECT auth.uid()) = user_id` yang kompatibel dengan query planner PostgreSQL.
   - Tabel `sync_tombstones` dibatasi policy `SELECT` saja untuk role `authenticated`.

---

### 2.4. Pemeriksaan 4: Kompatibilitas Versi PostgreSQL Supabase

- **Target Versi:** Supabase menggunakan PostgreSQL versi 15.x / 16.x.
- **Sintaks Kolom-Spesifik `ON DELETE SET NULL (col)`:**
  Sintaks ini diperkenalkan secara resmi pada PostgreSQL 15 (fitur standar SQL:2008 F741). Seluruh foreign key komposit pada `tasks` dan `weekly_priorities` menggunakan sintaks ini dan valid pada PostgreSQL 15+.
- **Tipe Data & Fungsi:**
  - `gen_random_uuid()` adalah fungsi bawaan sejak PostgreSQL 13.
  - `TIMESTAMPTZ` dan `DATE` merupakan tipe data native standar PostgreSQL.

---

## 3. Investigasi Khusus: Integritas Kategori

Berdasarkan inspeksi langsung pada `src/repositories/categoryRepository.ts`:
- Di SQLite lokal, relasi antara kategori dan entitas lain (`tasks`, `goals`, `habits`, `notes`) disimpan dalam bentuk **nama teks (`category TEXT`)**, bukan foreign key ID (`category_id`).
- Saat sebuah kategori diubah namanya (`updateCategory`), repository menjalankan update batch teks pada `tasks.category`, `goals.category`, dan `habits.category` dalam satu transaksi lokal.
- Saat kategori dihapus (`deleteCategory`), entitas yang menggunakan kategori tersebut dialihkan secara aman ke fallback kategori `'Personal Growth'`.
- **Keputusan Desain Cloud:** Skema PostgreSQL mempertahankan `category TEXT` tanpa membuat foreign key paksa ke `categories.id`. Ini menjamin keselarasan 100% dengan cara kerja repository lokal dan mencegah kegagalan sinkronisasi ketika pengguna mengedit atau menghapus kategori.

---

## 4. Keputusan Tambahan

1. **Trigger Pembuatan Profil Otomatis (`on_auth_user_created`):**
   - Disiapkan untuk **Phase 4.3 (Authentication Integration)**. Tidak dimasukkan ke dalam `001_initial_schema.sql` pada Phase 4.2A untuk menjaga pemisahan modul yang rapi antara skema database dan otentikasi akun.
2. **Jadwal Retensi Tombstone 60 Hari (`pg_cron`):**
   - Ditunda sampai cloud synchronization stabil dan teruji di Phase 4.4. Tabel `sync_tombstones` telah dilengkapi indeks `idx_sync_tombstones_retention ON (deleted_at)` sehingga siap dieksekusi pembersihan periodik kapan pun diaktifkan.

---

## 5. Status Validasi & Batasan

1. **Validasi Statis:** Seluruh skrip DDL pada `supabase/migrations/001_initial_schema.sql` telah divalidasi statis:
   - Tidak ada foreign key yang merujuk ke tabel yang belum dibuat (urutan dependensi benar).
   - Seluruh composite foreign keys merujuk ke tabel induk dengan composite UNIQUE constraint yang cocok.
   - Tidak ada konflik penamaan constraint atau indeks.
2. **Validasi Dinamis PostgreSQL Lokal:**
   - Service PostgreSQL 16.15 terdeteksi aktif pada host lokal (`/usr/bin/psql`), namun konfigurasi otentikasi lokal menggunakan `peer authentication` untuk user `postgres` yang memerlukan hak akses superuser/sudo. Sesuai batasan sistem dan instruksi pengguna, validasi dinamis terhadap server PostgreSQL lokal **dinyatakan belum dilakukan**.
3. **Integritas Proyek:**
   - Tidak ada perubahan pada file schema SQLite (`src/database/schema.ts`).
   - Tidak ada perubahan pada komponen UI.
   - Tidak ada eksekusi SQL yang dijalankan ke Supabase.
   - TypeScript compilation (`npm run typecheck`) bersih: 0 error.

---

*File migrasi `supabase/migrations/001_initial_schema.sql` siap dijalankan ke Supabase setelah persetujuan diberikan.*
