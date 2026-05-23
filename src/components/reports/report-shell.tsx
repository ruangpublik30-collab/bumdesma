import { ReactNode, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, Loader2 } from "lucide-react";

interface BumdesInfo {
  nama_bumdes?: string | null;
  nama_desa?: string | null;
  nama_kecamatan?: string | null;
  nama_unit?: string | null;
}

interface Props {
  title: string;
  subtitle?: string;
  bumdes: BumdesInfo;
  periodLabel: string;
  children: ReactNode;
}

const formatTanggalID = () =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Template laporan resmi BUMDes — A4, generate PDF via html2pdf.js.
 * Tombol "Export PDF" mengunduh file .pdf langsung (bukan dialog cetak).
 */
export function ReportShell({ title, subtitle, bumdes, periodLabel, children }: Props) {
  const cetakTanggal = formatTanggalID();
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!printRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;

      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
        heightLeft -= pageH;
      }

      const filename = `${slugify(title)}-${slugify(bumdes.nama_bumdes ?? "bumdes")}-${Date.now()}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("Export PDF gagal:", err);
      alert("Export PDF gagal. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Cetak
        </Button>
        <Button size="sm" onClick={handleExportPdf} disabled={exporting}>
          {exporting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses…</>
          ) : (
            <><Download className="h-4 w-4 mr-2" /> Export PDF</>
          )}
        </Button>
      </div>

      <div
        ref={printRef}
        className="print-area mx-auto bg-white text-[#1e3a8a] rounded-lg border shadow-sm"
        style={{ maxWidth: "210mm", padding: "16mm 14mm" }}
      >
        {/* HEADER — Identitas BUMDes */}
        <div className="border-2 border-[#1e3a8a] rounded-md text-center py-4 px-4 mb-4">
          <div className="text-xs uppercase tracking-widest text-[#1e3a8a]/70">
            BUMDes {bumdes.nama_bumdes ?? "—"}
          </div>
          <div className="text-[11px] text-[#1e3a8a]/70 mt-0.5">
            Desa {bumdes.nama_desa ?? "—"} · Kec. {bumdes.nama_kecamatan ?? "—"}
            {bumdes.nama_unit ? <> · Unit: {bumdes.nama_unit}</> : null}
          </div>
          <h1 className="font-display text-3xl font-extrabold mt-2 text-[#1e3a8a]">
            {title}
          </h1>
          {subtitle && <div className="text-sm text-[#1e3a8a]/80">{subtitle}</div>}
          <div className="text-xs mt-2 text-[#1e3a8a]/70">{periodLabel}</div>
          <div className="text-[10px] mt-1 text-[#1e3a8a]/60">Dicetak: {cetakTanggal}</div>
        </div>

        {children}

        <div className="mt-8 text-[10px] text-[#1e3a8a]/60 text-center border-t pt-2">
          Dokumen dihasilkan otomatis oleh sistem ERP BUMDes — sumber data: engine database.
        </div>
      </div>
    </div>
  );
}
