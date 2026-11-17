# Level Up Planner

> *Plan your life. Track your growth. Become your next level.*

**Level Up Planner** adalah aplikasi *personal life planner* berbasis Android-first (dengan kompatibilitas iOS) yang mengutamakan ketenangan, privasi, dan alur kerja terstruktur. Aplikasi ini menghubungkan visi besar jangka panjang dengan langkah nyata sehari-hari: dari target jangka panjang, tahapan *milestone*, tugas harian, kebiasaan (*habits*), hingga refleksi jurnal pribadi.

Dibangun dengan arsitektur **Local-First** menggunakan SQLite, memastikan seluruh data pengguna tersimpan aman di perangkat tanpa ketergantungan koneksi internet.

---

## Fitur Utama

- **Dashboard Terpadu:** Ringkasan fokus harian, persentase progres, tugas prioritas, tenggat terdekat, dan pintasan aksi cepat.
- **Perencanaan Target 3 Horizon:**
  - Jangka Pendek (0–3 bulan)
  - Jangka Menengah (3–12 bulan)
  - Jangka Panjang (1–5 tahun)
- **Milestone & Hierarki Terstruktur:** Pecah target besar menjadi pos-pos pencapaian terukur yang langsung terhubung ke tugas harian tanpa perhitungan progres ganda.
- **Manajemen Tugas Harian:** Filter tampilan *Today*, *Upcoming*, *This Week*, dan *Completed* dengan sistem checklist cepat.
- **Habit Tracker Berkelanjutan (*No-Guilt*):** Pantau target frekuensi mingguan dan riwayat 7 hari bergulir tanpa mekanisme pemutusan *streak* yang membebani mental.
- **Notes & Journal:** Ruang terpisah antara pencatatan ide cepat (dilengkapi pencarian *real-time*) dan penulisan refleksi harian yang privat.
- **Kalender Interaktif:** Navigasi bulan, indikator jadwal tugas pada tanggal, dan agenda harian lengkap.
- **Desain Minimalis & Hangat:** Palet warna alami (*Warm Cream*, *Soft Sage*, *Forest Green*, *Charcoal*) yang dirancang khusus untuk kenyamanan mata saat perencanaan harian.

---

## Teknologi yang Digunakan

- **Framework:** [React Native](https://reactnative.dev/) dengan [Expo SDK 58](https://expo.dev/)
- **Navigasi:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based Routing & Bottom Tabs)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/) (Strict typing)
- **Database Lokal:** [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Persistent Local Storage)
- **Ikonografi:** [Lucide Icons](https://lucide.dev/) via `lucide-react-native` & `react-native-svg`
- **Testing:** [Jest](https://jestjs.io/) & `ts-jest`

---

## Arsitektur Proyek

Aplikasi memisahkan antarmuka pengguna, aturan logika domain, dan lapisan akses data secara tegas:

```text
src/
├── app/             # Rute layar Expo Router (Tabs, Modals, Detail)
├── components/      # Komponen UI modular (common, goals, tasks, habits, notes)
├── context/         # Manajemen state reaktif global (AppContext)
├── database/        # Skema tabel SQLite dan inisialisasi data lokal
├── domain/          # Logika matematika progres, tanggal, dan unit testing Jest
├── repositories/    # Lapisan kueri data SQL terisolasi
├── theme/           # Token desain (warna, tipografi, jarak, radius)
└── types/           # Definisi model TypeScript
```

---

## Menjalankan Proyek Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)
- npm / yarn / pnpm

### Langkah Instalasi

1. **Clone repositori:**
   ```bash
   git clone https://github.com/username-kamu/level-up-planner.git
   cd level-up-planner
   ```

2. **Pasang dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan pengujian unit (opsional):**
   ```bash
   npm test
   ```

4. **Periksa tipe data TypeScript:**
   ```bash
   npm run typecheck
   ```

5. **Mulai server pengembangan:**
   ```bash
   npx expo start
   ```

Gunakan jalan pintas berikut di terminal:
- Tekan `a` untuk membuka di Emulator/Device Android.
- Tekan `i` untuk membuka di Simulator iOS (khusus macOS).
- Tekan `w` untuk membuka versi Web.

---