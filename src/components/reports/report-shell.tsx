import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

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

/**
 * Template laporan resmi BUMDes — A4, print-to-PDF ready.
 * Reusable untuk Neraca, Laba Rugi, Arus Kas, dll.
 */
export function ReportShell({ title, subtitle, bumdes, periodLabel, children }: Props) {
  const cetakTanggal = formatTanggalID();
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Cetak
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="print-area mx-auto bg-white text-[#1e3a8a] rounded-lg border shadow-sm"
           style={{ maxWidth: "210mm", padding: "16mm 14mm" }}>
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
