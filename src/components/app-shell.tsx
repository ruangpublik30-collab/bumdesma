import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Building2, BookOpen, FileBarChart, LogOut, Wallet, Scale, TrendingUp,
  Inbox, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navPlatform = [
  { to: "/platform/pendaftaran", label: "Pendaftaran BUMDes", icon: Inbox },
  { to: "/platform/bumdes", label: "Daftar BUMDes", icon: Building2 },
];

const navTenantAdmin = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/units", label: "Unit Usaha", icon: Building2 },
  { to: "/jurnal", label: "Transaksi", icon: BookOpen },
  { to: "/laporan/laba-rugi", label: "Laba Rugi", icon: TrendingUp },
  { to: "/laporan/neraca", label: "Neraca", icon: Scale },
  { to: "/laporan/arus-kas", label: "Arus Kas", icon: Wallet },
  { to: "/laporan/konsolidasi", label: "Konsolidasi BUMDes", icon: FileBarChart },
];

const navUnit = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jurnal", label: "Transaksi", icon: BookOpen },
  { to: "/laporan/laba-rugi", label: "Laba Rugi", icon: TrendingUp },
  { to: "/laporan/neraca", label: "Neraca", icon: Scale },
  { to: "/laporan/arus-kas", label: "Arus Kas", icon: Wallet },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isPlatformAdmin, isTenantAdmin, currentTenant, signOut } = useAuth();
  const router = useRouter();
  const loc = useLocation();

  const items = isPlatformAdmin ? navPlatform : isTenantAdmin ? navTenantAdmin : navUnit;
  const roleLabel = isPlatformAdmin
    ? "Super Admin Platform"
    : isTenantAdmin
    ? "Direktur / Admin BUMDes"
    : "Manager Unit";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-bold">
              {isPlatformAdmin ? <ShieldCheck className="h-4 w-4" /> : "B"}
            </div>
            <div>
              <div className="font-display font-semibold leading-tight">
                {isPlatformAdmin ? "Admin Platform" : "ERP BUMDes"}
              </div>
              <div className="text-xs opacity-70 truncate max-w-[10rem]">
                {isPlatformAdmin ? "Manajemen Tenant" : currentTenant?.nama_bumdes ?? "BUMDes"}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const active = loc.pathname === it.to || loc.pathname.startsWith(it.to + "/");
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
        <div className="p-4 border-t border-sidebar-border text-xs">
          <div className="opacity-70">Masuk sebagai</div>
          <div className="truncate font-medium">{user?.email}</div>
          <div className="opacity-70 mt-0.5">{roleLabel}</div>
          {currentTenant && !isPlatformAdmin && (
            <div className="opacity-70 mt-0.5">Kode: {currentTenant.kode_bumdes}</div>
          )}
          <button
            onClick={async () => { await signOut(); router.navigate({ to: "/login" }); }}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded bg-sidebar-accent px-3 py-2 hover:opacity-90"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="border-b bg-card">
          <div className="px-8 py-4">
            <h1 className="font-display text-lg font-semibold text-foreground">
              {items.find((i) => loc.pathname.startsWith(i.to))?.label ?? "ERP BUMDes"}
            </h1>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
