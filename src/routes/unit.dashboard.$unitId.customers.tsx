import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/unit/dashboard/$unitId/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { unitId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-customers", unitId],
    queryFn: async () => (await supabase.from("customers").select("*").eq("unit_id", unitId).order("nama_customer")).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Pelanggan</h2>
        <p className="text-sm text-muted-foreground">Master data pelanggan unit ini.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Kontak</th>
            <th className="px-4 py-3 font-medium">Alamat</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Belum ada pelanggan</td></tr>}
            {(data ?? []).map((c: any) => (
              <tr key={c.id}><td className="px-4 py-3 font-medium">{c.nama_customer}</td><td className="px-4 py-3">{c.kontak ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{c.alamat ?? "—"}</td><td className="px-4 py-3"><span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">{c.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
