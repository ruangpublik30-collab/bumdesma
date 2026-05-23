import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnitContext } from "@/components/unit/unit-shell";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { unitId } = Route.useParams();
  const { data: ctx } = useUnitContext(unitId);
  const { data: creds } = useQuery({
    queryKey: ["unit-credentials", unitId],
    queryFn: async () => (await supabase.from("unit_access_credentials").select("*").eq("unit_id", unitId)).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Pengaturan Unit</h2>
        <p className="text-sm text-muted-foreground">Profil unit, akses manager, dan informasi template.</p>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-2 text-sm">
        <div className="font-display font-semibold mb-2">Profil Unit</div>
        <div className="grid grid-cols-2 gap-2">
          <div><span className="text-muted-foreground">Nama: </span>{ctx?.unit?.nama_unit}</div>
          <div><span className="text-muted-foreground">Kode: </span>{ctx?.unit?.kode_unit}</div>
          <div><span className="text-muted-foreground">Jenis: </span>{ctx?.unit?.jenis_unit}</div>
          <div><span className="text-muted-foreground">Status: </span>{ctx?.unit?.status}</div>
          <div><span className="text-muted-foreground">Template: </span>{ctx?.template?.nama_template ?? "—"} ({ctx?.template?.kode_template ?? "—"})</div>
          <div><span className="text-muted-foreground">BUMDes: </span>{ctx?.tenant?.nama_bumdes}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b font-display font-semibold">Akses Manager Unit</div>
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Login Code</th>
            <th className="px-4 py-3 font-medium">Email Virtual</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Dibuat</th>
          </tr></thead>
          <tbody className="divide-y">
            {(creds?.length ?? 0) === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada kredensial</td></tr>}
            {(creds ?? []).map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono text-xs">{c.login_code}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.email_virtual}</td>
                <td className="px-4 py-3">{c.role}</td>
                <td className="px-4 py-3"><span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">{c.access_status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(c.generated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
