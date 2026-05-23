import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/platform/bumdes")({
  head: () => ({ meta: [{ title: "Daftar BUMDes — Platform" }] }),
  component: () => <Protected require="platform"><PlatformBumdesPage /></Protected>,
});

function PlatformBumdesPage() {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, nama_bumdes, kode_bumdes, nama_desa, nama_kecamatan, status, created_at, business_units(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Daftar BUMDes</h2>
        <p className="text-sm text-muted-foreground">Seluruh BUMDes yang telah terdaftar pada platform.</p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary text-secondary-foreground">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama BUMDes</th>
              <th className="px-4 py-3 font-medium">Desa / Kecamatan</th>
              <th className="px-4 py-3 font-medium text-center">Unit</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aktif Sejak</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (tenants?.length ?? 0) === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" /> Belum ada BUMDes terdaftar.
              </td></tr>
            )}
            {(tenants ?? []).map((t: any) => (
              <tr key={t.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{t.kode_bumdes}</td>
                <td className="px-4 py-3 font-medium">{t.nama_bumdes}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.nama_desa}, {t.nama_kecamatan}</td>
                <td className="px-4 py-3 text-center">{t.business_units?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${t.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
