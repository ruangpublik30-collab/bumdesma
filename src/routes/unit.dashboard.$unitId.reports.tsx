import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";
import { ReportShell } from "@/components/reports/report-shell";
import { NeracaStaffel, BSRow } from "@/components/reports/neraca-staffel";

export const Route = createFileRoute("/unit/dashboard/$unitId/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { unitId } = Route.useParams();

  const { data } = useQuery({
    queryKey: ["unit-reports", unitId],
    queryFn: async () => {
      const [pnl, bs, tb, unit] = await Promise.all([
        supabase.from("v_income_statement_summary").select("*").eq("unit_id", unitId).maybeSingle(),
        supabase.from("v_balance_sheet").select("*").eq("unit_id", unitId).order("account_code"),
        supabase.from("v_trial_balance").select("*").eq("unit_id", unitId).order("account_code"),
        supabase
          .from("business_units")
          .select("nama_unit, tenant:tenants(nama_bumdes, nama_desa, nama_kecamatan)")
          .eq("id", unitId)
          .maybeSingle(),
      ]);
      return {
        pnl: pnl.data as any,
        bsRows: (bs.data ?? []) as BSRow[],
        tb: (tb.data ?? []) as any[],
        unit: unit.data as any,
      };
    },
  });

  const pnl = data?.pnl;
  const unit = data?.unit;
  const bumdes = {
    nama_bumdes: unit?.tenant?.nama_bumdes,
    nama_desa: unit?.tenant?.nama_desa,
    nama_kecamatan: unit?.tenant?.nama_kecamatan,
    nama_unit: unit?.nama_unit,
  };
  const today = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h2 className="font-display text-2xl font-bold">Laporan Unit</h2>
        <p className="text-sm text-muted-foreground">
          Template laporan resmi BUMDes — siap cetak / export PDF (A4).
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 no-print">
        <Card title="Pendapatan" value={formatIDR(Number(pnl?.total_pendapatan ?? 0))} />
        <Card title="Beban" value={formatIDR(Number(pnl?.total_beban ?? 0))} />
        <Card title="Laba Bersih" value={formatIDR(Number(pnl?.laba_bersih ?? 0))} highlight />
      </div>

      <ReportShell
        title="Laporan Neraca"
        subtitle="Bentuk Staffel"
        bumdes={bumdes}
        periodLabel={`Per tanggal ${today}`}
      >
        <NeracaStaffel
          rows={data?.bsRows ?? []}
          labaBerjalan={Number(pnl?.laba_bersih ?? 0)}
        />
      </ReportShell>

      <div className="no-print">
        <h3 className="font-display text-lg font-semibold mb-2">Neraca Saldo</h3>
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary"><tr className="text-left">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama Akun</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium text-right">Debit</th>
              <th className="px-4 py-3 font-medium text-right">Kredit</th>
              <th className="px-4 py-3 font-medium text-right">Saldo</th>
            </tr></thead>
            <tbody className="divide-y">
              {(data?.tb ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada saldo</td></tr>}
              {(data?.tb ?? []).map((r: any) => (
                <tr key={r.account_id}>
                  <td className="px-4 py-3 font-mono text-xs">{r.account_code}</td>
                  <td className="px-4 py-3">{r.account_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.account_type}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatIDR(Number(r.total_debit))}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatIDR(Number(r.total_credit))}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatIDR(Number(r.saldo_normal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 ${highlight ? "bg-accent text-accent-foreground" : "bg-card"}`}>
      <div className="text-xs uppercase tracking-wider opacity-70">{title}</div>
      <div className="mt-2 font-display text-xl font-bold">{value}</div>
    </div>
  );
}
