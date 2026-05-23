import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/cash-bank")({
  component: CashBankPage,
});

function CashBankPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-cash", unitId],
    queryFn: async () => (await supabase.from("cash_transactions").select("*").eq("unit_id", unitId).order("tanggal", { ascending: false }).limit(100)).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Kas & Bank</h2>
        <p className="text-sm text-muted-foreground">Transaksi kas dan bank unit.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Nomor</th>
            <th className="px-4 py-3 font-medium">Jenis</th>
            <th className="px-4 py-3 font-medium">Deskripsi</th>
            <th className="px-4 py-3 font-medium text-right">Jumlah</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Belum ada transaksi</td></tr>}
            {(data ?? []).map((t: any) => (
              <tr key={t.id}>
                <td className="px-4 py-3">{formatDate(t.tanggal)}</td>
                <td className="px-4 py-3 font-mono text-xs">{t.nomor ?? "—"}</td>
                <td className="px-4 py-3">{t.jenis}</td>
                <td className="px-4 py-3">{t.deskripsi ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(t.jumlah))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
