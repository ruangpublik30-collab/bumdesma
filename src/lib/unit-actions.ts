import { supabase } from "@/integrations/supabase/client";

export async function getUnitTenantId(unitId: string): Promise<string | null> {
  const { data } = await supabase.from("business_units").select("tenant_id").eq("id", unitId).maybeSingle();
  return (data as any)?.tenant_id ?? null;
}

export function nowNomor(prefix: string) {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${prefix}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
