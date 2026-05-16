import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateUnitSchema = z.object({
  nama_unit: z.string().trim().min(2).max(100),
  kode_unit: z.string().trim().min(2).max(20).regex(/^[A-Z0-9_-]+$/i),
  jenis_unit: z.string().trim().min(2).max(50),
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

    // 1) buat user admin unit
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email_admin,
      password: data.password,
      email_confirm: true,
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Gagal membuat user");

    // 2) insert business unit (trigger auto-provision COA)
    const { data: unit, error: uErr } = await supabaseAdmin
      .from("business_units")
      .insert({
        nama_unit: data.nama_unit,
        kode_unit: data.kode_unit.toUpperCase(),
        jenis_unit: data.jenis_unit,
      })
      .select()
      .single();
    if (uErr || !unit) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(uErr?.message ?? "Gagal membuat unit");
    }

    // 3) assign role admin_unit
    const { error: rErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: created.user.id,
      role: "admin_unit",
      unit_id: unit.id,
    });
    if (rErr) throw new Error(rErr.message);

    return { unit_id: unit.id, user_id: created.user.id };
  });

const PromoteSchema = z.object({ email: z.string().email() });

/** Promosi user yang sudah login menjadi super_admin (digunakan saat bootstrap pertama kali). */
export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PromoteSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Hanya berjalan jika belum ada super_admin sama sekali
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");
    if ((count ?? 0) > 0) throw new Error("Super admin sudah terdaftar.");

    // user yang memanggil HARUS email yang sama
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
