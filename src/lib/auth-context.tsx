import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin_platform" | "direktur_bumdes" | "admin_bumdes" | "manager_unit";

export interface UserRoleRow {
  role: AppRole;
  tenant_id: string | null;
  unit_id: string | null;
}

export interface TenantSummary {
  id: string;
  nama_bumdes: string;
  kode_bumdes: string;
  nama_desa: string;
  nama_kecamatan: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: UserRoleRow[];
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean; // direktur OR admin_bumdes pada tenant aktif
  tenantId: string | null;
  unitId: string | null; // manager_unit
  currentTenant: TenantSummary | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRoleRow[]>([]);
  const [currentTenant, setCurrentTenant] = useState<TenantSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (uid: string | undefined) => {
    if (!uid) { setRoles([]); setCurrentTenant(null); return; }
    const { data } = await supabase.from("user_roles").select("role, tenant_id, unit_id");
    const rows = (data as UserRoleRow[] | null) ?? [];
    setRoles(rows);
    const tid = rows.find((r) => r.tenant_id)?.tenant_id;
    if (tid) {
      const { data: t } = await supabase
        .from("tenants")
        .select("id, nama_bumdes, kode_bumdes, nama_desa, nama_kecamatan")
        .eq("id", tid)
        .maybeSingle();
      setCurrentTenant((t as TenantSummary | null) ?? null);
    } else {
      setCurrentTenant(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => { void loadRoles(s?.user.id); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadRoles(data.session?.user.id).finally(() => setLoading(false));
    });
    return () => subscription.unsubscribe();
  }, []);

  const isPlatformAdmin = roles.some((r) => r.role === "super_admin_platform");
  const tenantRole = roles.find((r) => r.tenant_id && (r.role === "direktur_bumdes" || r.role === "admin_bumdes" || r.role === "manager_unit"));
  const isTenantAdmin = roles.some((r) => r.role === "direktur_bumdes" || r.role === "admin_bumdes");
  const tenantId = tenantRole?.tenant_id ?? null;
  const unitId = roles.find((r) => r.role === "manager_unit")?.unit_id ?? null;

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    roles,
    isPlatformAdmin,
    isTenantAdmin,
    tenantId,
    unitId,
    currentTenant,
    loading,
    signOut: async () => { await supabase.auth.signOut(); },
    refreshRoles: async () => { await loadRoles(session?.user.id); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
