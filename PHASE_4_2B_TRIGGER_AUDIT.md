# Phase 4.2B: Audit Trigger `record_sync_tombstone`

**Product:** Level Up Planner  
**Phase:** 4.2B — Database Integration & Sync Engine Hardening  
**Target:** Trigger `record_sync_tombstone` pada Supabase PostgreSQL  
**Source File:** `supabase/migrations/001_initial_schema.sql`  
**Status:** Audit Completed (No Blocking Issues Found)  

---

## 1. Daftar Tabel yang Menggunakan Trigger `record_sync_tombstone`

Trigger `record_sync_tombstone` terpasang secara eksplisit pada **11 tabel data aplikasi**:

| No | Nama Tabel | Nama Trigger | Event Trigger | Kolom `id` | Kolom `user_id` |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | `public.categories` | `trg_categories_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 2 | `public.goals` | `trg_goals_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 3 | `public.milestones` | `trg_milestones_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 4 | `public.tasks` | `trg_tasks_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 5 | `public.habits` | `trg_habits_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 6 | `public.habit_logs` | `trg_habit_logs_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 7 | `public.notes` | `trg_notes_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 8 | `public.journal_entries` | `trg_journal_entries_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 9 | `public.weekly_reviews` | `trg_weekly_reviews_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 10 | `public.weekly_priorities` | `trg_weekly_priorities_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |
| 11 | `public.reminder_preferences` | `trg_reminder_preferences_tombstone` | `AFTER DELETE` | `id TEXT` | `user_id UUID` |

---

## 2. Verifikasi Kolom `id` dan `user_id`

- **Temuan:** Seluruh 11 tabel yang menggunakan trigger memiliki:
  1. `id TEXT NOT NULL` sebagai primary key entitas.
  2. `user_id UUID NOT NULL REFERENCES auth.users(id)` sebagai penanda kepemilikan data.
- **Evaluasi Akses Rekor (`OLD`):** 
  Fungsi trigger mengakses `OLD.user_id` dan `OLD.id::text`. Karena semua 11 tabel memiliki kedua kolom tersebut dengan tipe yang kompatibel, tidak ada risiko runtime error `record "old" has no field "..."`.

---

## 3. Verifikasi Tabel `profiles`

- **Skema `profiles`:**
  - Primary Key: `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  - Kolom `user_id`: **Tidak ada** (karena `id` profil adalah user ID itu sendiri).
- **Hasil Pemeriksaan:**
  - Tabel `profiles` **TIDAK** menggunakan trigger `record_sync_tombstone`.
  - Tabel `profiles` hanya memiliki trigger `trg_profiles_updated_at` (`BEFORE UPDATE`).
- **Kesimpulan:** Aman. Tidak ada asumsi `OLD.user_id` pada tabel `profiles`. Profil pengguna hanya dihapus saat akun pengguna dihapus secara permanen dari sistem, sehingga entri tombstone sinkronisasi memang tidak diperlukan.

---

## 4. Verifikasi Tabel `sync_tombstones` (Pencegahan Rekursi)

- **Skema `sync_tombstones`:**
  - Primary Key: `id UUID DEFAULT gen_random_uuid()`
  - Foreign Key: `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- **Hasil Pemeriksaan:**
  - Tidak ada trigger apa pun yang dipasang pada tabel `sync_tombstones`.
  - Operasi penghapusan pada `sync_tombstones` (misal saat rotasi/pembersihan retensi data lama) tidak memicu rekursi atau pencatatan tombstone baru.
- **Kesimpulan:** Aman. Tidak ada risiko *infinite loop* atau polusi data tombstone.

---

## 5. Evaluasi `EXCEPTION WHEN foreign_key_violation`

### 5.1. Analisis Lingkup Error
Blok kode pada fungsi:
```sql
BEGIN
  INSERT INTO public.sync_tombstones (user_id, table_name, record_id, deleted_at)
  VALUES (OLD.user_id, TG_TABLE_NAME, OLD.id::text, now());
EXCEPTION
  WHEN foreign_key_violation THEN
    RETURN OLD;
END;
```

### 5.2. Potensi Risiko vs Realitas Skema
- **Pertanyaan:** Apakah penangkapan `foreign_key_violation` terlalu luas sehingga berisiko menutupi kesalahan integritas data yang tidak terduga?
- **Hasil Evaluasi:**
  1. Blok `BEGIN ... EXCEPTION` **hanya membungkus** perintah `INSERT INTO public.sync_tombstones`, **bukan** perintah `DELETE` pada tabel asal. Operasi `DELETE` pada tabel bisnis tetap tunduk pada foreign key constraint tabel asalnya.
  2. Tabel `public.sync_tombstones` **hanya memiliki 1 foreign key**, yaitu:
     `CONSTRAINT ... FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`.
     Kolom `table_name` dan `record_id` adalah tipe `TEXT` bebas tanpa relasi foreign key.
  3. Oleh karena itu, satu-satunya penyebab terjadinya `foreign_key_violation` pada insert ini adalah: `OLD.user_id` tidak lagi ditemukan di `auth.users(id)`.
  4. Kondisi ini secara eksklusif hanya terjadi saat akun pengguna sedang dihapus melalui `auth.users CASCADE`.
  5. Error integritas lain seperti `not_null_violation` atau `check_violation` tidak akan tertangkap oleh blok ini dan akan tetap menghasilkan error normal jika terjadi anomali.
- **Kesimpulan:** Desain exception ini **aman dan terukur secara matematis** karena cakupan foreign key pada tabel target terbatas hanya pada satu kolom (`user_id`).

---

## 6. Verifikasi Perilaku Penghapusan Akun Melalui CASCADE

Ketika sebuah akun dihapus dari `auth.users`:
1. PostgreSQL memicu `ON DELETE CASCADE` ke:
   - Seluruh 11 tabel data aplikasi.
   - Tabel `profiles`.
   - Tabel `sync_tombstones`.
2. Saat baris di 11 tabel aplikasi terhapus via cascade:
   - Trigger `AFTER DELETE` terpanggil.
   - Fungsi mencoba menyisipkan tombstone ke `sync_tombstones`.
   - Karena baris induk di `auth.users` sedang dalam status dihapus/hilang, penulisan ke `sync_tombstones` memicu `foreign_key_violation`.
   - Blok `EXCEPTION` menangkap error ini dan melanjutkan penghapusan tanpa menggagalkan transaksi.
3. Seluruh record di `sync_tombstones` milik user tersebut yang mungkin sudah ada sebelumnya juga dihapus bersih oleh `ON DELETE CASCADE` dari `auth.users(id)`.
4. **Hasil Akhir:** Seluruh data aplikasi, profil, dan riwayat tombstone milik akun terhapus tuntas (zero orphans). Tidak ada data inkonsisten yang tertinggal di database cloud.

---

## 7. Rekomendasi Teknis & Kesimpulan

- **Hasil Audit:** Skrip migrasi `001_initial_schema.sql` telah memenuhi seluruh kriteria keamanan relasional dan integritas data.
- **Tindakan Perbaikan:** Tidak diperlukan perubahan DDL pada Phase 4.2B karena:
  1. Seluruh 11 tabel target memiliki pasangan kolom `id` dan `user_id`.
  2. `profiles` tidak menggunakan trigger ini.
  3. `sync_tombstones` bebas dari *self-referencing trigger*.
  4. Penanganan exception terisolasi hanya pada penulisan tombstone.
  5. Cascade akun `auth.users` terbukti bersih dan aman.
