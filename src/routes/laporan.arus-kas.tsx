import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { ReportFilter, useDefaultFilter } from "@/components/report-filter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCashFlow } from "@/lib/reports.functions";
import { formatIDR } from "@/lib/format";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export const Route = createFileRoute("/laporan/arus-kas")({
  head: () => ({ meta: [{ title: "Laporan Arus Kas — ERP BUMDes" }] }),
  component: () => <Protected><ArusKasPage /></Protected>,
});

function ArusKasPage() {
  const def = useDefaultFilter();
  const [filter, setFilter] = useState(def);
  const fn = useServerFn(getCashFlow);
  const { data, isLoading } = useQuery({ queryKey: ["cf", filter], queryFn: () => fn({ data: filter }) });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Laporan Arus Kas</h2>
        <p className="text-sm text-muted-foreground">Periode {filter.start_date} s/d {filter.end_date}</p>
      </div>
      <ReportFilter value={filter} onChange={setFilter} />
      {isLoading || !data ? (
        <div className="text-center text-muted-foreground py-10">Memuat…</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-success"><ArrowDownCircle className="h-5 w-5" /><span className="text-xs uppercase font-semibold tracking-wider">Kas Masuk</span></div>
            <div className="mt-3 font-display text-2xl font-bold">{formatIDR(data.masuk)}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-destructive"><ArrowUpCircle className="h-5 w-5" /><span className="text-xs uppercase font-semibold tracking-wider">Kas Keluar</span></div>
            <div className="mt-3 font-display text-2xl font-bold">{formatIDR(data.keluar)}</div>
          </div>
          <div className={`rounded-lg border p-6 ${data.net >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
            <div className="flex items-center gap-2"><Wallet className="h-5 w-5" /><span className="text-xs uppercase font-semibold tracking-wider">Arus Kas Bersih</span></div>
            <div className="mt-3 font-display text-2xl font-bold">{formatIDR(data.net)}</div>
            <div className="text-xs text-muted-foreground mt-1">{data.transaksi} mutasi kas</div>
          </div>
        </div>
      )}
    </div>
  );
}
