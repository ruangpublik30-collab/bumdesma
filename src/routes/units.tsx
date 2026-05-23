import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/units")({
  head: () => ({ meta: [{ title: "Unit Usaha — ERP BUMDes" }] }),
  component: () => <Protected require="tenant_admin"><UnitsPage /></Protected>,
});

function UnitsPage() {
  const nav = useNavigate();
  const { tenantId, currentTenant } = useAuth();

  const { data: units, isLoading } = useQuery({
    queryKey: ["units", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase
        .from("business_units")
        .select("*, template:unit_templates(nama_template, kode_template)")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 min-w-0">
        <div>
          <h2 className="font-display text-2xl font-bold">Unit Usaha {currentTenant?.nama_bumdes ?? ""}</h2>
          <p className="text-sm text-muted-foreground">
            Kelola unit usaha BUMDes. Setiap unit baru otomatis menyiapkan akun manager & kredensial akses.
          </p>
        </div>
        <Button onClick={() => nav({ to: "/bumdes/dashboard/units/create" })}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Unit
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Nama Unit</th>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (units?.length ?? 0) === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Belum ada unit usaha. Klik "Tambah Unit" untuk memulai.
              </td></tr>
            )}
            {(units ?? []).map((u: any) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.nama_unit}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.kode_unit}</td>
                <td className="px-4 py-3">{u.jenis_unit}</td>
                <td className="px-4 py-3">{u.template?.kode_template ? <Badge variant="secondary">{u.template.kode_template}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3"><Badge variant={u.status === "aktif" ? "default" : "secondary"}>{u.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => nav({ to: "/unit/dashboard/$unitId", params: { unitId: u.id } })}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Lihat Dashboard
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
