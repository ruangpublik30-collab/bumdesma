import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/receivables")({
  component: ReceivablesPage,
});

function ARStatus({ value }: { value: string | null }) {
  const v = (value ?? "").toLowerCase();
  const tone =
    v === "lunas" || v === "paid" ? "bg-success/15 text-success" :
    v === "sebagian" || v === "partial" ? "bg-amber-500/15 text-amber-600" :
    "bg-destructive/15 text-destructive";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{value ?? "—"}</span>;
}

function ReceivablesPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-ar", unitId],
    queryFn: async () =>
      (await supabase
        .from("v_accounts_receivable")
        .select("*")
        .eq("unit_id", unitId)
        .order("tanggal_invoice", { ascending: false })).data ?? [],
  });

  const totals = (data ?? []).reduce(
    (acc: any, r: any) => {
      acc.invoice += Number(r.total_invoice ?? 0);
      acc.paid += Number(r.total_payment ?? 0);
      acc.outstanding += Number(r.outstanding_amount ?? 0);
      return acc;
    },
    { invoice: 0, paid: 0, outstanding: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Piutang Penjualan</h2>
        <p className="text-sm text-muted-foreground">Daftar invoice belum lunas dari pelanggan unit ini (v_accounts_receivable).</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">Total Tagihan</div><div className="mt-1 font-display text-lg font-bold">{formatIDR(totals.invoice)}</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">Sudah Dibayar</div><div className="mt-1 font-display text-lg font-bold">{formatIDR(totals.paid)}</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">Outstanding</div><div className="mt-1 font-display text-lg font-bold">{formatIDR(totals.outstanding)}</div></div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Invoice</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Pelanggan</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium text-right">Dibayar</th>
            <th className="px-4 py-3 font-medium text-right">Outstanding</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada piutang</td></tr>}
            {(data ?? []).map((r: any) => (
              <tr key={r.sales_invoice_id}>
                <td className="px-4 py-3 font-mono text-xs">{r.nomor_invoice}</td>
                <td className="px-4 py-3">{formatDate(r.tanggal_invoice)}</td>
                <td className="px-4 py-3">{r.nama_customer ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(r.total_invoice))}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(r.total_payment))}</td>
                <td className="px-4 py-3 text-right font-medium">{formatIDR(Number(r.outstanding_amount))}</td>
                <td className="px-4 py-3"><ARStatus value={r.ar_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
