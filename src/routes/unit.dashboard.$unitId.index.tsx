import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";
import { ShoppingCart, Receipt, Package, Wallet, FileText, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/unit/dashboard/$unitId/")({
  component: UnitDashboardOverview,
});

type Tone = "green" | "blue" | "orange" | "violet";
const toneMap: Record<Tone, { iconBg: string; iconColor: string; ring: string }> = {
  green:  { iconBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]", ring: "ring-[#BBF7D0]" },
  blue:   { iconBg: "bg-[#DBEAFE]", iconColor: "text-[#2563EB]", ring: "ring-[#BFDBFE]" },
  orange: { iconBg: "bg-[#FED7AA]", iconColor: "text-[#F97316]", ring: "ring-[#FDBA74]" },
  violet: { iconBg: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]", ring: "ring-[#DDD6FE]" },
};

function Stat({ label, value, icon: Icon, tone = "green" }: { label: string; value: string; icon: any; tone?: Tone }) {
  const t = toneMap[tone];
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-[#BBF7D0] bg-gradient-to-br from-white to-[#F0FDF4] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] text-[#6B7280] uppercase tracking-wide font-semibold truncate">{label}</div>
          <div className="mt-2 font-display text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-[#111827] break-words">{value}</div>
        </div>
        <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl grid place-items-center shrink-0 ring-1 ${t.iconBg} ${t.ring}`}>
          <Icon className={`h-5 w-5 ${t.iconColor}`} />
        </div>
      </div>
    </div>
  );
}


function num(v: any) { return Number(v ?? 0); }

function UnitDashboardOverview() {
  const { unitId } = Route.useParams();

  const { data } = useQuery({
    queryKey: ["unit-overview", unitId],
    queryFn: async () => {
      const [ar, stock, cashbank, ap, pnl] = await Promise.all([
        supabase.from("v_accounts_receivable").select("total_invoice, outstanding_amount").eq("unit_id", unitId),
        supabase.from("v_inventory_stock").select("nilai_persediaan").eq("unit_id", unitId),
        supabase.from("v_cash_bank_balance").select("saldo").eq("unit_id", unitId),
        supabase.from("v_accounts_payable").select("outstanding_amount").eq("unit_id", unitId),
        supabase.from("v_income_statement_summary").select("laba_bersih, total_pendapatan").eq("unit_id", unitId).maybeSingle(),
      ]);
      const sumCol = (rows: any[] | null, col: string) =>
        (rows ?? []).reduce((s, r) => s + num(r?.[col]), 0);
      return {
        total_penjualan: sumCol(ar.data as any[], "total_invoice"),
        piutang: sumCol(ar.data as any[], "outstanding_amount"),
        persediaan: sumCol(stock.data as any[], "nilai_persediaan"),
        kas_bank: sumCol(cashbank.data as any[], "saldo"),
        hutang: sumCol(ap.data as any[], "outstanding_amount"),
        laba: num((pnl.data as any)?.laba_bersih),
        pendapatan: num((pnl.data as any)?.total_pendapatan),
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[22px] md:text-[24px] font-bold text-[#111827]">Ringkasan Unit</h2>
        <p className="text-[14px] text-[#6B7280]">Data difilter otomatis berdasarkan unit ini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Total Penjualan" value={formatIDR(data?.total_penjualan ?? 0)} icon={ShoppingCart} tone="green" />
        <Stat label="Piutang" value={formatIDR(data?.piutang ?? 0)} icon={Receipt} tone="blue" />
        <Stat label="Persediaan" value={formatIDR(data?.persediaan ?? 0)} icon={Package} tone="violet" />
        <Stat label="Kas & Bank" value={formatIDR(data?.kas_bank ?? 0)} icon={Wallet} tone="green" />
        <Stat label="Hutang Supplier" value={formatIDR(data?.hutang ?? 0)} icon={FileText} tone="blue" />
        <Stat label="Laba Bersih" value={formatIDR(data?.laba ?? 0)} icon={TrendingUp} tone="orange" />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-[14px] text-[#6B7280] shadow-sm">
        Gunakan menu di sidebar untuk membuka modul operasional unit ini. Setiap modul terhubung
        langsung dengan engine database (jurnal, persediaan, piutang, hutang) dan sudah difilter
        berdasarkan <span className="font-mono text-[#111827] font-semibold">unit_id</span>.
      </div>
    </div>
  );
}
