import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, ShoppingCart, Users, Receipt, Package, ShoppingBag,
  Truck, FileText, Wallet, BookOpen, BarChart3, Settings, LogOut, ArrowLeft, Store,
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

export function UnitShell({ unitId, children }: { unitId: string; children: React.ReactNode }) {
  const { data, isLoading } = useUnitContext(unitId);
  const { user, signOut, isTenantAdmin } = useAuth();
  const router = useRouter();
  const loc = useLocation();

  const tplCode = data?.template?.kode_template?.toUpperCase() ?? "";
  const items = tplCode === "DAGANG" ? dagangMenu(unitId) : defaultMenu(unitId);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-bold">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm leading-tight truncate">
                {isLoading ? <Skeleton className="h-4 w-28" /> : data?.unit?.nama_unit ?? "Unit"}
              </div>
              <div className="text-[11px] opacity-70 truncate">
                {data?.tenant?.nama_bumdes ?? ""}
              </div>
            </div>
          </div>
          {data?.template && (
            <Badge variant="secondary" className="mt-3 text-[10px]">{data.template.kode_template}</Badge>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((it) => {
            const active = it.exact ? loc.pathname === it.to : loc.pathname === it.to || loc.pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-xs space-y-2">
          {isTenantAdmin && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => router.navigate({ to: "/units" })}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Direktur
            </Button>
          )}
          <div className="opacity-70">Masuk sebagai</div>
          <div className="truncate font-medium">{user?.email}</div>
          <button
            onClick={async () => { await signOut(); router.navigate({ to: "/login" }); }}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded bg-sidebar-accent px-3 py-2 hover:opacity-90"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="border-b bg-card">
          <div className="px-8 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold text-foreground truncate">
                {data?.unit?.nama_unit ?? "Memuat unit…"}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {data?.tenant?.nama_bumdes ?? ""}
                {data?.unit && ` · Jenis: ${data.unit.jenis_unit}`}
                {data?.template && ` · Template: ${data.template.nama_template}`}
              </p>
            </div>
            {data?.unit && (
              <Badge variant={data.unit.status === "aktif" ? "default" : "secondary"}>
                {data.unit.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="p-8">{children}</div>
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
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
        Modul ini sedang disiapkan. Engine database sudah tersedia, UI operasional akan diaktifkan pada iterasi berikutnya.
      </div>
      {columns && columns.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr className="text-left">
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
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
