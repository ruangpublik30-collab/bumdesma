import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard, Building2, BookOpen, FileBarChart, LogOut, Wallet, Scale, TrendingUp,
  Inbox, ShieldCheck, ShoppingCart, ShoppingBag, Database, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navPlatform = [
  { to: "/platform/pendaftaran", label: "Pendaftaran BUMDes", icon: Inbox },
  { to: "/platform/bumdes", label: "Daftar BUMDes", icon: Building2 },
];

const navTenantAdmin = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/units", label: "Unit Usaha", icon: Building2 },
  { to: "/master-data", label: "Master Data", icon: Database },
  { to: "/penjualan", label: "Penjualan", icon: ShoppingCart },
  { to: "/pembelian", label: "Pembelian", icon: ShoppingBag },
  { to: "/jurnal", label: "Buku Jurnal", icon: BookOpen },
  { to: "/laporan/laba-rugi", label: "Laba Rugi", icon: TrendingUp },
  { to: "/laporan/neraca", label: "Neraca", icon: Scale },
  { to: "/laporan/arus-kas", label: "Arus Kas", icon: Wallet },
  { to: "/laporan/konsolidasi", label: "Konsolidasi BUMDes", icon: FileBarChart },
];

const navUnit = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/master-data", label: "Master Data", icon: Database },
  { to: "/penjualan", label: "Penjualan", icon: ShoppingCart },
  { to: "/pembelian", label: "Pembelian", icon: ShoppingBag },
  { to: "/jurnal", label: "Buku Jurnal", icon: BookOpen },
  { to: "/laporan/laba-rugi", label: "Laba Rugi", icon: TrendingUp },
  { to: "/laporan/neraca", label: "Neraca", icon: Scale },
  { to: "/laporan/arus-kas", label: "Arus Kas", icon: Wallet },
];

type Item = { to: string; label: string; icon: any };

function SidebarBody({
  items, isPlatformAdmin, currentTenant, user, roleLabel, onNavigate, onSignOut,
}: {
  items: Item[];
  isPlatformAdmin: boolean;
  currentTenant: any;
  user: any;
  roleLabel: string;
  onNavigate?: () => void;
  onSignOut: () => void;
}) {
  const loc = useLocation();
  return (
    <div className="flex h-full flex-col bg-[#F4FBF6] border-r border-[#E5E7EB]">
      <div className="px-5 py-5 border-b border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#16A34A] text-white grid place-items-center shadow-sm font-bold">
            {isPlatformAdmin ? <ShieldCheck className="h-5 w-5" /> : "B"}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-[15px] text-[#111827] leading-tight truncate">
              {isPlatformAdmin ? "Admin Platform" : "ERP BUMDes"}
            </div>
            <div className="text-[12px] text-[#6B7280] truncate">
              {isPlatformAdmin ? "Manajemen Tenant" : currentTenant?.nama_bumdes ?? "BUMDes"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active = loc.pathname === it.to || loc.pathname.startsWith(it.to + "/");
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

      <div className="p-4 border-t border-[#E5E7EB] bg-white text-[13px] space-y-1">
        <div className="text-[#6B7280] text-[12px] uppercase tracking-wide font-semibold">Masuk sebagai</div>
        <div className="truncate font-semibold text-[#111827]">{user?.email}</div>
        <div className="text-[#6B7280] text-[12px]">{roleLabel}</div>
        {currentTenant && !isPlatformAdmin && (
          <div className="text-[#6B7280] text-[12px]">Kode: {currentTenant.kode_bumdes}</div>
        )}
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isPlatformAdmin, isTenantAdmin, currentTenant, signOut } = useAuth();
  const router = useRouter();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = isPlatformAdmin ? navPlatform : isTenantAdmin ? navTenantAdmin : navUnit;
  const roleLabel = isPlatformAdmin
    ? "Super Admin Platform"
    : isTenantAdmin
    ? "Direktur / Admin BUMDes"
    : "Manager Unit";

  const onSignOut = async () => { await signOut(); router.navigate({ to: "/login" }); };
  const pageTitle = items.find((i) => loc.pathname === i.to || loc.pathname.startsWith(i.to + "/"))?.label ?? "ERP BUMDes";

  return (
    <div className="min-h-screen bg-[#F8FAF7] overflow-x-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] h-screen overflow-y-auto no-print">
        <SidebarBody
          items={items}
          isPlatformAdmin={isPlatformAdmin}
          currentTenant={currentTenant}
          user={user}
          roleLabel={roleLabel}
          onSignOut={onSignOut}
        />
      </aside>

      {/* Drawer mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw] border-r-0 bg-transparent">
          <SidebarBody
            items={items}
            isPlatformAdmin={isPlatformAdmin}
            currentTenant={currentTenant}
            user={user}
            roleLabel={roleLabel}
            onNavigate={() => setMobileOpen(false)}
            onSignOut={onSignOut}
          />
        </SheetContent>
      </Sheet>

      {/* Topbar fixed */}
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
              {pageTitle}
            </h1>
            <p className="text-[12px] lg:text-[13px] text-[#6B7280] truncate">
              {isPlatformAdmin ? "Konsol Admin Platform" : currentTenant?.nama_bumdes ?? "BUMDes"}
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="lg:ml-[260px] pt-[88px] min-h-screen w-full max-w-full min-w-0 overflow-x-hidden">
        <div className="px-4 sm:px-5 lg:px-8 pb-8">{children}</div>
      </main>
    </div>

  );
}
