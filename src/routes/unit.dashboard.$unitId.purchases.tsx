import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/purchases")({
  component: PurchasesPage,
});

function StatusBadge({ value }: { value: string | null }) {
  const v = (value ?? "").toLowerCase();
  const tone =
    v === "posted" || v === "received" ? "bg-success/15 text-success" :
    v === "draft" ? "bg-muted text-muted-foreground" :
    "bg-primary/15 text-primary";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{value ?? "—"}</span>;
}

function PurchasesPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-purchases", unitId],
    queryFn: async () => {
      const { data } = await supabase
        .from("goods_receipts")
        .select("id, nomor_gr, tanggal_terima, status, supplier:suppliers(nama_supplier), lines:goods_receipt_lines(subtotal)")
        .eq("unit_id", unitId)
        .order("tanggal_terima", { ascending: false })
        .limit(200);
      return (data ?? []).map((gr: any) => ({
        ...gr,
        total: (gr.lines ?? []).reduce((s: number, l: any) => s + Number(l.subtotal ?? 0), 0),
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Pembelian Barang</h2>
        <p className="text-sm text-muted-foreground">Penerimaan barang (Goods Receipt) dari supplier. Jurnal persediaan & hutang dibuat otomatis.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nomor GR</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Supplier</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Belum ada penerimaan barang</td></tr>}
            {(data ?? []).map((gr: any) => (
              <tr key={gr.id}>
                <td className="px-4 py-3 font-mono text-xs">{gr.nomor_gr}</td>
                <td className="px-4 py-3">{formatDate(gr.tanggal_terima)}</td>
                <td className="px-4 py-3">{gr.supplier?.nama_supplier ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(gr.total)}</td>
                <td className="px-4 py-3"><StatusBadge value={gr.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
