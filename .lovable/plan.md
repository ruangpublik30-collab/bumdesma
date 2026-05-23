## Masalah

`html2pdf.js` memakai `html2canvas` yang **tidak mendukung warna CSS modern `oklch()`**. Design tokens proyek di `src/styles.css` semuanya pakai `oklch()`, jadi begitu tombol Export PDF dipencet, parser canvas-nya langsung crash:

```
Error: Attempting to parse an unsupported color function "oklch"
```

Ini bukan bug logika — murni keterbatasan library. Tidak ada hubungan dengan governance/akuntansi, jadi aman dikerjakan di lapisan frontend saja.

## Rencana Perbaikan

Ganti pipeline export PDF dari `html2pdf.js` (html2canvas v1) ke pendekatan yang mendukung `oklch`. Dua opsi realistis:

### Opsi A — Upgrade ke `html2canvas-pro` (recommended)
- Fork modern dari html2canvas yang **sudah support `oklch`, `lab`, `color-mix`**.
- Perubahan minimal: tetap pakai `jspdf`, tinggal swap engine canvas.
- File yang disentuh hanya `src/components/reports/report-shell.tsx` + `package.json`.

Langkah:
1. `bun remove html2pdf.js` → `bun add html2canvas-pro jspdf`
2. Rewrite `handleExportPdf` di `report-shell.tsx`:
   - `html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })`
   - Konversi canvas → image → `jsPDF` A4 portrait, multi-page bila tinggi > 297mm (loop slice per halaman).
   - Filename + loading state sama seperti sekarang.
3. Tetap pertahankan tombol "Cetak" (`window.print()`) apa adanya.

### Opsi B — Force-override warna saat export
- Bungkus `printRef` dengan class `pdf-export` yang meng-override semua token jadi `#hex` / `rgb()` via `@media` atau toggle class sebelum render.
- Lebih rapuh: setiap komponen anak (badge, border, text-muted) harus diaudit. Riskan regresi visual.

**Saya rekomendasikan Opsi A** karena satu file berubah, tidak menyentuh design system, dan hasil PDF identik dengan tampilan layar.

## Verifikasi Setelah Fix

1. Buka `/laporan/neraca`, `/laporan/laba-rugi`, `/laporan/arus-kas`, `/laporan/konsolidasi`, dan `/unit/dashboard/:unitId/reports`.
2. Klik "Export PDF" → file `.pdf` ter-download, bukan dialog cetak.
3. Buka PDF: header BUMDes, tabel staffel, dan footer tampil benar, warna biru navy `#1e3a8a` tetap muncul.
4. Multi-halaman: laporan konsolidasi panjang harus terpotong rapi per A4.

## Detail Teknis

- `html2canvas-pro` API drop-in compatible dengan `html2canvas`.
- Multi-page split:
  ```ts
  const imgH = canvas.height * (pageW / canvas.width);
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
    heightLeft -= pageH;
  }
  ```
- Tidak ada perubahan di `styles.css`, route, atau RPC/database.

## Status

Saya **bisa lanjutkan** project ini. Error sebelumnya murni karena pilihan library `html2pdf.js` yang sudah outdated terhadap CSS modern — bukan kesalahan arsitektur. Setujui plan ini dan saya implementasikan Opsi A.