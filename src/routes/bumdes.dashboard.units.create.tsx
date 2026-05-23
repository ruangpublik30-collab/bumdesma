import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/bumdes/dashboard/units/create")({
  head: () => ({ meta: [{ title: "Tambah Unit Usaha — ERP BUMDes" }] }),
  component: () => <Protected require="tenant_admin"><CreateUnitPage /></Protected>,
});

const JENIS_OPTIONS = ["Dagang", "Budidaya", "Jasa", "Simpan Pinjam", "Produksi", "Lainnya"];

interface ProvisionResult {
  success: true;
  unit_id: string;
  credential_id: string;
  manager_user_id: string;
  manager_login_email: string;
  temporary_password: string;
  login_code: string;
  email_virtual: string;
  role: string;
  access_status: string;
  must_change_password: boolean;
  redirect_path: string;
}

function CreateUnitPage() {
  const nav = useNavigate();
  const { tenantId, currentTenant } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(ProvisionResult & { nama_unit: string; kode_unit: string }) | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["unit-templates"],
    queryFn: async () =>
      (await supabase
        .from("unit_templates")
        .select("id, nama_template, kode_template")
        .order("nama_template")).data ?? [],
  });

  const [form, setForm] = useState({
    template_id: "",
    kode_unit: "",
    nama_unit: "",
    jenis_unit: "Dagang",
    manager_full_name: "",
    manager_email: "",
    temporary_password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tenantId) {
      setError("Tenant BUMDes tidak ditemukan untuk akun ini.");
      return;
    }
    if (form.temporary_password.length < 8) {
      setError("Password awal minimal 8 karakter.");
      return;
    }
    setBusy(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke(
        "provision-unit-with-manager",
        {
          body: {
            tenant_id: tenantId,
            template_id: form.template_id || null,
            kode_unit: form.kode_unit,
            nama_unit: form.nama_unit,
            jenis_unit: form.jenis_unit,
            manager_full_name: form.manager_full_name,
            manager_email: form.manager_email,
            temporary_password: form.temporary_password,
          },
        },
      );
      if (fnErr) throw new Error(fnErr.message);
      if (!data || data.success !== true) {
        throw new Error(data?.error ?? "Gagal membuat unit");
      }
      setResult({ ...(data as ProvisionResult), nama_unit: form.nama_unit, kode_unit: form.kode_unit.toUpperCase() });
      toast.success("Unit berhasil dibuat");
    } catch (err: any) {
      const msg = err?.message ?? "Gagal membuat unit";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (result) return <CredentialPanel result={result} onBack={() => nav({ to: "/units" })} onDashboard={() => nav({ to: "/unit/dashboard/$unitId", params: { unitId: result.unit_id } })} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Tambah Unit Usaha</h2>
          <p className="text-sm text-muted-foreground">
            {currentTenant?.nama_bumdes ?? "BUMDes"} — sistem akan menyiapkan akun manager unit, COA, dan kredensial otomatis.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/units"><ArrowLeft className="h-4 w-4 mr-1" /> Kembali</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Unit & Manager</CardTitle>
          <CardDescription>
            Password awal hanya ditampilkan satu kali setelah berhasil. Simpan baik-baik dan serahkan kepada Manager Unit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Template Unit (opsional)</Label>
              <Select value={form.template_id} onValueChange={(v) => setForm({ ...form, template_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih template…" /></SelectTrigger>
                <SelectContent>
                  {(templates ?? []).map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nama_template} ({t.kode_template})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Menentukan COA & sidebar dashboard unit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode_unit">Kode Unit</Label>
                <Input id="kode_unit" required value={form.kode_unit} onChange={(e) => setForm({ ...form, kode_unit: e.target.value.toUpperCase() })} placeholder="DGG / TOKO01 / SAPROTAN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_unit">Nama Unit</Label>
                <Input id="nama_unit" required value={form.nama_unit} onChange={(e) => setForm({ ...form, nama_unit: e.target.value })} placeholder="Unit Sarpras Pertanian" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jenis Unit</Label>
              <Select value={form.jenis_unit} onValueChange={(v) => setForm({ ...form, jenis_unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JENIS_OPTIONS.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Akun Manager Unit</h3>
              <p className="text-xs text-muted-foreground">
                Email login adalah email asli Manager (bukan email virtual internal).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager_full_name">Nama Manager Unit</Label>
              <Input id="manager_full_name" required value={form.manager_full_name} onChange={(e) => setForm({ ...form, manager_full_name: e.target.value })} placeholder="Budi Santoso" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_email">Email Login Manager</Label>
                <Input id="manager_email" type="email" required value={form.manager_email} onChange={(e) => setForm({ ...form, manager_email: e.target.value })} placeholder="manager@contoh.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporary_password">Password Awal</Label>
                <Input id="temporary_password" type="password" minLength={8} required value={form.temporary_password} onChange={(e) => setForm({ ...form, temporary_password: e.target.value })} placeholder="Min. 8 karakter" />
                <p className="text-xs text-muted-foreground">Ditampilkan sekali setelah berhasil. Manager wajib mengganti saat login pertama.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => nav({ to: "/units" })} disabled={busy}>Batal</Button>
              <Button type="submit" disabled={busy}>{busy ? "Memproses…" : "Buat Unit & Akun Manager"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CredentialPanel({
  result, onBack, onDashboard,
}: { result: ProvisionResult & { nama_unit: string; kode_unit: string }; onBack: () => void; onDashboard: () => void }) {
  const [copied, setCopied] = useState(false);

  const text =
    `Unit: ${result.nama_unit} (${result.kode_unit})\n` +
    `Email Login: ${result.manager_login_email}\n` +
    `Password Awal: ${result.temporary_password}\n` +
    `Login Code: ${result.login_code}\n` +
    `Email Virtual: ${result.email_virtual}\n` +
    `Role: ${result.role}\n` +
    `Status Akses: ${result.access_status}`;

  const copyAll = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credential disalin");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Unit berhasil dibuat</AlertTitle>
        <AlertDescription>
          Simpan kredensial di bawah ini sekarang. Password awal tidak akan ditampilkan lagi.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Credential Manager Unit</CardTitle>
          <CardDescription>Serahkan informasi ini langsung kepada Manager Unit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Nama Unit" value={result.nama_unit} />
          <Row label="Kode Unit" value={result.kode_unit} mono />
          <Separator />
          <Row label="Email Login Manager" value={result.manager_login_email} mono />
          <Row label="Password Awal Manager" value={result.temporary_password} mono highlight />
          <Separator />
          <Row label="Login Code" value={result.login_code} mono />
          <Row label="Email Virtual Internal" value={result.email_virtual} mono />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Row label="Role" value={result.role} />
            <Row label="Status Akses" value={result.access_status} />
          </div>
          <Separator />
          <Row label="Link Dashboard Unit" value={result.redirect_path} mono />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar Unit
        </Button>
        <Button variant="outline" onClick={copyAll}>
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          Salin Credential
        </Button>
        <Button onClick={onDashboard}>
          <ExternalLink className="h-4 w-4 mr-1" /> Masuk ke Dashboard Unit
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-0.5 rounded border px-2 py-1.5 text-sm break-all ${mono ? "font-mono" : ""} ${highlight ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300/60" : "bg-muted/30"}`}>
        {value}
      </div>
    </div>
  );
}
