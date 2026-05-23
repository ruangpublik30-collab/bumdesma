import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { UnitShell } from "./unit-shell";

export function UnitProtected({ unitId, children }: { unitId: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/login" }); return; }
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.rpc("can_access_unit", { _user_id: user.id, _unit_id: unitId });
      if (!mounted) return;
      if (error) { setState("denied"); return; }
      setState(data === true ? "ok" : "denied");
    })();
    return () => { mounted = false; };
  }, [user, loading, unitId, nav]);

  if (loading || state === "checking") {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Memuat akses unit…</div>;
  }
  if (state === "denied") {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="rounded-lg border bg-card p-8 max-w-md text-center">
          <h2 className="font-display text-lg font-semibold">Akses ditolak</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Akun Anda tidak memiliki izin untuk dashboard unit ini.
          </p>
        </div>
      </div>
    );
  }
  return <UnitShell unitId={unitId}>{children}</UnitShell>;
}
