import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin_unit";

export interface UserRoleRow {
  role: AppRole;
  unit_id: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: UserRoleRow[];
  isSuperAdmin: boolean;
  unitId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (uid: string | undefined) => {
    if (!uid) { setRoles([]); return; }
    const { data } = await supabase.from("user_roles").select("role, unit_id");
    setRoles((data as UserRoleRow[] | null) ?? []);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // Defer to avoid deadlocks
      setTimeout(() => { void loadRoles(s?.user.id); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadRoles(data.session?.user.id).finally(() => setLoading(false));
    });
    return () => subscription.unsubscribe();
  }, []);

  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const unitId = roles.find((r) => r.role === "admin_unit")?.unit_id ?? null;

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    roles,
    isSuperAdmin,
    unitId,
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
