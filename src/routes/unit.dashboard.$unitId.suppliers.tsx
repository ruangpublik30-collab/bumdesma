import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/unit/dashboard/$unitId/suppliers")({
  component: SuppliersPage,
});

function SuppliersPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-suppliers", unitId],
    queryFn: async () => (await supabase.from("suppliers").select("*").eq("unit_id", unitId).order("nama_supplier")).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Supplier</h2>
        <p className="text-sm text-muted-foreground">Master supplier unit ini.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nama</th><th className="px-4 py-3 font-medium">Kontak</th><th className="px-4 py-3 font-medium">Alamat</th><th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Belum ada supplier</td></tr>}
            {(data ?? []).map((s: any) => (
              <tr key={s.id}><td className="px-4 py-3 font-medium">{s.nama_supplier}</td><td className="px-4 py-3">{s.kontak ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{s.alamat ?? "—"}</td><td className="px-4 py-3"><span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">{s.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
