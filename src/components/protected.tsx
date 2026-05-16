import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "./app-shell";

export function Protected({ children, requireSuper = false }: { children: React.ReactNode; requireSuper?: boolean }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Memuat sesi…</div>;
  }
  if (requireSuper && !isSuperAdmin) {
    return (
      <AppShell>
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="font-display text-lg font-semibold">Akses ditolak</h2>
          <p className="text-sm text-muted-foreground mt-1">Halaman ini hanya untuk Super Admin BUMDes.</p>
        </div>
      </AppShell>
    );
  }
  return <AppShell>{children}</AppShell>;
}
