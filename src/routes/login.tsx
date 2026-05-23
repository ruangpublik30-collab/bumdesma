import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Masuk — ERP BUMDes" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, isPlatformAdmin, refreshRoles } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const routeAfterLogin = async (uid: string) => {
    const { data } = await supabase.rpc("get_user_login_context", { _user_id: uid });
    const ctx = (data as any[])?.[0];
    if (!ctx) { nav({ to: "/dashboard" }); return; }
    if (ctx.role === "super_admin_platform") { nav({ to: "/platform/pendaftaran" }); return; }
    if (ctx.role === "direktur_bumdes" || ctx.role === "admin_bumdes") { nav({ to: "/dashboard" }); return; }
    if (ctx.unit_id) { nav({ to: "/unit/dashboard/$unitId", params: { unitId: ctx.unit_id } }); return; }
    nav({ to: "/dashboard" });
  };

  useEffect(() => {
    if (!loading && user) {
      if (isPlatformAdmin) { nav({ to: "/platform/pendaftaran" }); return; }
      void routeAfterLogin(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, isPlatformAdmin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refreshRoles();
        toast.success("Berhasil masuk");
        if (data.user) await routeAfterLogin(data.user.id);
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Akun berhasil dibuat. Jika ini akun pertama, Anda otomatis menjadi Super Admin Platform.");
        await refreshRoles();
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-[#F4FBF6] p-12 relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#DCFCE7]" />
        <div aria-hidden className="absolute bottom-10 -left-10 h-40 w-40 rounded-full bg-[#FED7AA] opacity-70" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-[#16A34A] text-white grid place-items-center font-bold shadow-sm">B</div>
          <span className="font-display font-semibold text-[#111827]">ERP BUMDes</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-3xl font-bold leading-tight text-[#111827]">
            Platform akuntansi multi-tenant<br />untuk BUMDes seluruh Indonesia.
          </h2>
          <p className="mt-3 text-sm text-[#6B7280] max-w-md">
            Direktur BUMDes mendapat akses setelah pendaftaran disetujui oleh tim platform.
          </p>
          <Link to="/daftar" className="mt-6 inline-flex items-center text-sm font-semibold text-[#2563EB] hover:underline">
            Belum punya akses? Daftarkan BUMDes →
          </Link>
        </div>
        <div className="relative text-xs text-[#6B7280]">Sistem akuntansi multi-unit usaha desa</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#111827]">
              {mode === "login" ? "Masuk ke Sistem" : "Daftar Akun (Super Admin Platform)"}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {mode === "login"
                ? "Gunakan email & kata sandi yang telah diterbitkan platform."
                : "Akun pertama yang mendaftar di sini otomatis menjadi Super Admin Platform. Pendaftaran BUMDes biasa dilakukan di halaman publik."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white" disabled={busy}>
            {busy ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
          </Button>
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-sm text-[#2563EB] hover:underline w-full text-center">
            {mode === "login" ? "Bootstrap akun Super Admin Platform" : "Sudah punya akun? Masuk"}
          </button>
          <div className="text-center text-xs text-[#6B7280] border-t border-[#E5E7EB] pt-4">
            BUMDes baru mendaftar di <Link to="/daftar" className="text-[#2563EB] hover:underline font-medium">/daftar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

