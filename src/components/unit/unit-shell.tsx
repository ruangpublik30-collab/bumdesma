import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard, ShoppingCart, Users, Receipt, Package, ShoppingBag,
  Truck, FileText, Wallet, BookOpen, BarChart3, Settings, LogOut, ArrowLeft, Store, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnitShellData {
  unit: { id: string; nama_unit: string; kode_unit: string; jenis_unit: string; status: string; template_id: string | null; tenant_id: string } | null;
  tenant: { id: string; nama_bumdes: string; kode_bumdes: string } | null;
  template: { id: string; nama_template: string; kode_template: string } | null;
}

export function useUnitContext(unitId: string) {
  return useQuery({
    queryKey: ["unit-context", unitId],
    enabled: !!unitId,
    queryFn: async (): Promise<UnitShellData> => {
      const { data: unit } = await supabase.from("business_units").select("*").eq("id", unitId).maybeSingle();
      if (!unit) return { unit: null, tenant: null, template: null };
      const [{ data: tenant }, { data: template }] = await Promise.all([
        supabase.from("tenants").select("id, nama_bumdes, kode_bumdes").eq("id", (unit as any).tenant_id).maybeSingle(),
        (unit as any).template_id
          ? supabase.from("unit_templates").select("id, nama_template, kode_template").eq("id", (unit as any).template_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return { unit: unit as any, tenant: tenant as any, template: template as any };
    },
  });
}

const dagangMenu = (uid: string) => [
  { to: `/unit/dashboard/${uid}`, label: "Dashboard Unit", icon: LayoutDashboard, exact: true },
  { to: `/unit/dashboard/${uid}/sales`, label: "Penjualan Barang", icon: ShoppingCart },
  { to: `/unit/dashboard/${uid}/customers`, label: "Pelanggan", icon: Users },
  { to: `/unit/dashboard/${uid}/receivables`, label: "Piutang Penjualan", icon: Receipt },
  { to: `/unit/dashboard/${uid}/inventory`, label: "Persediaan Barang", icon: Package },
  { to: `/unit/dashboard/${uid}/purchases`, label: "Pembelian Barang", icon: ShoppingBag },
  { to: `/unit/dashboard/${uid}/suppliers`, label: "Supplier", icon: Truck },
  { to: `/unit/dashboard/${uid}/payables`, label: "Hutang Pembelian", icon: FileText },
  { to: `/unit/dashboard/${uid}/cash-bank`, label: "Kas & Bank", icon: Wallet },
  { to: `/unit/dashboard/${uid}/journal`, label: "Jurnal Unit", icon: BookOpen },
  { to: `/unit/dashboard/${uid}/reports`, label: "Laporan Unit", icon: BarChart3 },
  { to: `/unit/dashboard/${uid}/settings`, label: "Pengaturan Unit", icon: Settings },
];

const defaultMenu = (uid: string) => [
  { to: `/unit/dashboard/${uid}`, label: "Dashboard Unit", icon: LayoutDashboard, exact: true },
  { to: `/unit/dashboard/${uid}/cash-bank`, label: "Kas & Bank", icon: Wallet },
  { to: `/unit/dashboard/${uid}/journal`, label: "Jurnal Unit", icon: BookOpen },
  { to: `/unit/dashboard/${uid}/reports`, label: "Laporan Unit", icon: BarChart3 },
  { to: `/unit/dashboard/${uid}/settings`, label: "Pengaturan Unit", icon: Settings },
];

type MenuItem = { to: string; label: string; icon: any; exact?: boolean };

function SidebarBody({
  items, data, isLoading, isTenantAdmin, user, onNavigate, onBackToDirektur, onSignOut,
}: {
  items: MenuItem[];
  data: UnitShellData | undefined;
  isLoading: boolean;
  isTenantAdmin: boolean;
  user: any;
  onNavigate?: () => void;
  onBackToDirektur: () => void;
  onSignOut: () => void;
}) {
  const loc = useLocation();
  return (
    <div className="flex h-full flex-col bg-[#F4FBF6] border-r border-[#E5E7EB]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#16A34A] text-white grid place-items-center shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-[15px] text-[#111827] leading-tight truncate">
              {isLoading ? <Skeleton className="h-4 w-28" /> : data?.unit?.nama_unit ?? "Unit"}
            </div>
            <div className="text-[12px] text-[#6B7280] truncate">
              {data?.tenant?.nama_bumdes ?? ""}
            </div>
          </div>
        </div>
        {data?.template && (
          <span className="inline-flex mt-3 text-[11px] font-semibold uppercase tracking-wide bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] rounded-full px-2.5 py-0.5">
            {data.template.kode_template}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active = it.exact ? loc.pathname === it.to : loc.pathname === it.to || loc.pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                active
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-[#1F2937] hover:bg-[#EAF7EE] hover:text-[#166534]"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-[#16A34A]")} />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5E7EB] bg-white text-[13px] space-y-2">
        {isTenantAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6]"
            onClick={onBackToDirektur}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Direktur
          </Button>
        )}
        <div className="text-[#6B7280] text-[12px] uppercase tracking-wide font-semibold pt-1">Masuk sebagai</div>
        <div className="truncate font-semibold text-[#111827]">{user?.email}</div>
        <button
          onClick={onSignOut}
          className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-2 font-medium transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> Keluar
        </button>
      </div>
    </div>
  );
}

export function UnitShell({ unitId, children }: { unitId: string; children: React.ReactNode }) {
  const { data, isLoading } = useUnitContext(unitId);
  const { user, signOut, isTenantAdmin } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tplCode = data?.template?.kode_template?.toUpperCase() ?? "";
  const items = tplCode === "DAGANG" ? dagangMenu(unitId) : defaultMenu(unitId);

  const onBackToDirektur = () => router.navigate({ to: "/units" });
  const onSignOut = async () => { await signOut(); router.navigate({ to: "/login" }); };

  return (
    <div className="min-h-screen bg-[#F8FAF7] overflow-x-hidden">
      {/* Sidebar — desktop fixed */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] h-screen overflow-y-auto no-print">
        <SidebarBody
          items={items}
          data={data}
          isLoading={isLoading}
          isTenantAdmin={isTenantAdmin}
          user={user}
          onBackToDirektur={onBackToDirektur}
          onSignOut={onSignOut}
        />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw] border-r-0 bg-transparent">
          <SidebarBody
            items={items}
            data={data}
            isLoading={isLoading}
            isTenantAdmin={isTenantAdmin}
            user={user}
            onNavigate={() => setMobileOpen(false)}
            onBackToDirektur={() => { setMobileOpen(false); onBackToDirektur(); }}
            onSignOut={onSignOut}
          />
        </SheetContent>
      </Sheet>

      {/* Topbar — fixed */}
      <header className="fixed top-0 right-0 left-0 lg:left-[260px] z-30 bg-white border-b border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] no-print">
        <div className="h-[72px] px-4 sm:px-5 lg:px-8 flex items-center gap-3 w-full min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="shrink-0 lg:hidden h-10 w-10 grid place-items-center rounded-lg hover:bg-[#F3F4F6] text-[#374151]">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[16px] sm:text-[18px] lg:text-[20px] font-bold text-[#111827] truncate">
              {data?.unit?.nama_unit ?? "Memuat unit…"}
            </h1>
            <p className="text-[12px] lg:text-[13px] text-[#6B7280] truncate">
              {data?.tenant?.nama_bumdes ?? ""}
              {data?.unit && ` · ${data.unit.jenis_unit}`}
            </p>
          </div>

          {data?.unit && (
            <Badge
              className={cn(
                "shrink-0 border font-semibold uppercase tracking-wide text-[11px] px-2.5 py-1 rounded-full",
                data.unit.status === "aktif"
                  ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0] hover:bg-[#DCFCE7]"
                  : "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]"
              )}
            >

              {data.unit.status}
            </Badge>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-[260px] pt-[72px] min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export function UnitPagePlaceholder({
  title, description, columns,
}: { title: string; description: string; columns?: string[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#111827]">{title}</h2>
        <p className="text-[14px] text-[#6B7280]">{description}</p>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-[14px] text-[#6B7280] shadow-sm">
        Modul ini sedang disiapkan. Engine database sudah tersedia, UI operasional akan diaktifkan pada iterasi berikutnya.
      </div>
      {columns && columns.length > 0 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
          <table className="w-full text-[14px]">
            <thead className="bg-[#F9FAFB]">
              <tr className="text-left">
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-semibold uppercase tracking-wide text-[12px] text-[#374151]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[#6B7280]">
                  Belum ada data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
