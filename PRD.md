# Product Requirements Document (PRD)

## Level Up Planner

**Versi:** 1.0\
**Tanggal:** 17 November 2026\
**Status:** Draft untuk validasi produk\
**Platform:** Android dan iOS\
**Tahap saat ini:** High-fidelity UI / interactive prototype\
**Nama produk:** Level Up Planner

------------------------------------------------------------------------

## 1. Ringkasan Produk

Level Up Planner adalah aplikasi personal life planner yang membantu
pengguna mengubah visi dan tujuan hidup menjadi rencana yang dapat
dijalankan setiap hari. Aplikasi menggabungkan task management, goal
planning, milestone tracking, habit tracking, notes, journaling, dan
kalender dalam satu pengalaman yang sederhana.

Produk ini bukan sekadar daftar pekerjaan. Nilai utamanya adalah
menghubungkan aktivitas harian dengan tujuan jangka pendek, menengah,
dan panjang sehingga pengguna dapat memahami alasan di balik setiap
langkah kecil yang mereka lakukan.

**Product tagline:** *Plan your life. Track your growth. Become your
next level.*

### 1.1 Masalah yang ingin diselesaikan

Pengguna sering menyimpan tugas, tujuan, ide, dan refleksi di berbagai
aplikasi atau media. Hal ini membuat mereka: - Kesulitan menentukan
prioritas harian. - Memiliki tujuan yang belum diterjemahkan menjadi
langkah konkret. - Kehilangan gambaran tentang hubungan antara tugas
harian dan tujuan jangka panjang. - Sulit memantau konsistensi dan
perkembangan. - Kesulitan melakukan refleksi secara rutin.

### 1.2 Solusi produk

Level Up Planner menyediakan satu ruang terpadu untuk: - Menyusun tujuan
berdasarkan horizon waktu. - Memecah tujuan menjadi milestone dan
tindakan. - Mengelola tugas harian dan tenggat. - Melacak kebiasaan. -
Menyimpan catatan dan jurnal. - Meninjau perkembangan secara berkala.

------------------------------------------------------------------------

## 2. Visi, Misi, dan Prinsip Produk

### Visi

Menjadi teman perencanaan pribadi yang membantu pengguna menjalani hari
dengan lebih terarah dan membangun kehidupan yang mereka inginkan.

### Misi

Membuat perencanaan hidup terasa jelas, ringan, fleksibel, dan
berkelanjutan.

### Prinsip UX

1.  **Simple first:** tampilkan informasi yang dibutuhkan, bukan
    semuanya sekaligus.
2.  **Low friction:** menambahkan tugas, tujuan, atau catatan harus
    cepat.
3.  **Meaningful progress:** kemajuan dihitung dari pencapaian yang
    bermakna dan transparan.
4.  **Flexible planning:** pengguna dapat mengubah target dan jadwal
    tanpa dipermalukan.
5.  **No-guilt design:** melewatkan satu hari bukan berarti gagal.
6.  **Privacy first:** catatan dan informasi personal harus dilindungi.
7.  **Accessible by default:** teks, kontras, target sentuh, dan
    navigasi harus mudah digunakan.

------------------------------------------------------------------------

## 3. Target Pengguna

### 3.1 Segmen utama

-   Pelajar dan mahasiswa yang mengelola tugas akademik sekaligus tujuan
    pribadi.
-   Profesional muda yang ingin menyeimbangkan karier, kesehatan,
    pembelajaran, dan kehidupan pribadi.
-   Individu yang menyukai journaling, habit tracking, dan
    self-improvement.
-   Pengguna yang membutuhkan satu sistem untuk mengatur rencana jangka
    pendek hingga panjang.

### 3.2 Kebutuhan pengguna

-   Mengetahui apa yang perlu dilakukan hari ini.
-   Menyimpan tujuan dan tenggat dalam satu tempat.
-   Memecah tujuan besar menjadi langkah yang realistis.
-   Melihat kemajuan tanpa harus menghitung manual.
-   Mencatat ide dan refleksi dengan mudah.
-   Meninjau rencana dan menyesuaikannya saat keadaan berubah.

### 3.3 Jobs to be Done

> Ketika saya memiliki banyak hal yang ingin dicapai, saya ingin
> mengubahnya menjadi tujuan, milestone, dan tugas yang teratur agar
> saya tahu langkah berikutnya dan dapat melihat kemajuan saya.

------------------------------------------------------------------------

## 4. Tujuan Produk dan Metrik Keberhasilan

### 4.1 Tujuan MVP

1.  Pengguna dapat membuat dan mengelola tujuan.
2.  Pengguna dapat menghubungkan milestone dan tugas dengan tujuan.
3.  Pengguna dapat mengelola tugas berdasarkan hari dan status.
4.  Pengguna dapat mencatat kebiasaan.
5.  Pengguna dapat menyimpan notes dan journal.
6.  Pengguna dapat melihat ringkasan aktivitas melalui dashboard.

### 4.2 Metrik awal

Metrik berikut merupakan hipotesis yang perlu divalidasi setelah
pengujian: - Activation: persentase pengguna baru yang membuat
setidaknya satu goal atau task. - Task completion: persentase tugas yang
ditandai selesai. - Goal engagement: jumlah goal aktif yang memiliki
milestone atau task terkait. - Weekly retention: pengguna yang kembali
menggunakan aplikasi pada minggu berikutnya. - Habit logging
consistency: frekuensi pencatatan habit per minggu. - Qualitative
usability: keberhasilan pengguna menyelesaikan tugas inti saat usability
testing.

Target angka ditentukan setelah baseline dari beta test tersedia.

------------------------------------------------------------------------

## 5. Ruang Lingkup Produk

### 5.1 MVP --- Must Have

-   Dashboard.
-   Task management.
-   Goal management dengan tiga horizon waktu.
-   Milestone tracking.
-   Relasi goal--milestone--task.
-   Notes.
-   Journal.
-   Habit tracking dasar.
-   Calendar view dasar.
-   Profile dan pengaturan dasar.
-   Penyimpanan data lokal yang persisten.

### 5.2 Setelah MVP --- Should Have

-   Reminder dan notifikasi lokal.
-   Weekly review.
-   Monthly progress summary.
-   Pencarian dan filter.
-   Kategori yang dapat dikustomisasi.
-   Sinkronisasi antarperangkat.
-   Ekspor data.

### 5.3 Future --- Could Have

-   Vision board.
-   AI goal assistant.
-   Rekomendasi prioritas.
-   Insight personal berdasarkan pola penggunaan.
-   Home-screen widgets.
-   Integrasi kalender eksternal.
-   Tema tambahan dan personalisasi lebih lanjut.

### 5.4 Di luar ruang lingkup prototype awal

-   Social feed atau fitur komunitas.
-   Kolaborasi tim.
-   Pembayaran dan langganan.
-   Integrasi kalender eksternal penuh.
-   AI assistant yang terhubung ke layanan eksternal.
-   Sinkronisasi cloud dan multi-device sebelum backend ditetapkan.

------------------------------------------------------------------------

## 6. Struktur Navigasi dan Information Architecture

Navigasi utama menggunakan bottom navigation dengan lima tab:

1.  **Home:** ringkasan harian dan pintasan.
2.  **Goals:** daftar tujuan berdasarkan horizon.
3.  **Tasks:** tugas hari ini, mendatang, dan mingguan.
4.  **Habits:** kebiasaan dan catatan harian.
5.  **Notes:** notes dan journal.

Layar sekunder: - Welcome dan onboarding. - Goal detail. - Add/edit
task. - Add/edit goal. - Add/edit note. - Journal entry. - Calendar. -
Profile dan settings.

Calendar dapat diakses dari Home atau Tasks. Profile dapat diakses
melalui ikon profil pada header.

------------------------------------------------------------------------

## 7. Functional Requirements

Prioritas: - **P0:** wajib untuk MVP. - **P1:** penting setelah alur
inti stabil. - **P2:** pengembangan lanjutan.

### 7.1 Onboarding

**Prioritas:** P0

Pengguna dapat: - Melihat pengenalan singkat aplikasi. - Mengatur nama
tampilan. - Memilih area kehidupan yang ingin dikembangkan. - Melewati
onboarding dan langsung menggunakan aplikasi.

Area awal: Personal Growth, Education, Career, Health & Wellness,
Finance, Relationships, dan Lifestyle.

**Acceptance criteria** - Pengguna dapat menyelesaikan onboarding tanpa
mengisi semua pilihan. - Pengguna dapat melewati onboarding. -
Preferensi onboarding tersimpan secara lokal.

### 7.2 Home Dashboard

**Prioritas:** P0

Menampilkan: - Sapaan dan tanggal. - Ringkasan progress tugas hari
ini. - Today's priorities. - Tugas yang belum selesai. - Upcoming
deadlines. - Ringkasan goal aktif. - Pintasan untuk menambahkan task.

**Acceptance criteria** - Dashboard menampilkan data terbaru dari
penyimpanan aplikasi. - Task yang selesai langsung memperbarui ringkasan
progress. - Pengguna dapat membuka detail task atau goal dari
dashboard. - Empty state tersedia ketika belum ada data.

### 7.3 Goals

**Prioritas:** P0

Setiap goal memiliki: - Judul. - Deskripsi opsional. - Horizon:
Short-term, Mid-term, atau Long-term. - Kategori. - Tanggal mulai. -
Target date opsional. - Prioritas. - Status. - Daftar milestone.

Definisi horizon awal: - Short-term: 0--3 bulan. - Mid-term: 3--12
bulan. - Long-term: 1--5 tahun.

Rentang ini adalah panduan awal dan dapat disesuaikan pengguna.

Pengguna dapat membuat, melihat, mengedit, mengarsipkan, dan menghapus
goal.

**Acceptance criteria** - Goal dapat dibuat dan diedit. - Goal dapat
difilter berdasarkan horizon. - Goal detail menampilkan milestone dan
progress. - Goal yang diarsipkan tidak muncul di daftar aktif. -
Penghapusan meminta konfirmasi.

### 7.4 Milestones

**Prioritas:** P0

Setiap milestone memiliki: - Judul. - Deskripsi opsional. - Urutan. -
Status selesai/belum selesai. - Tanggal target opsional.

**Acceptance criteria** - Pengguna dapat menambah, mengedit,
mengurutkan, dan menghapus milestone. - Milestone dapat ditandai selesai
atau dibuka kembali. - Progress goal dihitung dari milestone yang
selesai dibanding total milestone. - Jika belum ada milestone, progress
ditampilkan sebagai belum dimulai, bukan 0% yang menyesatkan.

### 7.5 Tasks

**Prioritas:** P0

Setiap task memiliki: - Judul. - Deskripsi opsional. - Due date
opsional. - Priority: Low, Medium, High. - Kategori. - Status: To do,
Completed. - Relasi ke goal atau milestone opsional. - Reminder opsional
setelah fitur notifikasi tersedia.

Filter: - Today. - Upcoming. - This week. - Completed.

**Acceptance criteria** - Pengguna dapat membuat, mengedit,
menyelesaikan, dan menghapus task. - Task tanpa deadline tetap dapat
disimpan. - Task dapat dihubungkan ke goal atau milestone. -
Menyelesaikan task memperbarui status task, tetapi tidak otomatis
menyelesaikan milestone kecuali aturan produk secara eksplisit
mengaturnya. - Pengguna dapat membuka kembali task yang selesai.

### 7.6 Goal-to-Task Connection

**Prioritas:** P0

Tujuan fitur ini adalah menghubungkan rencana besar dengan aktivitas
harian.

Relasi yang direkomendasikan: - Satu goal memiliki banyak milestone. -
Satu milestone dapat memiliki banyak task. - Task dapat memiliki satu
relasi goal atau milestone, atau tidak memiliki relasi.

**Aturan progress** - Progress goal dihitung berdasarkan milestone
selesai. - Progress milestone dapat dihitung berdasarkan task terkait
jika milestone memiliki task. - Jika milestone tidak memiliki task,
milestone dapat diselesaikan manual. - Hindari menghitung task yang sama
dua kali dalam progress goal.

### 7.7 Habits

**Prioritas:** P0 untuk pencatatan dasar; P1 untuk pengaturan lanjutan.

Setiap habit memiliki: - Nama. - Frekuensi target. - Hari aktif. -
Tanggal mulai. - Status aktif/arsip.

Habit log mencatat apakah habit dilakukan pada tanggal tertentu.

**Acceptance criteria** - Pengguna dapat menandai habit selesai pada
tanggal tertentu. - Pengguna dapat membatalkan tanda selesai. - Riwayat
tidak boleh menggandakan log pada habit dan tanggal yang sama. -
Statistik mingguan menghitung log berdasarkan hari lokal pengguna.

### 7.8 Notes

**Prioritas:** P0

Pengguna dapat: - Membuat, melihat, mengedit, dan menghapus note. -
Menambahkan judul dan isi. - Menambahkan kategori atau tag pada
pengembangan berikutnya. - Mencari note setelah search tersedia.

### 7.9 Journal

**Prioritas:** P0

Pengguna dapat: - Membuat entri berdasarkan tanggal. - Menambahkan judul
dan isi. - Melihat daftar entri sebelumnya. - Mengedit dan menghapus
entri.

Journal harus diperlakukan sebagai data pribadi dan tidak boleh
ditampilkan ke pengguna lain.

### 7.10 Calendar

**Prioritas:** P0 untuk tampilan dasar.

Menampilkan tanggal dan task yang memiliki due date.

**Acceptance criteria** - Pengguna dapat berpindah tanggal dan bulan. -
Task bertanggal ditampilkan pada tanggal yang benar. - Zona waktu
perangkat diperhitungkan. - Calendar tidak mengklaim sebagai integrasi
kalender eksternal.

### 7.11 Profile & Settings

**Prioritas:** P0 dasar.

Pengaturan awal: - Display name. - Theme preference. - Awal minggu. -
Preferensi notifikasi saat tersedia. - Informasi versi aplikasi. -
Pengelolaan dan penghapusan data.

------------------------------------------------------------------------

## 8. UI/UX dan Design System

### 8.1 Arah visual

Gaya: minimalist, warm, calm, modern, dan personal.

Android menjadi design reference utama, dengan layout responsif dan pola
navigasi yang tetap konsisten di iOS.

### 8.2 Color palette

  Token          Hex         Penggunaan
  -------------- ----------- ----------------
  Warm Cream     `#F7F5EF`   Background
  Soft Sage      `#A8B9A0`   Accent
  Forest Green   `#526B56`   Primary action
  Muted Beige    `#E8E1D5`   Surface
  Charcoal       `#333831`   Primary text
  White          `#FFFFFF`   Card surface

### 8.3 Typography

Rekomendasi: - Inter atau DM Sans. - Heading tegas dan mudah dipindai. -
Body text dengan line-height nyaman. - Ukuran teks mendukung pengaturan
font perangkat.

### 8.4 Komponen

-   Rounded cards sekitar 12--18 dp.
-   Tombol dengan target sentuh yang nyaman.
-   Progress bar sederhana.
-   Checkbox dan status chips.
-   Bottom navigation.
-   Modal atau bottom sheet untuk form.
-   Empty states dengan instruksi singkat.
-   Loading, error, dan confirmation states.

### 8.5 Prinsip aksesibilitas

-   Kontras teks dan background harus memadai.
-   Jangan mengandalkan warna saja untuk menyampaikan status.
-   Semua kontrol memiliki label aksesibilitas.
-   Area sentuh mengikuti panduan platform.
-   Mendukung ukuran font perangkat.
-   Navigasi dan urutan fokus konsisten.

------------------------------------------------------------------------

## 9. User Flows Utama

### 9.1 Membuat goal

1.  Pengguna membuka tab Goals.
2.  Memilih horizon waktu.
3.  Menekan Add Goal.
4.  Mengisi judul, kategori, dan target date opsional.
5.  Menyimpan goal.
6.  Membuka goal detail.
7.  Menambahkan milestone.
8.  Menghubungkan task ke milestone.

### 9.2 Menyelesaikan task

1.  Pengguna membuka Home atau Tasks.
2.  Memilih task.
3.  Menandai task selesai.
4.  Status task diperbarui.
5.  Dashboard menghitung ulang daily progress.
6.  Jika task terhubung ke milestone, progress milestone diperbarui
    sesuai aturan.

### 9.3 Melakukan weekly review

1.  Pengguna membuka ringkasan mingguan.
2.  Meninjau task selesai dan tertunda.
3.  Meninjau progress goal.
4.  Meninjau habit log.
5.  Menyesuaikan target dan prioritas minggu berikutnya.

Weekly review masuk ke prioritas P1.

------------------------------------------------------------------------

## 10. Data Model Awal

Entitas yang direkomendasikan:

### profiles

-   id
-   display_name
-   created_at
-   updated_at

### goals

-   id
-   user_id
-   title
-   description
-   horizon
-   category
-   start_date
-   target_date
-   priority
-   status
-   created_at
-   updated_at

### milestones

-   id
-   goal_id
-   title
-   description
-   sort_order
-   target_date
-   completed_at
-   created_at
-   updated_at

### tasks

-   id
-   user_id
-   goal_id nullable
-   milestone_id nullable
-   title
-   description
-   due_at nullable
-   priority
-   status
-   category
-   completed_at
-   created_at
-   updated_at

### habits

-   id
-   user_id
-   title
-   frequency
-   active_days
-   start_date
-   archived_at nullable
-   created_at
-   updated_at

### habit_logs

-   id
-   habit_id
-   log_date
-   completed
-   created_at

Unique constraint: kombinasi `habit_id` dan `log_date`.

### notes

-   id
-   user_id
-   title
-   body
-   category nullable
-   created_at
-   updated_at

### journal_entries

-   id
-   user_id
-   title
-   body
-   entry_date
-   created_at
-   updated_at

### Relasi inti

-   Profile memiliki banyak goals, tasks, habits, notes, dan journal
    entries.
-   Goal memiliki banyak milestones.
-   Goal dapat memiliki banyak tasks.
-   Milestone dapat memiliki banyak tasks.
-   Habit memiliki banyak habit logs.

Untuk implementasi lokal, struktur data dapat disimpan melalui
repository layer agar migrasi ke backend tidak mengharuskan perubahan
besar pada UI.

------------------------------------------------------------------------

## 11. Technical Architecture

### 11.1 Stack yang direkomendasikan

  Layer                     Teknologi
  ------------------------- ----------------------------------------------
  Mobile                    React Native
  Framework                 Expo
  Language                  TypeScript
  Navigation                Expo Router atau React Navigation
  Local persistence         SQLite atau solusi storage lokal terstruktur
  Backend fase berikutnya   Supabase
  Database cloud            PostgreSQL
  Authentication            Supabase Auth
  Design handoff            Figma
  Version control           GitHub

### 11.2 Arsitektur

Pisahkan aplikasi menjadi: - Presentation: screen dan komponen UI. -
Domain: aturan goal, milestone, task, dan habit. - Data: repository dan
local storage. - Services: notifikasi, sinkronisasi, dan integrasi
eksternal.

UI tidak boleh bergantung langsung pada implementasi database.

### 11.3 Offline-first

MVP sebaiknya dapat digunakan tanpa koneksi internet setelah instalasi.

Data lokal harus tetap tersedia setelah aplikasi ditutup dan dibuka
kembali. Sinkronisasi cloud menjadi pengembangan berikutnya.

### 11.4 Security & privacy

-   Data pengguna harus dipisahkan berdasarkan pemilik.
-   Backend nantinya menggunakan Row Level Security.
-   Journal dan notes tidak boleh terekspos melalui log aplikasi.
-   Sediakan cara menghapus data pengguna.
-   Jangan menyimpan credential atau secret di aplikasi client.
-   Pertimbangkan enkripsi dan kebijakan backup sebelum rilis produksi.

------------------------------------------------------------------------

## 12. Non-Functional Requirements

### Performance

-   Navigasi antarhalaman terasa responsif.
-   Daftar panjang menggunakan rendering yang efisien.
-   Perhitungan progress tidak menghambat interaksi.

### Reliability

-   Perubahan data disimpan secara konsisten.
-   Aplikasi menangani kondisi data kosong.
-   Penghapusan data membutuhkan konfirmasi.
-   Perubahan status tidak menghasilkan duplikasi.

### Compatibility

-   Android menjadi platform pengujian pertama.
-   Layout mendukung ukuran layar ponsel umum.
-   iOS tetap menjadi target kompatibilitas.
-   Perilaku keyboard, safe area, dan back navigation mengikuti
    platform.

### Privacy

-   Data pribadi hanya dapat diakses pemiliknya.
-   Penghapusan akun dan data harus didukung sebelum rilis dengan akun
    cloud.
-   Kebijakan privasi harus tersedia sebelum distribusi publik.

------------------------------------------------------------------------

## 13. Acceptance Criteria MVP

MVP dapat masuk tahap beta ketika:

-   [ ] Pengguna dapat menyelesaikan onboarding atau melewatinya.
-   [ ] Pengguna dapat membuat, mengedit, dan menghapus goal.
-   [ ] Goal memiliki horizon short, mid, dan long-term.
-   [ ] Pengguna dapat mengelola milestone.
-   [ ] Progress goal dihitung dengan aturan yang konsisten.
-   [ ] Pengguna dapat membuat dan menyelesaikan task.
-   [ ] Task dapat dihubungkan dengan goal atau milestone.
-   [ ] Dashboard memperbarui ringkasan secara langsung.
-   [ ] Pengguna dapat mencatat habit per tanggal.
-   [ ] Pengguna dapat membuat dan mengedit notes.
-   [ ] Pengguna dapat membuat dan mengedit journal entries.
-   [ ] Calendar menampilkan tanggal dan task yang relevan.
-   [ ] Data tetap tersimpan setelah aplikasi ditutup.
-   [ ] Empty, loading, dan error states tersedia.
-   [ ] Pengujian dasar Android dan iOS lulus.
-   [ ] Pengujian privasi dan akses data lulus.

------------------------------------------------------------------------

## 14. Roadmap Pengembangan

Estimasi awal untuk satu developer; dapat berubah berdasarkan hasil
implementasi dan pengujian.

  Tahap   Fokus                     Output
  ------- ------------------------- -------------------------------------------
  1       Product & UI refinement   Wireframe dan high-fidelity screens
  2       App foundation            Expo setup, navigation, design components
  3       Local data layer          Repository dan persistent storage
  4       Core planning             Goals, milestones, tasks
  5       Personal tools            Habits, notes, journal
  6       Overview                  Dashboard dan calendar
  7       QA                        Testing, accessibility, bug fixing
  8       Beta preparation          Build internal dan feedback pengguna

### Definition of Done

Sebuah fitur dianggap selesai jika: - UI mengikuti design system. - Alur
utama berfungsi. - Data tersimpan dengan benar. - Validasi input
tersedia. - Empty dan error states ditangani. - Tidak ada bug kritis
yang diketahui. - Fitur diuji pada perangkat atau emulator target.

------------------------------------------------------------------------

## 15. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Scope terlalu besar                 Prioritaskan P0 dan tunda fitur
                                      tambahan

  Goal progress membingungkan         Dokumentasikan rumus dan aturan
                                      milestone

  Data hilang setelah aplikasi        Gunakan persistent local storage
  ditutup                             dan tes restart

  Navigasi terlalu padat              Pertahankan lima tab utama

  Pengguna merasa terbebani           Gunakan no-guilt design dan
                                      reminder opsional

  Sinkronisasi menimbulkan konflik    Tunda cloud sync sampai aturan
                                      konflik dirancang

  Catatan pribadi terekspos           Terapkan kontrol akses dan
                                      kebijakan privasi
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 16. Keputusan Produk yang Masih Perlu Divalidasi

Hal-hal berikut belum dianggap keputusan final:

1.  Apakah goal dapat memiliki sub-goal atau hanya milestone?
2.  Apakah satu task dapat terkait ke beberapa goal?
3.  Apakah progress goal sepenuhnya berbasis milestone atau juga
    mendukung manual progress?
4.  Apakah aplikasi memerlukan akun sejak awal atau dapat digunakan
    tanpa akun?
5.  Apakah backup lokal dan ekspor data masuk MVP?
6.  Apakah notifikasi diperlukan pada rilis pertama?
7.  Apakah pengguna dapat mengatur horizon waktu sendiri?

Rekomendasi awal: - Satu task terkait ke maksimal satu milestone. - Satu
milestone terkait ke satu goal. - Progress goal berbasis milestone. -
Penggunaan lokal tanpa akun untuk MVP. - Cloud account dan sinkronisasi
ditambahkan setelah alur lokal stabil. - Reminder menjadi P1.

------------------------------------------------------------------------

## 17. Ringkasan

Level Up Planner adalah personal life planner yang menghubungkan visi
jangka panjang dengan tujuan jangka menengah, tujuan jangka pendek,
milestone, dan aktivitas harian.

**MVP berfokus pada lima pengalaman utama:** 1. Melihat arah dan
prioritas hari ini. 2. Menetapkan dan mengelola tujuan. 3. Mengubah
tujuan menjadi tindakan. 4. Membangun kebiasaan. 5. Mencatat ide dan
refleksi.

**Prinsip produk:** sederhana untuk digunakan setiap hari, cukup kuat
untuk membantu perencanaan jangka panjang.

Dokumen ini adalah PRD draft v1.0 untuk menjadi acuan desain,
implementasi, dan validasi prototype. Keputusan yang masih terbuka harus
dikonfirmasi sebelum menjadi persyaratan produksi.
