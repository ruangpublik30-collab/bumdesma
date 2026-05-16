import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/reports.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";
import { Building2, TrendingUp, Wallet, Coins } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ERP BUMDes" }] }),
  component: () => <Protected><DashboardPage /></Protected>,
});

function StatCard({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: any; tone?: "default" | "accent" }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="mt-2 font-display text-2xl font-bold text-foreground">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-md grid place-items-center ${tone === "accent" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { isSuperAdmin, unitId } = useAuth();
  const stats = useServerFn(getDashboardStats);
  const { data: statData } = useQuery({
    queryKey: ["dashboard-stats", isSuperAdmin ? "konsolidasi" : unitId],
    queryFn: () => stats({ data: { unit_id: isSuperAdmin ? null : unitId } }),
    enabled: isSuperAdmin || !!unitId,
  });

  const { data: units } = useQuery({
    queryKey: ["units-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("business_units").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{isSuperAdmin ? "Ringkasan BUMDes" : "Ringkasan Unit"}</h2>
        <p className="text-sm text-muted-foreground">Periode bulan berjalan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Laba Bulan Ini" value={formatIDR(statData?.laba_bulan_ini ?? 0)} icon={TrendingUp} tone="accent" />
        <StatCard label="Pendapatan" value={formatIDR(statData?.pendapatan_bulan_ini ?? 0)} icon={Coins} />
        <StatCard label="Total Aset" value={formatIDR(statData?.total_aset ?? 0)} icon={Building2} />
        <StatCard label="Mutasi Kas" value={formatIDR(statData?.saldo_kas_mutasi ?? 0)} icon={Wallet} />
      </div>

      {isSuperAdmin && (
        <div className="rounded-lg border bg-card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-display font-semibold">Unit Usaha BUMDes</h3>
            <p className="text-xs text-muted-foreground">Total: {units?.length ?? 0} unit</p>
          </div>
          <div className="divide-y">
            {(units ?? []).map((u: any) => (
              <div key={u.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.nama_unit}</div>
                  <div className="text-xs text-muted-foreground">{u.jenis_unit} · Kode {u.kode_unit}</div>
                </div>
                <span className={`text-xs rounded-full px-2 py-0.5 ${u.status === "aktif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{u.status}</span>
              </div>
            ))}
            {(!units || units.length === 0) && (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">Belum ada unit usaha. Buat unit pertama di menu Manajemen Unit.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
