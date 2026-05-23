// Edge Function: provision-unit-with-manager
// Creates a Supabase Auth user (manager_unit), then calls
// public.create_business_unit_with_manager(...) to create the unit, role,
// and unit_access_credentials. Returns full credential payload (one-time).
//
// Caller must be authenticated as direktur_bumdes or admin_bumdes for the
// target tenant_id.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  tenant_id: string;
  template_id?: string | null;
  kode_unit: string;
  nama_unit: string;
  jenis_unit: string;
  manager_full_name: string;
  manager_email: string;
  temporary_password: string;
}

function bad(status: number, message: string, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ success: false, error: message, ...extra }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return bad(401, "Missing bearer token");

  // 1) Verify caller
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return bad(401, "Unauthorized");
  const callerId = userData.user.id;

  // 2) Parse + validate body
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return bad(400, "Invalid JSON body");
  }
  const required = [
    "tenant_id",
    "kode_unit",
    "nama_unit",
    "jenis_unit",
    "manager_full_name",
    "manager_email",
    "temporary_password",
  ] as const;
  for (const k of required) {
    if (!body[k] || typeof body[k] !== "string" || !String(body[k]).trim()) {
      return bad(400, `Field '${k}' wajib diisi`);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.manager_email)) {
    return bad(400, "Format email manager tidak valid");
  }
  if (body.temporary_password.length < 8) {
    return bad(400, "Password minimal 8 karakter");
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 3) Verify caller has direktur/admin role on tenant
  const { data: roleRows, error: roleErr } = await admin
    .from("user_roles")
    .select("role, tenant_id")
    .eq("user_id", callerId)
    .eq("tenant_id", body.tenant_id);
  if (roleErr) return bad(500, "Gagal memeriksa role: " + roleErr.message);
  const allowed = (roleRows ?? []).some(
    (r: any) => r.role === "direktur_bumdes" || r.role === "admin_bumdes",
  );
  if (!allowed) return bad(403, "Hanya direktur/admin BUMDes yang dapat membuat unit.");

  // 4) Create or reuse Supabase Auth user for the manager
  let managerUserId: string | null = null;
  const created = await admin.auth.admin.createUser({
    email: body.manager_email,
    password: body.temporary_password,
    email_confirm: true,
    user_metadata: { full_name: body.manager_full_name },
  });
  if (created.error) {
    // Reuse if already exists
    const msg = created.error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      // Lookup by email via listUsers (filtered)
      const list = await admin.auth.admin.listUsers();
      const found = list.data.users.find(
        (u: any) => (u.email ?? "").toLowerCase() === body.manager_email.toLowerCase(),
      );
      if (!found) return bad(500, "Email sudah terdaftar tetapi user tidak ditemukan");
      managerUserId = found.id;
      // Reset password to the provided temporary one
      await admin.auth.admin.updateUserById(found.id, {
        password: body.temporary_password,
        user_metadata: { ...(found.user_metadata ?? {}), full_name: body.manager_full_name },
      });
    } else {
      return bad(400, "Gagal membuat user manager: " + created.error.message);
    }
  } else {
    managerUserId = created.data.user!.id;
  }

  // 5) Ensure profile row exists (idempotent)
  await admin.from("profiles").upsert(
    {
      id: managerUserId!,
      full_name: body.manager_full_name,
      default_tenant_id: body.tenant_id,
    },
    { onConflict: "id" },
  );

  // 6) Call governance RPC
  const { data: rpcData, error: rpcErr } = await admin.rpc(
    "create_business_unit_with_manager",
    {
      _tenant_id: body.tenant_id,
      _template_id: body.template_id ?? null,
      _kode_unit: body.kode_unit.trim().toUpperCase(),
      _nama_unit: body.nama_unit.trim(),
      _jenis_unit: body.jenis_unit,
      _manager_user_id: managerUserId!,
      _generated_by: callerId,
    } as any,
  );
  if (rpcErr) return bad(400, "Gagal membuat unit: " + rpcErr.message);

  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row) return bad(500, "RPC tidak mengembalikan data");

  const payload = {
    success: true,
    unit_id: row.unit_id,
    credential_id: row.credential_id,
    manager_user_id: managerUserId,
    manager_login_email: body.manager_email,
    temporary_password: body.temporary_password,
    login_code: row.login_code,
    email_virtual: row.email_virtual,
    role: row.role,
    access_status: row.access_status,
    must_change_password: true,
    redirect_path: `/unit/dashboard/${row.unit_id}`,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
