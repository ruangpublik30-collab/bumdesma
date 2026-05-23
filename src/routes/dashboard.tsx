import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/reports.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";
import { Building2, TrendingUp, Wallet, Coins } from "lucide-react";
import { PageContainer, PageHeader, StatCard } from "@/components/layout/page";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ERP BUMDes" }] }),
  component: () => <Protected require="tenant"><DashboardPage /></Protected>,
});

function DashboardPage() {
  const { isTenantAdmin, unitId, currentTenant } = useAuth();
  const stats = useServerFn(getDashboardStats);
  const scope = isTenantAdmin ? null : unitId;
  const { data: statData } = useQuery({
    queryKey: ["dashboard-stats", scope],
    queryFn: () => stats({ data: { unit_id: scope } }),
    enabled: isTenantAdmin || !!unitId,
  });

  const { data: units } = useQuery({
    queryKey: ["units-summary"],
    enabled: isTenantAdmin,
    queryFn: async () => (await supabase.from("business_units").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <PageContainer>
      <PageHeader
        title={isTenantAdmin ? `Ringkasan ${currentTenant?.nama_bumdes ?? "BUMDes"}` : "Ringkasan Unit"}
        description="Periode bulan berjalan"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        <StatCard label="Laba Bulan Ini" value={formatIDR(statData?.laba_bulan_ini ?? 0)} icon={TrendingUp} tone="orange" />
        <StatCard label="Pendapatan" value={formatIDR(statData?.pendapatan_bulan_ini ?? 0)} icon={Coins} tone="green" />
        <StatCard label="Total Aset" value={formatIDR(statData?.total_aset ?? 0)} icon={Building2} tone="green" />
        <StatCard label="Mutasi Kas" value={formatIDR(statData?.saldo_kas_mutasi ?? 0)} icon={Wallet} tone="green" />
      </div>

      {isTenantAdmin && (
        <div className="rounded-2xl border border-[#BBF7D0] bg-gradient-to-br from-white to-[#F0FDF4] shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#BBF7D0] bg-white/60">
            <h3 className="font-display font-bold text-[16px] sm:text-[18px] text-[#111827]">Unit Usaha</h3>
            <p className="text-[12px] text-[#6B7280]">Total: {units?.length ?? 0} unit</p>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {(units ?? []).map((u: any) => (
              <div key={u.id} className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 hover:bg-[#F0FDF4] transition-colors min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[14px] sm:text-[15px] text-[#111827] truncate">{u.nama_unit}</div>
                  <div className="text-[12px] text-[#6B7280] truncate">{u.jenis_unit} · Kode {u.kode_unit}</div>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 border ${u.status === "aktif" ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]" : "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]"}`}>{u.status}</span>
              </div>
            ))}
            {(!units || units.length === 0) && (
              <div className="px-6 py-8 text-center text-sm text-[#6B7280]">Belum ada unit usaha. Buat unit pertama di menu Unit Usaha.</div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
