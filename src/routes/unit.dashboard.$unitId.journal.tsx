import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/journal")({
  component: JournalPage,
});

function JournalPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-journal", unitId],
    queryFn: async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("id, tanggal, nomor, deskripsi, source_type, status, lines:journal_entry_lines(debit, credit)")
        .eq("unit_id", unitId)
        .order("tanggal", { ascending: false })
        .limit(100);
      return (data ?? []).map((j: any) => {
        const debit = (j.lines ?? []).reduce((s: number, l: any) => s + Number(l.debit ?? 0), 0);
        const credit = (j.lines ?? []).reduce((s: number, l: any) => s + Number(l.credit ?? 0), 0);
        return { ...j, debit, credit };
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Jurnal Unit</h2>
        <p className="text-sm text-muted-foreground">Buku jurnal dari semua transaksi unit ini. Jurnal posted bersifat immutable.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Nomor</th>
            <th className="px-4 py-3 font-medium">Deskripsi</th>
            <th className="px-4 py-3 font-medium">Sumber</th>
            <th className="px-4 py-3 font-medium text-right">Debit</th>
            <th className="px-4 py-3 font-medium text-right">Kredit</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada jurnal</td></tr>}
            {(data ?? []).map((j: any) => (
              <tr key={j.id}>
                <td className="px-4 py-3">{formatDate(j.tanggal)}</td>
                <td className="px-4 py-3 font-mono text-xs">{j.nomor ?? "—"}</td>
                <td className="px-4 py-3">{j.deskripsi ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{j.source_type ?? "manual"}</td>
                <td className="px-4 py-3 text-right font-mono">{formatIDR(j.debit)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatIDR(j.credit)}</td>
                <td className="px-4 py-3"><span className="text-xs rounded-full bg-primary/15 text-primary px-2 py-0.5">{j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
