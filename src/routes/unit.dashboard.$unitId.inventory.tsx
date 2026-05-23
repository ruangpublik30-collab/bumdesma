import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-inventory", unitId],
    queryFn: async () => (await supabase.from("inventory_items").select("*").eq("unit_id", unitId).order("nama_barang")).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Persediaan Barang</h2>
        <p className="text-sm text-muted-foreground">Master barang & nilai persediaan unit.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Kode</th>
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Satuan</th>
            <th className="px-4 py-3 font-medium text-right">Harga Beli</th>
            <th className="px-4 py-3 font-medium text-right">Harga Jual</th>
            <th className="px-4 py-3 font-medium text-right">Stok Awal</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada barang</td></tr>}
            {(data ?? []).map((it: any) => (
              <tr key={it.id}>
                <td className="px-4 py-3 font-mono text-xs">{it.kode_barang ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{it.nama_barang}</td>
                <td className="px-4 py-3">{it.satuan}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(it.harga_beli))}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(it.harga_jual))}</td>
                <td className="px-4 py-3 text-right">{Number(it.stok_awal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
