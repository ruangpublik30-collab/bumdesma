import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/sales")({
  component: SalesPage,
});

function StatusBadge({ value }: { value: string | null }) {
  const v = (value ?? "").toLowerCase();
  const tone =
    v === "paid" || v === "posted" ? "bg-success/15 text-success" :
    v === "partial" ? "bg-amber-500/15 text-amber-600" :
    v === "draft" ? "bg-muted text-muted-foreground" :
    "bg-primary/15 text-primary";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{value ?? "—"}</span>;
}

function SalesPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-sales", unitId],
    queryFn: async () => {
      const { data } = await supabase
        .from("sales_invoices")
        .select("id, nomor_invoice, tanggal_invoice, status, payment_status, customer:customers(nama_customer), lines:sales_invoice_lines(subtotal)")
        .eq("unit_id", unitId)
        .order("tanggal_invoice", { ascending: false })
        .limit(200);
      return (data ?? []).map((inv: any) => ({
        ...inv,
        total: (inv.lines ?? []).reduce((s: number, l: any) => s + Number(l.subtotal ?? 0), 0),
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Penjualan Barang</h2>
        <p className="text-sm text-muted-foreground">Daftar invoice penjualan unit ini. Jurnal pendapatan & HPP dibuat otomatis oleh engine.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nomor</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Pelanggan</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Pembayaran</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada invoice penjualan</td></tr>}
            {(data ?? []).map((inv: any) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-mono text-xs">{inv.nomor_invoice}</td>
                <td className="px-4 py-3">{formatDate(inv.tanggal_invoice)}</td>
                <td className="px-4 py-3">{inv.customer?.nama_customer ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(inv.total)}</td>
                <td className="px-4 py-3"><StatusBadge value={inv.status} /></td>
                <td className="px-4 py-3"><StatusBadge value={inv.payment_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
