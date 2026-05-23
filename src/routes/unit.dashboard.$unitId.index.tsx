import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";
import { ShoppingCart, Receipt, Package, Wallet, FileText, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/unit/dashboard/$unitId/")({
  component: UnitDashboardOverview,
});

function Stat({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: any; tone?: "default" | "accent" }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="mt-2 font-display text-xl font-bold">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-md grid place-items-center ${tone === "accent" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
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
        <h2 className="font-display text-2xl font-bold">Ringkasan Unit</h2>
        <p className="text-sm text-muted-foreground">Data difilter otomatis berdasarkan unit ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Total Penjualan" value={formatIDR(data?.total_penjualan ?? 0)} icon={ShoppingCart} tone="accent" />
        <Stat label="Piutang" value={formatIDR(data?.piutang ?? 0)} icon={Receipt} />
        <Stat label="Persediaan" value={formatIDR(data?.persediaan ?? 0)} icon={Package} />
        <Stat label="Kas & Bank" value={formatIDR(data?.kas_bank ?? 0)} icon={Wallet} />
        <Stat label="Hutang Supplier" value={formatIDR(data?.hutang ?? 0)} icon={FileText} />
        <Stat label="Laba Bersih" value={formatIDR(data?.laba ?? 0)} icon={TrendingUp} tone="accent" />
      </div>

      <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
        Gunakan menu di sidebar untuk membuka modul operasional unit ini. Setiap modul terhubung
        langsung dengan engine database (jurnal, persediaan, piutang, hutang) dan sudah difilter
        berdasarkan <span className="font-mono text-foreground">unit_id</span>.
      </div>
    </div>
  );
}
