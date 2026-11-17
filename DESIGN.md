# Design System & UI/UX Specification

## Level Up Planner

**Versi:** 1.0\
**Tanggal:** 17 November 2026\
**Status:** Draft untuk implementasi prototype\
**Platform:** Android-first, iOS-compatible\
**Product:** Level Up Planner\
**Visual direction:** Minimalist, warm, calm, personal

------------------------------------------------------------------------

## 1. Design Vision

Level Up Planner harus terasa seperti ruang pribadi yang rapi, tenang,
dan menyemangati. Desain membantu pengguna berpikir jernih, menentukan
prioritas, dan melihat perkembangan tanpa merasa terbebani.

**Design tagline:** *A calm space to plan your next level.*

### Karakter visual

-   Minimalist: mengurangi elemen yang tidak membantu tugas pengguna.
-   Warm: menggunakan warna natural dan permukaan lembut.
-   Encouraging: memberikan umpan balik positif tanpa tekanan.
-   Clear: hierarki visual kuat dan informasi mudah dipindai.
-   Personal: terasa seperti planner milik sendiri, bukan dashboard
    bisnis.

### Prinsip desain

1.  Prioritaskan konten dan tindakan utama.
2.  Gunakan whitespace untuk mengurangi beban kognitif.
3.  Gunakan warna aksen secara konsisten.
4.  Jangan menyampaikan status hanya melalui warna.
5.  Hindari gamification yang membuat pengguna merasa bersalah.
6.  Pertahankan pola interaksi yang familiar dengan Android.
7.  Pastikan semua layar tetap nyaman di perangkat berukuran kecil.

------------------------------------------------------------------------

## 2. Brand Identity

### Nama

**Level Up Planner**

### Tagline

**Plan your life. Track your growth. Become your next level.**

### Brand personality

  Attribute     Deskripsi
  ------------- -----------------------------------
  Calm          Tenang, tidak ramai
  Intentional   Setiap elemen memiliki tujuan
  Supportive    Mendukung, bukan menghakimi
  Organized     Terstruktur dan mudah dipahami
  Optimistic    Memberi semangat secara realistis

### Logo direction

Rekomendasi logo awal: - Wordmark uppercase: `LEVEL UP PLANNER`. -
Simbol sederhana berupa bintang kecil, daun, atau bentuk progress/upward
mark. - Hindari ikon kompleks. - Gunakan Forest Green untuk wordmark dan
Soft Sage untuk simbol.

Logo ini merupakan arahan visual; aset final perlu dibuat sebagai file
SVG/PNG terpisah.

------------------------------------------------------------------------

## 3. Color System

Gunakan token warna agar implementasi konsisten dan mudah diubah.

### 3.1 Core palette

  Token         Hex         Penggunaan
  ------------- ----------- ------------------------------
  `cream`       `#F7F5EF`   Background utama
  `paper`       `#FFFEFA`   Card dan modal
  `sage`        `#A8B9A0`   Accent lembut
  `forest`      `#526B56`   Primary action, active state
  `beige`       `#E8E1D5`   Surface sekunder
  `charcoal`    `#333831`   Teks utama
  `muted`       `#7C8379`   Teks sekunder
  `line`        `#E8E4DA`   Border dan divider
  `pale-sage`   `#EEF1E9`   Highlight lembut
  `soft-blue`   `#DCE8E8`   Accent sekunder opsional

### 3.2 Semantic colors

  Token     Rekomendasi   Penggunaan
  --------- ------------- ------------------------------
  Success   `#426B50`     Selesai, tersimpan
  Warning   `#9A6B32`     Mendekati deadline
  Error     `#A34F49`     Error dan destructive action
  Info      `#526B75`     Informasi tambahan

Semantic colors harus tetap diuji kontrasnya dengan surface yang
digunakan. Jangan menggunakan warna sebagai satu-satunya indikator.

### 3.3 Color usage rules

-   Background utama: Cream.
-   Surface/card: Paper.
-   Primary button: Forest.
-   Active navigation: Forest.
-   Progress fill: Forest.
-   Progress track: Beige atau Line.
-   Secondary text: Muted.
-   Border: Line.
-   Sage digunakan sebagai highlight, bukan untuk semua komponen
    sekaligus.

------------------------------------------------------------------------

## 4. Typography

### Font recommendation

Gunakan **Inter** sebagai font utama. Alternatif: system font platform
jika font custom belum disiapkan.

### Type scale

  Token               Ukuran Weight     Penggunaan
  -------------- ----------- ---------- ------------------------------
  `display`        30--32 sp Bold       Greeting atau headline utama
  `h1`             26--28 sp Bold       Judul halaman
  `h2`             20--22 sp Bold       Judul bagian
  `h3`             16--18 sp Semibold   Judul card
  `body`           14--16 sp Regular    Isi utama
  `body-small`     12--13 sp Regular    Metadata
  `caption`        10--11 sp Medium     Label kecil
  `button`         13--15 sp Semibold   Teks tombol

Gunakan sp untuk ukuran teks React Native agar mendukung pengaturan font
perangkat. Hindari terlalu banyak uppercase label; gunakan hanya untuk
metadata atau kategori pendek.

### Typography rules

-   Judul harus ringkas dan mudah dipindai.
-   Body text menggunakan line height sekitar 1.4--1.55.
-   Jangan gunakan font kecil untuk instruksi penting.
-   Batasi penggunaan lebih dari dua keluarga font.

------------------------------------------------------------------------

## 5. Spacing, Grid, dan Layout

### Spacing scale

Gunakan basis 4 dp:

  Token          Nilai
  ------------ -------
  `space-1`       4 dp
  `space-2`       8 dp
  `space-3`      12 dp
  `space-4`      16 dp
  `space-5`      20 dp
  `space-6`      24 dp
  `space-8`      32 dp
  `space-10`     40 dp
  `space-12`     48 dp

### Layout rules

-   Horizontal screen padding: 18--20 dp.
-   Card internal padding: 16 dp.
-   Jarak antarkomponen: 12--16 dp.
-   Jarak antarbagian utama: 20--24 dp.
-   Gunakan `SafeAreaView` atau safe-area handling yang sesuai.
-   Konten panjang ditempatkan dalam scroll container.
-   Hindari fixed width untuk konten utama.
-   Gunakan layout responsif untuk berbagai ukuran layar.

### Elevation and shadows

-   Default: gunakan border tipis, bukan shadow berat.
-   Modal atau bottom sheet boleh memiliki elevation lebih tinggi.
-   Hindari banyak lapisan shadow.
-   Pastikan surface tetap terbaca di layar dengan brightness rendah.

------------------------------------------------------------------------

## 6. Shape, Borders, dan Iconography

### Radius

  Token              Nilai Penggunaan
  --------------- -------- --------------------
  `radius-sm`         8 dp Small chips
  `radius-md`        12 dp Inputs dan buttons
  `radius-lg`        16 dp Cards
  `radius-xl`        20 dp Featured cards
  `radius-full`     999 dp Avatar dan pills

### Borders

-   Default border: 1 dp.
-   Warna: Line.
-   Active border: Forest atau Sage.
-   Hindari border tebal pada semua card.

### Iconography

-   Gunakan satu keluarga ikon line yang konsisten, misalnya Lucide.
-   Ukuran umum: 20--24 dp.
-   Ikon harus memiliki label aksesibilitas.
-   Jangan mencampur emoji, filled icons, dan line icons tanpa aturan.
-   Ikon dekoratif tidak boleh menggantikan label tindakan penting.

------------------------------------------------------------------------

## 7. Component Specifications

### 7.1 Buttons

**Primary button** - Background: Forest. - Text: White. - Radius: 12--14
dp. - Height target: 48--52 dp. - Label singkat dengan kata kerja.

**Secondary button** - Background: Pale Sage atau transparan. - Border:
Sage/Line. - Text: Forest.

**Destructive button** - Gunakan semantic Error. - Minta konfirmasi
untuk tindakan penghapusan permanen.

States: - Default. - Pressed. - Disabled. - Loading.

### 7.2 Cards

-   Background: Paper.
-   Border: 1 dp Line.
-   Radius: 16--18 dp.
-   Padding: 16 dp.
-   Gunakan card hanya untuk mengelompokkan informasi yang saling
    berkaitan.
-   Card yang dapat ditekan harus menunjukkan affordance yang jelas.

### 7.3 Inputs

-   Background: Paper.
-   Border: Line.
-   Radius: 12 dp.
-   Tinggi minimum: 48 dp.
-   Label berada di atas input.
-   Placeholder menggunakan Muted.
-   Error message ditampilkan dekat input.
-   Keyboard type harus sesuai dengan jenis data.

### 7.4 Progress bar

-   Track: Beige/Line.
-   Fill: Forest.
-   Tinggi: 6--8 dp.
-   Radius: Full.
-   Sertakan nilai teks, misalnya `60%`, agar status tidak bergantung
    pada warna.

### 7.5 Chips dan badges

-   Gunakan untuk horizon, kategori, dan prioritas.
-   Hindari menampilkan terlalu banyak badge dalam satu card.
-   Pastikan teks tetap terbaca dan tidak terpotong.

### 7.6 Checkbox

-   Ukuran visual sekitar 20--22 dp.
-   Touch target minimum mengikuti pedoman platform.
-   Completed state memiliki checkmark dan perubahan teks yang jelas.
-   Jangan hanya mengandalkan perubahan warna.

### 7.7 Bottom navigation

Lima tab utama: 1. Home 2. Goals 3. Tasks 4. Habits 5. Notes

Aturan: - Ikon di atas label. - Active state menggunakan Forest. -
Inactive state menggunakan Muted. - Label selalu terlihat. - Gunakan
safe-area inset bagian bawah. - Calendar dan Profile diakses dari layar
utama, bukan menambah tab keenam/ketujuh.

### 7.8 Modal / Bottom sheet

Gunakan untuk: - Add task. - Add goal. - Add note. - Add journal
entry. - Quick edit.

Aturan: - Judul jelas. - Form memiliki label. - Tombol Save mudah
ditemukan. - Modal dapat ditutup dengan gesture/back button. - Keyboard
tidak boleh menutupi field aktif atau tombol utama.

------------------------------------------------------------------------

## 8. Navigation & Screen Specifications

## 8.1 Welcome

**Tujuan:** memperkenalkan manfaat aplikasi.

Elemen: - Logo dan nama produk. - Tagline. - Ilustrasi sederhana
opsional. - Primary CTA: Get started. - Secondary CTA: I already have an
account (aktif jika autentikasi telah dibuat).

## 8.2 Onboarding

**Tujuan:** mengatur preferensi awal dengan cepat.

Urutan: 1. Welcome. 2. Display name. 3. Area kehidupan yang ingin
dikembangkan. 4. Focus atau intention. 5. Finish.

Aturan: - Tampilkan progress onboarding. - Pengguna boleh melewati
pertanyaan opsional. - Hindari form panjang. - Jangan meminta izin
notifikasi sebelum manfaatnya dijelaskan.

## 8.3 Home Dashboard

**Tujuan:** menjawab "Apa yang perlu saya lakukan hari ini?"

Urutan konten: 1. Greeting dan tanggal. 2. Daily progress card. 3.
Today's priorities. 4. Upcoming deadlines. 5. Active goals. 6. Habit
summary. 7. Quick add action.

Empty state: - Sapaan yang ramah. - Pesan bahwa belum ada task. - CTA
untuk membuat task atau goal pertama.

## 8.4 Goals

**Tujuan:** melihat tujuan berdasarkan horizon.

Elemen: - Page title dan deskripsi pendek. - Segmented control:
Short-term, Mid-term, Long-term. - Goal cards. - Add Goal action.

Goal card menampilkan: - Judul. - Horizon. - Kategori. - Target date. -
Progress. - Jumlah milestone selesai.

Empty state: - Jelaskan bahwa belum ada goal pada horizon tersebut. -
CTA Create a goal.

## 8.5 Goal Detail

**Tujuan:** memahami dan mengelola satu tujuan.

Elemen: - Goal title. - Description. - Horizon dan kategori. - Target
date. - Progress summary. - Milestone checklist. - Related tasks. - Edit
goal action.

Interaksi: - Tap milestone untuk mengubah status. - Tambah milestone. -
Buka task terkait. - Edit atau archive goal.

## 8.6 Tasks

**Tujuan:** mengelola tindakan yang harus dilakukan.

Elemen: - Tabs Today, Upcoming, This week, Completed. - Grouping
berdasarkan tanggal. - Task row. - Priority indicator. - Related
goal/milestone jika ada. - Add Task button.

Task row: - Checkbox. - Judul. - Kategori atau metadata. - Due date. -
Priority jika relevan.

## 8.7 Add/Edit Task

Field: - Title (wajib). - Description (opsional). - Due date
(opsional). - Priority. - Category. - Related goal/milestone (opsional).

Validasi: - Title tidak boleh kosong. - Tanggal harus valid. - Jika
pengguna keluar dengan perubahan belum disimpan, berikan konfirmasi bila
perlu.

## 8.8 Habits

**Tujuan:** membantu membangun rutinitas tanpa memberi tekanan.

Elemen: - Intro motivasional singkat. - Weekly habit cards. - Hari dalam
minggu. - Completion state. - Frequency target. - Add habit action.

UX: - Pengguna dapat menandai dan membatalkan log. - Riwayat masa lalu
tetap dapat dilihat. - Hindari pesan negatif saat streak terputus.

## 8.9 Notes

**Tujuan:** menyimpan ide dan informasi.

Elemen: - Search (ketika tersedia). - Note cards/list. - Category/tag. -
New note action.

Note preview menampilkan judul dan cuplikan isi.

## 8.10 Journal

**Tujuan:** ruang refleksi pribadi.

Elemen: - Tanggal. - Judul opsional. - Editor teks. - Save action. -
Daftar entri sebelumnya.

Gunakan tampilan yang tenang dan minim distraksi. Jangan menampilkan isi
jurnal pada dashboard tanpa tindakan eksplisit pengguna.

## 8.11 Calendar

**Tujuan:** melihat tugas berdasarkan tanggal.

Elemen: - Month header. - Navigasi bulan. - Date grid. - Penanda tanggal
dengan task. - Selected day agenda.

Aturan: - Tanggal lokal perangkat digunakan untuk tampilan. - Task tanpa
due date tidak ditampilkan sebagai event kalender. - Jangan mengklaim
sinkronisasi eksternal jika belum tersedia.

## 8.12 Profile & Settings

Elemen: - Display name. - Theme. - Week start preference. - Notification
preferences. - Data/privacy controls. - About/version.

Untuk prototype, kontrol yang belum aktif harus diberi status Coming
soon atau dibuat nonaktif secara jelas.

------------------------------------------------------------------------

## 9. Interaction Patterns

### Feedback

-   Task complete: checkmark dan progress update.
-   Goal saved: confirmation singkat.
-   Form invalid: inline validation.
-   Delete: confirmation dialog.
-   Empty list: helpful CTA.
-   Loading: skeleton atau progress indicator bila operasi async
    tersedia.

### Motion

-   Gunakan animasi singkat dan halus.
-   Durasi umum sekitar 150--250 ms.
-   Hindari animasi berulang yang mengganggu.
-   Hormati pengaturan Reduce Motion jika tersedia.
-   Animasi tidak boleh menjadi satu-satunya cara menyampaikan status.

### Haptics

Haptic feedback dapat ditambahkan untuk tindakan penting seperti
menyelesaikan task, jika sesuai dan dapat dimatikan.

------------------------------------------------------------------------

## 10. Responsive & Platform Behavior

### Android-first

-   Gunakan Material-compatible interaction patterns tanpa meninggalkan
    identitas visual produk.
-   Perhatikan Android system navigation dan status bar.
-   Tangani hardware/system back button.
-   Keyboard resize harus menjaga field dan CTA tetap terlihat.
-   Uji pada beberapa density dan ukuran layar.

### iOS compatibility

-   Gunakan safe-area insets.
-   Pastikan bottom navigation tidak tertutup home indicator.
-   Perhatikan keyboard behavior dan modal presentation.
-   Hindari mengandalkan perilaku Android yang tidak tersedia di iOS.

### Responsive rules

-   Gunakan flex layout.
-   Hindari ukuran layar yang di-hardcode.
-   Pastikan teks panjang dapat wrap.
-   Card dan button mengikuti lebar container.
-   Uji ukuran layar kecil dan besar.

------------------------------------------------------------------------

## 11. Accessibility Checklist

-   [ ] Kontras teks dan surface memadai.
-   [ ] Kontrol interaktif memiliki accessible label.
-   [ ] Touch target cukup besar.
-   [ ] Status tidak hanya dibedakan dengan warna.
-   [ ] Font scaling tidak merusak layout.
-   [ ] Urutan fokus masuk akal.
-   [ ] Input memiliki label dan pesan error.
-   [ ] Screen reader dapat memahami nama dan status kontrol.
-   [ ] Animasi tidak menghalangi penggunaan.
-   [ ] Informasi penting tidak hanya disampaikan melalui ikon.

------------------------------------------------------------------------

## 12. Content & Microcopy

Gunakan bahasa yang hangat, jelas, dan tidak menghakimi.

### Contoh microcopy

  Situasi          Copy
  ---------------- ----------------------------------------------------
  Greeting         "Good morning. Let's make today count."
  Empty tasks      "Nothing on your list yet. Add one small step."
  Empty goals      "Every big change starts somewhere."
  Task completed   "Nice work. One step forward."
  Missed habit     "You can start again whenever you're ready."
  Empty notes      "Save an idea before it slips away."
  Goal progress    "You're making progress, one milestone at a time."

Hindari copy seperti: - "You failed." - "You broke your streak." - "You
are falling behind."

------------------------------------------------------------------------

## 13. Design Tokens untuk Implementasi

Contoh token awal untuk TypeScript:

``` ts
export const colors = {
  cream: "#F7F5EF",
  paper: "#FFFEFA",
  sage: "#A8B9A0",
  forest: "#526B56",
  beige: "#E8E1D5",
  charcoal: "#333831",
  muted: "#7C8379",
  line: "#E8E4DA",
  paleSage: "#EEF1E9",
  success: "#426B50",
  warning: "#9A6B32",
  error: "#A34F49",
  info: "#526B75",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};
```

Nilai token merupakan baseline. Sesuaikan setelah pengujian visual pada
perangkat Android dan iOS.

------------------------------------------------------------------------

## 14. Design QA Checklist

Sebelum sebuah layar dinyatakan siap:

### Visual

-   [ ] Warna sesuai token.
-   [ ] Typography konsisten.
-   [ ] Spacing dan alignment rapi.
-   [ ] Tidak ada teks terpotong.
-   [ ] Empty state tersedia.
-   [ ] Surface dan border konsisten.

### Interaction

-   [ ] Semua tombol memiliki aksi yang jelas.
-   [ ] Pressed dan disabled states tersedia.
-   [ ] Form memiliki validasi.
-   [ ] Modal dapat ditutup dengan benar.
-   [ ] Back navigation berfungsi.
-   [ ] Feedback setelah aksi tersedia.

### Accessibility

-   [ ] Label screen reader tersedia.
-   [ ] Kontras diperiksa.
-   [ ] Font scaling diuji.
-   [ ] Touch target diuji.

### Device

-   [ ] Android layar kecil.
-   [ ] Android layar besar.
-   [ ] Android dengan system font besar.
-   [ ] iOS dengan safe area.
-   [ ] Keyboard tidak menutupi input atau CTA.

------------------------------------------------------------------------

## 15. Open Design Decisions

Keputusan berikut perlu diuji sebelum design system dianggap final:

1.  Apakah dashboard menampilkan habit summary atau cukup daily tasks
    dan goals?
2.  Apakah pengguna dapat memilih warna aksen sendiri?
3.  Apakah dark mode termasuk rilis awal atau fase berikutnya?
4.  Apakah notes dan journal menggunakan editor yang sama?
5.  Apakah calendar memakai month view saja atau juga agenda/week view?
6.  Apakah goal detail menampilkan task langsung atau melalui bagian
    terpisah?

Rekomendasi awal: - Dashboard menampilkan habit summary ringkas. - Warna
aksen dikunci untuk MVP. - Light mode menjadi default; dark mode setelah
MVP. - Notes dan journal berbagi komponen editor, tetapi tetap terpisah
secara navigasi. - Calendar dimulai dari month view dan selected-day
agenda. - Goal detail menampilkan milestone dan related tasks dalam satu
halaman.

------------------------------------------------------------------------

## 16. Definition of Design Ready

Desain dinyatakan siap untuk handoff ketika: - Semua layar MVP memiliki
spesifikasi. - Komponen utama memiliki states. - Design tokens
terdokumentasi. - User flows utama dapat diikuti tanpa kebingungan. -
Empty, error, loading, dan success states ditentukan. - Responsive
behavior ditentukan. - Accessibility checklist telah ditinjau. - Tidak
ada keputusan visual kritis yang belum disepakati.

**Dokumen ini menjadi acuan visual dan interaksi untuk implementasi
Level Up Planner.** Perubahan desain harus memperbarui token, komponen,
dan screen specification terkait agar tetap konsisten.
