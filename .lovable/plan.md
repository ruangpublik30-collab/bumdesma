# Rencana Verifikasi Responsive — Semua Role & Breakpoint

Tujuan: memastikan tidak ada horizontal overflow saat sidebar fixed aktif, di semua role dan ukuran layar.

## Breakpoint yang diuji

| Label | Ukuran | Sidebar |
|---|---|---|
| Mobile S | 320×568 | drawer (hidden) |
| Mobile M | 375×812 | drawer |
| Mobile L | 414×896 | drawer |
| Tablet | 768×1024 | drawer |
| Laptop | 1280×720 | fixed 260px |
| Desktop | 1536×864 | fixed 260px |
| Desktop XL | 1920×1080 | fixed 260px |

## Role & halaman yang diuji

**Platform / Super Admin**
- `/platform/dashboard`
- `/platform/bumdes` (registrasi + daftar)
- `/platform/users`, `/platform/governance`

**Direktur / Admin BUMDes**
- `/dashboard`
- `/units`
- `/master-data`, `/jurnal`, `/penjualan`, `/pembelian`

**Manager Unit** (`/unit/dashboard/:unitId/...`)
- `index`, `sales`, `purchases`, `inventory`, `customers`, `suppliers`, `cash-bank`

## Yang diperiksa di setiap kombinasi

1. **Horizontal scroll**: `document.documentElement.scrollWidth === clientWidth` (tidak boleh ada scroll horizontal di `<html>` maupun `<main>`).
2. **Sidebar fixed**: di ≥1024px sidebar menempel kiri, konten utama tidak tertimpa (margin kiri 260px diterapkan).
3. **Topbar fixed**: tetap di atas, tidak menutupi konten (padding-top 88px).
4. **Action button header**: tombol eksekusi (Tambah / Penjualan Cepat / dsb.) terlihat penuh, tidak terpotong di kanan.
5. **Card & tabel**: tabel scroll internal (`overflow-x-auto`), tidak memaksa parent melebar. Warna hijau tipis konsisten (tidak ada biru tersisa).
6. **Mobile drawer**: hamburger membuka/menutup, overlay menutup saat klik di luar, tidak mengunci scroll body permanen.
7. **Typography & spacing**: tidak ada teks terpotong, tidak ada padding negatif yang bikin overflow.

## Metodologi

Untuk tiap kombinasi role × breakpoint:

1. `browser--navigate_to_sandbox` ke route dengan viewport target.
2. `browser--screenshot` untuk inspeksi visual (header + body).
3. `browser--act` jalankan snippet pengukuran via console — record `scrollWidth`, `clientWidth`, dan posisi tombol header (`getBoundingClientRect().right` vs `window.innerWidth`).
4. Catat status: OK / Overflow / Button clipped / Sidebar overlap.

## Output

Laporan tabel ringkas per role × breakpoint dengan kolom: Overflow, Sidebar OK, Topbar OK, Button OK, Catatan. Jika ditemukan masalah, sertakan screenshot crop sebagai bukti dan rekomendasi perbaikan (CSS class spesifik) — tanpa langsung mengubah kode di mode plan.

## Asumsi & catatan

- Login diperlukan untuk role-protected route. Jika preview belum login, saya akan minta user login dulu sebelum melanjutkan route privat.
- Saya tidak memodifikasi kode pada fase verifikasi ini. Setelah laporan selesai, perbaikan dibuat dalam plan terpisah.
