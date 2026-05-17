import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateUnitSchema = z.object({
  nama_unit: z.string().trim().min(2).max(100),
  kode_unit: z.string().trim().min(2).max(20).regex(/^[A-Z0-9_-]+$/i),
  jenis_unit: z.string().trim().min(2).max(80),
  template_id: z.string().uuid().nullable(),
  email_admin: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Hanya super admin yang diizinkan.");
}

export const createBusinessUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateUnitSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email_admin,
      password: data.password,
      email_confirm: true,
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Gagal membuat user");

    const { data: unit, error: uErr } = await supabaseAdmin
      .from("business_units")
      .insert({
        nama_unit: data.nama_unit,
        kode_unit: data.kode_unit.toUpperCase(),
        jenis_unit: data.jenis_unit,
        template_id: data.template_id,
      } as never)
      .select()
      .single();
    if (uErr || !unit) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(uErr?.message ?? "Gagal membuat unit");
    }

    const { error: rErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: created.user.id,
      role: "admin_unit",
      unit_id: unit.id,
    });
    if (rErr) throw new Error(rErr.message);

    return { unit_id: unit.id, user_id: created.user.id };
  });

const PromoteSchema = z.object({ email: z.string().email() });

export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PromoteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");
    if ((count ?? 0) > 0) throw new Error("Super admin sudah terdaftar.");

    const { data: userRow } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (!userRow.user || userRow.user.email !== data.email) {
      throw new Error("Email tidak cocok dengan sesi login Anda.");
    }
    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: context.userId,
      role: "super_admin",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
