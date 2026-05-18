# Refaktor Multi-Tenant: Platform Super Admin + Pendaftaran BUMDes

Mengubah sistem dari single-BUMDes menjadi platform multi-tenant. Setiap BUMDes mendaftar lewat form publik, ditinjau oleh Super Admin Platform, dan setelah disetujui mendapat akun login Direktur BUMDes beserta workspace tenant tersendiri. Logika unit usaha berbasis template + auto-provisioning COA dipertahankan, hanya ditambahkan dimensi `tenant_id`.

## Arsitektur Baru

```text
Super Admin Platform  ──▶ kelola semua tenant + approve pendaftaran
       │
       ▼
   Tenant (BUMDes)  ──▶ Direktur / Admin BUMDes
       │
       ▼
   Business Unit  ──▶ Manager Unit (akses 1 unit)
       │
       ▼
   COA → Jurnal → Laporan
```

## Reset Data

Sesuai pilihan, semua data lama dihapus (drop tables: business_units, chart_of_accounts, journals, journal_items, user_roles, unit_templates, coa_template_unit, coa_template_global, plus enum lama). Schema dibangun ulang dari nol mengikuti arsitektur baru. Template unit dan global COA di-seed ulang setelah migrasi.

## Skema Database

Tabel baru / dirombak:

- `tenants` — data BUMDes (nama, kode auto `BUM-0001`, desa, kecamatan, status: pending/active/suspended).
- `tenant_registrations` — submission form publik. Bisa diisi anon. Status: pending/approved/rejected.
- `business_units` — ditambah `tenant_id` (NOT NULL, FK cascade). Unique `(tenant_id, kode_unit)`. Tetap punya `template_id`.
- `unit_templates` — tetap (template Dagang, Simpan Pinjam, dst). Global, dipakai semua tenant.
- `coa_template_global`, `coa_template_unit` — tetap, jadi sumber auto-provisioning COA per unit baru.
- `chart_of_accounts` — tetap (per unit_id). Tenant_id diturunkan via unit.
- `journals`, `journal_items` — tetap (per unit_id).
- `profiles` — baru, simpan `full_name`, `phone`, `default_tenant_id`.
- `user_roles` — dirombak: `(user_id, role, tenant_id?, unit_id?)`. Enum role baru: `super_admin_platform`, `direktur_bumdes`, `admin_bumdes`, `manager_unit`.

Enum: `tenant_status`, `registration_status`, `app_role` (4 role di atas).

Security definer functions:
- `is_super_admin_platform(uid)`
- `is_tenant_member(uid, tenant_id)`
- `can_manage_tenant(uid, tenant_id)` — direktur/admin BUMDes atau super admin platform
- `can_access_unit(uid, unit_id)` — diturunkan via join unit→tenant→roles
- `has_role(uid, role)`

RLS:
- `tenant_registrations`: INSERT terbuka untuk anon (form publik). SELECT/UPDATE hanya super admin platform.
- `tenants`: super admin platform full akses. Member tenant: SELECT tenant sendiri.
- `business_units` & `chart_of_accounts` & `journals` & `journal_items`: super admin platform full, member tenant SELECT, direktur/admin BUMDes manage units & COA, anggota unit CRUD jurnal sesuai akses unit.
- `profiles`: user lihat/edit milik sendiri, super admin platform lihat semua.
- `user_roles`: user lihat role sendiri, super admin platform manage. Direktur BUMDes bisa manage role manager_unit di tenant-nya.

Trigger:
- `handle_new_user` di `auth.users`: auto-insert profiles. Bootstrap: jika belum ada `super_admin_platform`, user pertama yang signup otomatis jadi platform admin.
- `provision_unit_coa` di `business_units` AFTER INSERT: tetap, generate COA dari template (global + per template_id).
- `set_updated_at` di tenants/profiles.

RPC (security definer, dipanggil dari server function):
- `approve_tenant_registration(reg_id)` → buat tenant, generate kode `BUM-XXXX`, return tenant_id. Akun direktur dibuat di server function (bukan di RPC) karena perlu auth.admin.
- `reject_tenant_registration(reg_id, reason)`.

## Server Functions (`createServerFn`)

`src/lib/registrations.functions.ts` (baru):
- `submitRegistration` — anon-friendly (tanpa middleware auth). Insert ke `tenant_registrations`. Validasi Zod.
- `listRegistrations` — super admin platform: list pending/approved/rejected.
- `approveRegistration({ registration_id })` — middleware requireSupabaseAuth + cek super admin platform:
  1. Generate password random (16 char).
  2. `supabaseAdmin.auth.admin.createUser` dengan email_akses + password + email_confirm.
  3. Panggil RPC `approve_tenant_registration` → dapat tenant_id + kode.
  4. Insert role `direktur_bumdes` (user_id, tenant_id).
  5. Update profiles.default_tenant_id.
  6. Update registration set tenant_id + reviewed_by.
  7. Return `{ email, password, kode_bumdes, nama_bumdes }` — UI tampilkan SEKALI (modal, dengan tombol copy & warning).
- `rejectRegistration({ registration_id, reason })`.

`src/lib/units.functions.ts` (refaktor):
- `createBusinessUnit` — sekarang per tenant. Cek caller adalah direktur/admin BUMDes di tenant tsb (atau super admin platform). Tidak lagi membuat user auth — manager_unit ditambah lewat flow terpisah.
- `inviteUnitManager({ tenant_id, unit_id, email, password })` — direktur BUMDes/super admin platform: createUser + role manager_unit.

`src/lib/reports.functions.ts` (refaktor):
- Semua report filter berdasarkan `tenant_id` dari konteks user (atau dipilih super admin platform).
- "Konsolidasi" = konsolidasi semua unit dalam 1 tenant. Super admin platform bisa lihat per tenant.

## Routing (TanStack)

Layout baru:
- `src/routes/_platform.tsx` — layout super admin platform (sidebar: Pendaftaran, Daftar BUMDes, Pengaturan).
- `src/routes/_tenant.tsx` — layout BUMDes (sidebar: Dashboard, Unit, Jurnal, Laporan).

Route baru / diubah:
- `src/routes/index.tsx` — landing publik dengan CTA "Daftarkan BUMDes" + "Masuk".
- `src/routes/daftar.tsx` — form publik pendaftaran (sesuai gambar 1). Submit ke `submitRegistration`. Tampilkan halaman sukses "Pendaftaran Anda sedang ditinjau".
- `src/routes/login.tsx` — login universal. Setelah login redirect berdasar role:
  - `super_admin_platform` → `/platform/pendaftaran`
  - lainnya → `/dashboard` (tenant)
- `src/routes/_platform/pendaftaran.tsx` — list registrations (gambar 2). Tab: Pending / Approved / Rejected. Aksi Approve → tampilkan modal kredensial. Reject → form alasan.
- `src/routes/_platform/bumdes.tsx` — list tenant aktif, status, jumlah unit.
- `src/routes/_tenant/dashboard.tsx` — pindahan dari `/dashboard`.
- `src/routes/_tenant/units.tsx` — pindahan, scoped ke tenant.
- `src/routes/_tenant/jurnal.tsx` — pindahan.
- `src/routes/_tenant/laporan.*.tsx` — pindahan.

`Protected` component diupdate: prop `require: "platform" | "tenant_admin" | "tenant_member"`. `auth-context` expose: `roles`, `isPlatformAdmin`, `tenantId`, `tenantRoles`, `currentTenant`.

## UI/UX Penting

Halaman pendaftaran (`/daftar`) mengikuti layout gambar 1: card formal, field wajib bertanda `*`, tombol "Kirim Pendaftaran" lebar penuh, link "← Kembali" ke landing.

Halaman approval (`/platform/pendaftaran`) mengikuti gambar 2: tabel/list registration dengan badge status, tombol "Setujui" & "Tolak". Modal hasil approve menampilkan:
- Nama BUMDes + kode BUM-XXXX
- Email login direktur
- Password sementara (tombol copy)
- Peringatan: "Salin sekarang — password tidak akan ditampilkan lagi"

## Bootstrap Super Admin Platform

User pertama yang signup di `/login` (mode register) otomatis dapat role `super_admin_platform` via trigger `handle_new_user` (cek `NOT EXISTS (SELECT 1 FROM user_roles WHERE role='super_admin_platform')`). Signup berikutnya = user biasa tanpa role (harus diundang via approve registration atau invite manager_unit).

## Catatan Teknis

- Semua relasi pakai UUID, FK on delete cascade (tenant → unit → coa/journals).
- `kode_bumdes` digenerate di RPC `approve_tenant_registration` (sequence sederhana `BUM-` + 4 digit).
- `supabase--migration` digunakan untuk drop + recreate schema, RLS, trigger, RPC.
- Setelah migrasi disetujui: seed ulang `unit_templates` + `coa_template_global` + `coa_template_unit` lewat `supabase--insert`.
- `attachSupabaseAuth` di `start.ts` tetap (sudah ada).
- Tidak ada perubahan ke `client.ts`, `client.server.ts`, `auth-middleware.ts`, `types.ts` (auto-generated setelah migrasi).

## Urutan Eksekusi (setelah plan disetujui)

1. Migrasi DB: drop schema lama, buat enum + tabel + RPC + trigger + RLS baru.
2. Seed `unit_templates`, `coa_template_global`, `coa_template_unit`.
3. Refaktor `auth-context` + `Protected`.
4. Tulis server functions (`registrations.functions.ts`, refaktor `units.functions.ts`, `reports.functions.ts`).
5. Buat route publik `/daftar` + update `/login` + landing.
6. Buat layout `_platform` + halaman pendaftaran & daftar BUMDes (dengan modal kredensial).
7. Pindahkan halaman tenant ke `_tenant` layout.
8. Verifikasi: register super admin → submit pendaftaran dari /daftar → approve → login sebagai direktur → tambah unit → input jurnal → lihat laporan.
