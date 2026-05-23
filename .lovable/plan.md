## Tujuan
Membersihkan seluruh sisa desain lama (navy + marun + emas) yang masih muncul setelah login, dan menyelaraskan seluruh sistem ke palet baru: **putih · hijau (#16A34A) · biru (#2563EB) · oranye (#F97316)** dengan layout responsif (sidebar fixed + hamburger drawer di mobile) — sama persis seperti UnitShell.

Logika bisnis, query database, RPC, dan struktur data **tidak diubah sama sekali**. Semua pekerjaan murni di lapisan presentasi.

---

## 1. Ganti token palet global (`src/styles.css`)

Tulis ulang `:root` dan `.dark` agar:
- `--background` = putih lembut, `--foreground` = abu gelap (#111827)
- `--primary` = hijau #16A34A, `--primary-foreground` = putih
- `--accent` = oranye #F97316
- `--secondary` = biru #2563EB (untuk badge/ikon info)
- `--success` = hijau, `--warning` = oranye, `--destructive` = merah netral
- `--sidebar` = putih kehijauan (#F4FBF6), `--sidebar-foreground` = abu gelap, `--sidebar-primary` = hijau #16A34A, `--sidebar-primary-foreground` = putih, `--sidebar-accent` = hijau muda (#EAF7EE)
- `--border` = #E5E7EB, `--input` = #E5E7EB, `--ring` = hijau
- Radius default dinaikkan ke `0.75rem`

Ini sekaligus menyelesaikan masalah "warna navy" di semua komponen lama tanpa harus menyentuh tiap file.

Blok `@media print` dipertahankan persis seperti sekarang.

## 2. Tulis ulang `src/components/app-shell.tsx` (shell Direktur/Platform)

Pola dibuat **identik dengan `UnitShell`**:
- `aside` desktop `hidden md:flex fixed inset-y-0 left-0 z-40 w-[260px]`
- Drawer mobile pakai `Sheet` dari `@/components/ui/sheet` + tombol hamburger di topbar
- Topbar `fixed top-0 right-0 left-0 md:left-[260px] z-30 h-[72px]` dengan judul halaman aktif + email user di kanan
- Konten utama `md:ml-[260px] pt-[72px]` + padding responsif `p-4 md:p-6 lg:p-8`
- Item nav aktif: `bg-[#16A34A] text-white`; non-aktif: `text-[#1F2937] hover:bg-[#EAF7EE]`
- Brand block sama: kotak hijau + huruf B, nama "ERP BUMDes" / "Admin Platform", subtitle nama BUMDes
- Footer sidebar: email + role + tombol "Keluar" hijau
- Tetap baca `isPlatformAdmin / isTenantAdmin` dari `useAuth` untuk memilih `navPlatform / navTenantAdmin / navUnit` — daftar menu tidak berubah

Tidak ada perubahan rute atau perilaku navigasi.

## 3. Login page (`src/routes/login.tsx`)

Panel kiri navy diganti:
- Background `bg-[#F4FBF6]` dengan ilustrasi blok hijau muda + aksen oranye
- Heading & body teks pakai `text-[#111827]` / `text-[#6B7280]`
- Tombol `Masuk` pakai `bg-[#16A34A] hover:bg-[#15803D]`
- Link "Daftarkan BUMDes" pakai underline biru #2563EB

Tidak mengubah logika `signInWithPassword`, `routeAfterLogin`, atau `refreshRoles`.

## 4. Landing (`src/routes/index.tsx`)

- Header: logo kotak hijau, tombol "Masuk" outline hijau, tombol "Daftarkan BUMDes" solid hijau
- Hero: badge biru muda, judul dengan span hijau, tombol CTA hijau & outline
- Kartu fitur: `rounded-2xl border-[#E5E7EB] bg-white shadow-sm` dengan ikon di kotak hijau/biru/oranye

## 5. Halaman dalam Direktur (penyelarasan ringan, tanpa ubah data)

File: `dashboard.tsx`, `units.tsx`, `master-data.tsx`, `penjualan.tsx`, `pembelian.tsx`, `jurnal.tsx`, `laporan.laba-rugi.tsx`, `laporan.neraca.tsx`, `laporan.arus-kas.tsx`, `laporan.konsolidasi.tsx`, `platform.pendaftaran.tsx`, `platform.bumdes.tsx`.

Penyesuaian seragam di tiap file (search-replace minor, tanpa mengubah query):
- Kartu/section: `rounded-lg border bg-card` → `rounded-2xl border border-[#E5E7EB] bg-white shadow-sm`
- Tabel: bungkus `overflow-x-auto` + `min-w-[720px]` agar responsif di mobile (sama seperti modul unit)
- Tombol utama: pastikan pakai varian `default` (akan otomatis hijau lewat token baru) — tidak perlu kelas warna eksplisit
- Judul halaman: `font-display text-[22px] md:text-[24px] font-bold text-[#111827]`
- Subtitle: `text-[14px] text-[#6B7280]`

Tidak ada perubahan kolom, filter, RPC, atau urutan data.

## 6. QA

- Buka `/login`, `/`, `/dashboard`, `/units`, `/jurnal`, `/laporan/neraca`, `/platform/pendaftaran` di viewport 390px dan 1280px
- Pastikan: tidak ada lagi blok navy/marun/emas, sidebar di mobile sembunyi & muncul lewat hamburger, topbar fixed, tabel scroll horizontal di mobile
- Pastikan halaman cetak (`print-area`) tetap rapi karena blok `@media print` tidak diubah

---

## Catatan kepatuhan
- Tidak ada perubahan skema database, RLS, RPC, edge function, atau file di `supabase/`
- Tidak ada perubahan pada `src/lib/unit-actions.ts`, `src/lib/*.functions.ts`, `src/integrations/supabase/*`
- Komponen `ReportShell` & `NeracaStaffel` tidak disentuh — hanya akan ikut palet baru lewat token
