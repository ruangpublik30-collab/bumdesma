import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SubmitSchema = z.object({
  nama_bumdes: z.string().trim().min(2).max(150),
  nama_desa: z.string().trim().min(2).max(100),
  nama_kecamatan: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  nama_pemohon: z.string().trim().min(2).max(150),
  gender: z.string().trim().max(20).optional().nullable(),
  agama: z.string().trim().max(40).optional().nullable(),
  alamat: z.string().trim().max(500).optional().nullable(),
  nomor_whatsapp: z.string().trim().max(30).optional().nullable(),
  email_akses: z.string().trim().email(),
});

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => SubmitSchema.parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("tenant_registrations").insert({
      nama_bumdes: data.nama_bumdes,
      nama_desa: data.nama_desa,
      nama_kecamatan: data.nama_kecamatan,
      email: data.email,
      nama_pemohon: data.nama_pemohon,
      gender: data.gender ?? null,
      agama: data.agama ?? null,
      alamat: data.alamat ?? null,
      nomor_whatsapp: data.nomor_whatsapp ?? null,
      email_akses: data.email_akses,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function assertPlatformAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin_platform")
    .maybeSingle();
  if (!data) throw new Error("Hanya Super Admin Platform yang diizinkan.");
}

function generatePassword(len = 14): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%&";
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += charset[arr[i] % charset.length];
  return out;
}

export const approveRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ registration_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertPlatformAdmin(context.userId);

    // Ambil data registration
    const { data: reg, error: rErr } = await supabaseAdmin
      .from("tenant_registrations")
      .select("*")
      .eq("id", data.registration_id)
      .maybeSingle();
    if (rErr || !reg) throw new Error(rErr?.message ?? "Pendaftaran tidak ditemukan");
    if (reg.status !== "pending") throw new Error("Pendaftaran sudah diproses sebelumnya.");

    // 1. Buat user auth direktur
    const password = generatePassword(14);
    let directorUserId: string | null = null;

    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: reg.email_akses,
      password,
      email_confirm: true,
      user_metadata: { full_name: reg.nama_pemohon },
    });
    if (cErr || !created.user) {
      // Cek apakah user sudah ada
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const u = existing.users.find((x) => x.email === reg.email_akses);
      if (!u) throw new Error(cErr?.message ?? "Gagal membuat akun direktur.");
      directorUserId = u.id;
    } else {
      directorUserId = created.user.id;
    }

    // 2. RPC approve → buat tenant
    const { data: approvalRaw, error: aErr } = await context.supabase.rpc("approve_tenant_registration", {
      _registration_id: data.registration_id,
    });
    if (aErr) {
      // rollback: hapus user yang baru dibuat (kalau memang baru kita yang buat)
      if (created?.user) await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(aErr.message);
    }
    const approval = approvalRaw as { tenant_id: string; kode_bumdes: string; nama_bumdes: string; email_akses: string };

    // 3. Beri role direktur_bumdes
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: directorUserId,
      role: "direktur_bumdes",
      tenant_id: approval.tenant_id,
    });
    if (roleErr && !roleErr.message.includes("duplicate")) throw new Error(roleErr.message);

    // 4. Update default_tenant_id di profile
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: directorUserId, default_tenant_id: approval.tenant_id }, { onConflict: "id" });

    return {
      tenant_id: approval.tenant_id,
      kode_bumdes: approval.kode_bumdes,
      nama_bumdes: approval.nama_bumdes,
      email: approval.email_akses,
      password,
      nama_pemohon: reg.nama_pemohon,
    };
  });

export const rejectRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ registration_id: z.string().uuid(), reason: z.string().trim().min(3).max(500) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertPlatformAdmin(context.userId);
    const { error } = await context.supabase.rpc("reject_tenant_registration", {
      _registration_id: data.registration_id,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
