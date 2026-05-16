import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { ReportFilter, useDefaultFilter } from "@/components/report-filter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfitLoss } from "@/lib/reports.functions";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/laporan/laba-rugi")({
  head: () => ({ meta: [{ title: "Laporan Laba Rugi — ERP BUMDes" }] }),
  component: () => <Protected><LabaRugiPage /></Protected>,
});

function Section({ title, rows, total }: { title: string; rows: any[]; total: number }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1">{title}</div>
      {rows.length === 0 && <div className="text-sm text-muted-foreground py-2">—</div>}
      {rows.map((r) => (
        <div key={r.account_id} className="flex justify-between py-1.5 border-b text-sm">
          <span><span className="font-mono text-xs text-muted-foreground mr-2">{r.kode}</span>{r.nama}</span>
          <span className="font-medium">{formatIDR(r.saldo)}</span>
        </div>
      ))}
      <div className="flex justify-between py-2 font-semibold border-t-2 border-foreground/20">
        <span>Total {title}</span><span>{formatIDR(total)}</span>
      </div>
    </div>
  );
}

function LabaRugiPage() {
  const def = useDefaultFilter();
  const [filter, setFilter] = useState(def);
  const fn = useServerFn(getProfitLoss);
  const { data, isLoading } = useQuery({
    queryKey: ["pl", filter],
    queryFn: () => fn({ data: filter }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Laporan Laba Rugi</h2>
        <p className="text-sm text-muted-foreground">Periode {filter.start_date} s/d {filter.end_date}</p>
      </div>
      <ReportFilter value={filter} onChange={setFilter} />
      <div className="rounded-lg border bg-card p-6">
        {isLoading || !data ? <div className="text-center text-muted-foreground py-10">Memuat…</div> : (
          <>
            <Section title="Pendapatan" rows={data.pendapatan} total={data.totalPendapatan} />
            <Section title="Harga Pokok Penjualan (HPP)" rows={data.hpp} total={data.totalHpp} />
            <div className="flex justify-between py-2 font-semibold bg-secondary px-3 my-2 rounded">
              <span>Laba Kotor</span><span>{formatIDR(data.labaKotor)}</span>
            </div>
            <Section title="Beban Operasional" rows={data.beban} total={data.totalBeban} />
            <div className={`flex justify-between py-3 mt-4 px-4 rounded font-display text-lg font-bold ${data.labaBersih >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              <span>Laba (Rugi) Bersih</span><span>{formatIDR(data.labaBersih)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
