import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "./app-shell";

type Require = "any" | "platform" | "tenant" | "tenant_admin";

export function Protected({ children, require = "any" }: { children: React.ReactNode; require?: Require }) {
  const { user, loading, isPlatformAdmin, isTenantAdmin, tenantId } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Memuat sesi…</div>;
  }

  let denied = false;
  if (require === "platform" && !isPlatformAdmin) denied = true;
  if (require === "tenant" && !isPlatformAdmin && !tenantId) denied = true;
  if (require === "tenant_admin" && !isPlatformAdmin && !isTenantAdmin) denied = true;

  if (denied) {
    return (
      <AppShell>
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="font-display text-lg font-semibold">Akses ditolak</h2>
          <p className="text-sm text-muted-foreground mt-1">Anda tidak memiliki izin untuk halaman ini.</p>
        </div>
      </AppShell>
    );
  }
  return <AppShell>{children}</AppShell>;
}
