import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { bootstrapSuperAdmin } from "@/lib/units.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Masuk — ERP BUMDes" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, refreshRoles } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const bootstrap = useServerFn(bootstrapSuperAdmin);

  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Berhasil masuk");
        await refreshRoles();
        nav({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        // Coba bootstrap super admin pertama
        try {
          await bootstrap({ data: { email } });
          toast.success("Akun Super Admin BUMDes berhasil dibuat.");
        } catch {
          toast.success("Akun terdaftar. Hubungi Super Admin untuk diberi peran unit.");
        }
        await refreshRoles();
        nav({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-bold">B</div>
          <span className="font-display font-semibold">ERP BUMDes</span>
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Akuntansi terintegrasi<br />untuk seluruh unit usaha desa.
          </h2>
          <p className="mt-3 text-sm opacity-80 max-w-md">
            Satu platform untuk mengelola seluruh unit usaha BUMDes — dari pencatatan jurnal harian hingga laporan keuangan konsolidasi.
          </p>
        </div>
        <div className="text-xs opacity-70">Sistem akuntansi multi-unit usaha desa</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-display text-2xl font-semibold">{mode === "login" ? "Masuk ke Sistem" : "Daftar Akun Baru"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Gunakan email & kata sandi unit / pusat Anda." : "Akun pertama yang terdaftar otomatis menjadi Super Admin BUMDes."}
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
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
          </Button>
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-sm text-primary hover:underline w-full text-center">
            {mode === "login" ? "Belum punya akun? Daftar Super Admin BUMDes" : "Sudah punya akun? Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
