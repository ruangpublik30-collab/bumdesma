import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfitLoss, getBalanceSheet } from "@/lib/reports.functions";
import { formatIDR } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/laporan/konsolidasi")({
  head: () => ({ meta: [{ title: "Konsolidasi BUMDes — ERP BUMDes" }] }),
  component: () => <Protected requireSuper><KonsolidasiPage /></Protected>,
});

function KonsolidasiPage() {
  const today = new Date();
  const [start, setStart] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [end, setEnd] = useState(today.toISOString().slice(0, 10));

  const pl = useServerFn(getProfitLoss);
  const bs = useServerFn(getBalanceSheet);

  const filter = { unit_id: null, start_date: start, end_date: end };
  const { data: plData } = useQuery({ queryKey: ["pl-kons", filter], queryFn: () => pl({ data: filter }) });
  const { data: bsData } = useQuery({ queryKey: ["bs-kons", filter], queryFn: () => bs({ data: filter }) });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Konsolidasi BUMDes</h2>
        <p className="text-sm text-muted-foreground">Gabungan seluruh unit usaha</p>
      </div>
      <div className="rounded-lg border bg-card p-4 flex items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Mulai</Label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Akhir</Label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-display font-semibold">Laba Rugi Konsolidasi</h3>
          {plData && (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Pendapatan</dt><dd>{formatIDR(plData.totalPendapatan)}</dd></div>
              <div className="flex justify-between"><dt>HPP</dt><dd>{formatIDR(plData.totalHpp)}</dd></div>
              <div className="flex justify-between font-medium border-t pt-2"><dt>Laba Kotor</dt><dd>{formatIDR(plData.labaKotor)}</dd></div>
              <div className="flex justify-between"><dt>Beban Operasional</dt><dd>{formatIDR(plData.totalBeban)}</dd></div>
              <div className={`flex justify-between font-display text-lg font-bold mt-2 px-3 py-2 rounded ${plData.labaBersih >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                <dt>Laba Bersih BUMDes</dt><dd>{formatIDR(plData.labaBersih)}</dd>
              </div>
            </dl>
          )}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-display font-semibold">Posisi Keuangan</h3>
          {bsData && (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Total Aktiva</dt><dd>{formatIDR(bsData.totalAset)}</dd></div>
              <div className="flex justify-between"><dt>Total Kewajiban</dt><dd>{formatIDR(bsData.totalKewajiban)}</dd></div>
              <div className="flex justify-between"><dt>Total Ekuitas</dt><dd>{formatIDR(bsData.totalEkuitas)}</dd></div>
              <div className="flex justify-between border-t pt-2 font-medium"><dt>Total Pasiva</dt><dd>{formatIDR(bsData.totalPasiva)}</dd></div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
