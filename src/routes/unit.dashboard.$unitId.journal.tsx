import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/journal")({
  component: JournalPage,
});

function JournalPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-journal", unitId],
    queryFn: async () => (await supabase.from("journal_entries").select("*").eq("unit_id", unitId).order("tanggal", { ascending: false }).limit(100)).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Jurnal Unit</h2>
        <p className="text-sm text-muted-foreground">Buku jurnal dari semua transaksi unit ini.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Nomor</th>
            <th className="px-4 py-3 font-medium">Deskripsi</th>
            <th className="px-4 py-3 font-medium">Sumber</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Belum ada jurnal</td></tr>}
            {(data ?? []).map((j: any) => (
              <tr key={j.id}>
                <td className="px-4 py-3">{formatDate(j.tanggal)}</td>
                <td className="px-4 py-3 font-mono text-xs">{j.nomor ?? "—"}</td>
                <td className="px-4 py-3">{j.deskripsi ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{j.source_type ?? "manual"}</td>
                <td className="px-4 py-3"><span className="text-xs rounded-full bg-primary/15 text-primary px-2 py-0.5">{j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
