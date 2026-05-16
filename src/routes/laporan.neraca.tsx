import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { ReportFilter, useDefaultFilter } from "@/components/report-filter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBalanceSheet } from "@/lib/reports.functions";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/laporan/neraca")({
  head: () => ({ meta: [{ title: "Laporan Neraca — ERP BUMDes" }] }),
  component: () => <Protected><NeracaPage /></Protected>,
});

function Group({ title, rows }: { title: string; rows: any[] }) {
  return (
    <div className="mb-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</div>
      {rows.length === 0 && <div className="text-sm text-muted-foreground py-1">—</div>}
      {rows.map((r) => (
        <div key={r.account_id} className="flex justify-between py-1 text-sm border-b">
          <span><span className="font-mono text-xs text-muted-foreground mr-2">{r.kode}</span>{r.nama}</span>
          <span>{formatIDR(r.saldo)}</span>
        </div>
      ))}
    </div>
  );
}

function NeracaPage() {
  const def = useDefaultFilter();
  const [filter, setFilter] = useState(def);
  const fn = useServerFn(getBalanceSheet);
  const { data, isLoading } = useQuery({
    queryKey: ["bs", filter],
    queryFn: () => fn({ data: filter }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Laporan Neraca</h2>
        <p className="text-sm text-muted-foreground">Per tanggal {filter.end_date}</p>
      </div>
      <ReportFilter value={filter} onChange={setFilter} />
      {isLoading || !data ? (
        <div className="text-center text-muted-foreground py-10">Memuat…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-display font-semibold mb-3">AKTIVA</h3>
            <Group title="Aset" rows={data.aset} />
            <div className="flex justify-between py-3 mt-2 px-3 rounded bg-primary/10 font-semibold">
              <span>Total Aktiva</span><span>{formatIDR(data.totalAset)}</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-display font-semibold mb-3">PASIVA</h3>
            <Group title="Kewajiban" rows={data.kewajiban} />
            <Group title="Ekuitas" rows={data.ekuitas} />
            <div className="flex justify-between py-1 text-sm border-b">
              <span>Laba (Rugi) Berjalan</span>
              <span>{formatIDR(data.labaBerjalan)}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 px-3 rounded bg-primary/10 font-semibold">
              <span>Total Pasiva</span><span>{formatIDR(data.totalPasiva)}</span>
            </div>
            {Math.abs(data.totalAset - data.totalPasiva) > 0.5 && (
              <p className="mt-3 text-xs text-warning">⚠ Aktiva dan Pasiva belum seimbang — periksa kembali jurnal Anda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
