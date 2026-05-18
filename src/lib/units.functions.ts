import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateUnitSchema = z.object({
  tenant_id: z.string().uuid(),
  nama_unit: z.string().trim().min(2).max(100),
  kode_unit: z.string().trim().min(2).max(20).regex(/^[A-Z0-9_-]+$/i),
  jenis_unit: z.string().trim().min(2).max(80),
  template_id: z.string().uuid().nullable(),
});

async function assertCanManageTenant(userId: string, tenantId: string) {
  // Platform admin?
  const { data: plat } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin_platform")
    .maybeSingle();
  if (plat) return;
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .in("role", ["direktur_bumdes", "admin_bumdes"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Anda tidak memiliki izin mengelola unit di BUMDes ini.");
  }
}

export const createBusinessUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateUnitSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertCanManageTenant(context.userId, data.tenant_id);
    const { data: unit, error: uErr } = await supabaseAdmin
      .from("business_units")
      .insert({
        tenant_id: data.tenant_id,
        nama_unit: data.nama_unit,
        kode_unit: data.kode_unit.toUpperCase(),
        jenis_unit: data.jenis_unit,
        template_id: data.template_id,
      })
      .select()
      .single();
    if (uErr || !unit) throw new Error(uErr?.message ?? "Gagal membuat unit");
    return { unit_id: unit.id };
  });

const InviteManagerSchema = z.object({
  tenant_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export const inviteUnitManager = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => InviteManagerSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertCanManageTenant(context.userId, data.tenant_id);
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Gagal membuat akun manager unit");
    const { error: rErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: created.user.id,
      role: "manager_unit",
      tenant_id: data.tenant_id,
      unit_id: data.unit_id,
    });
    if (rErr) throw new Error(rErr.message);
    return { user_id: created.user.id };
  });
