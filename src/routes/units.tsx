import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Building2, ExternalLink, Copy, Check } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/units")({
  head: () => ({ meta: [{ title: "Unit Usaha — ERP BUMDes" }] }),
  component: () => <Protected require="tenant_admin"><UnitsPage /></Protected>,
});

const JENIS_OPTIONS = ["Dagang", "Budidaya", "Jasa", "Simpan Pinjam", "Produksi", "Lainnya"];

interface CredentialResult {
  unit_id: string; credential_id: string; login_code: string;
  email_virtual: string; role: string; access_status: string;
}

function UnitsPage() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { user, tenantId, currentTenant } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [credential, setCredential] = useState<CredentialResult | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["unit-templates"],
    queryFn: async () => (await supabase.from("unit_templates").select("id, nama_template, kode_template, deskripsi, is_default").order("nama_template")).data ?? [],
  });

  const { data: managers } = useQuery({
    queryKey: ["profiles-managers", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, default_tenant_id")
        .or(`default_tenant_id.eq.${tenantId},default_tenant_id.is.null`);
      return data ?? [];
    },
  });

  const { data: units, isLoading } = useQuery({
    queryKey: ["units", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase
        .from("business_units")
        .select("*, template:unit_templates(nama_template, kode_template)")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    kode_unit: "", nama_unit: "", jenis_unit: "Dagang", template_id: "", manager_user_id: "",
  });

  useEffect(() => {
    if (templates && templates.length > 0 && !form.template_id) {
      const def = templates.find((t: any) => t.is_default) ?? templates[0];
      setForm((f) => ({ ...f, template_id: def.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) { toast.error("Tenant BUMDes tidak ditemukan untuk akun ini."); return; }
    if (!form.manager_user_id) { toast.error("Manager unit wajib dipilih."); return; }
    if (!user) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("create_business_unit_with_manager", {
        _tenant_id: tenantId,
        _template_id: form.template_id || (null as unknown as string),
        _kode_unit: form.kode_unit.trim().toUpperCase(),
        _nama_unit: form.nama_unit.trim(),
        _jenis_unit: form.jenis_unit,
        _manager_user_id: form.manager_user_id,
        _generated_by: user.id,
      });
      if (error) throw error;
      const row = (data as any[])?.[0] as CredentialResult | undefined;
      if (!row) throw new Error("RPC tidak mengembalikan data kredensial.");
      toast.success(`Unit "${form.nama_unit}" berhasil dibuat.`);
      setOpen(false);
      setCredential(row);
      setForm((f) => ({ ...f, kode_unit: "", nama_unit: "", manager_user_id: "" }));
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["units-summary"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat unit");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Unit Usaha {currentTenant?.nama_bumdes ?? ""}</h2>
          <p className="text-sm text-muted-foreground">
            Kelola unit usaha BUMDes. Saat unit dibuat, sistem otomatis menyiapkan dashboard unit dan kredensial akses manager unit.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Tambah Unit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Unit Usaha</DialogTitle>
              <DialogDescription>
                Backend akan otomatis menyiapkan COA, accounting rules, role manager, login code, dan email virtual.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Kode Unit</Label>
                  <Input required value={form.kode_unit} onChange={(e) => setForm({ ...form, kode_unit: e.target.value.toUpperCase() })} placeholder="DGG" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Unit</Label>
                  <Input required value={form.nama_unit} onChange={(e) => setForm({ ...form, nama_unit: e.target.value })} placeholder="Unit Dagang Sembako" />
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

              <div className="space-y-2">
                <Label>Template Unit</Label>
                <Select value={form.template_id} onValueChange={(v) => setForm({ ...form, template_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih template…" /></SelectTrigger>
                  <SelectContent>
                    {(templates ?? []).map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.nama_template} ({t.kode_template})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Menentukan COA, accounting rules, dan sidebar dashboard unit.</p>
              </div>

              <div className="space-y-2">
                <Label>Manager Unit</Label>
                <Select value={form.manager_user_id} onValueChange={(v) => setForm({ ...form, manager_user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih manager…" /></SelectTrigger>
                  <SelectContent>
                    {(managers ?? []).map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>{m.full_name || m.id.slice(0, 8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">User ini akan diberi role manager_unit & kredensial login otomatis.</p>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Buat Unit"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Nama Unit</th>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (units?.length ?? 0) === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Belum ada unit usaha. Klik "Tambah Unit" untuk memulai.
              </td></tr>
            )}
            {(units ?? []).map((u: any) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.nama_unit}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.kode_unit}</td>
                <td className="px-4 py-3">{u.jenis_unit}</td>
                <td className="px-4 py-3">{u.template?.kode_template ? <Badge variant="secondary">{u.template.kode_template}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3"><Badge variant={u.status === "aktif" ? "default" : "secondary"}>{u.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => nav({ to: "/unit/dashboard/$unitId", params: { unitId: u.id } })}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Lihat Dashboard
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CredentialModal credential={credential} onClose={() => setCredential(null)} onOpenDashboard={(uid) => { setCredential(null); nav({ to: "/unit/dashboard/$unitId", params: { unitId: uid } }); }} />
    </div>
  );
}

function CredentialModal({
  credential, onClose, onOpenDashboard,
}: { credential: CredentialResult | null; onClose: () => void; onOpenDashboard: (uid: string) => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, val: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(label);
    toast.success(`${label} disalin`);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Dialog open={!!credential} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unit berhasil dibuat</DialogTitle>
          <DialogDescription>
            Unit usaha berhasil dibuat. Sistem juga sudah menyiapkan kredensial awal untuk manager unit. Simpan informasi ini sekarang — ditampilkan satu kali.
          </DialogDescription>
        </DialogHeader>
        {credential && (
          <div className="space-y-3 text-sm">
            <Field label="Unit ID" value={credential.unit_id} mono />
            <Field label="Credential ID" value={credential.credential_id} mono />
            <Field label="Login Code" value={credential.login_code} mono onCopy={() => copy("Login Code", credential.login_code)} copied={copied === "Login Code"} />
            <Field label="Email Virtual" value={credential.email_virtual} mono onCopy={() => copy("Email Virtual", credential.email_virtual)} copied={copied === "Email Virtual"} />
            <div className="grid grid-cols-3 gap-3">
              <div><div className="text-xs text-muted-foreground">Role</div><div className="font-medium">{credential.role}</div></div>
              <div><div className="text-xs text-muted-foreground">Access Status</div><div className="font-medium">{credential.access_status}</div></div>
              <div><div className="text-xs text-muted-foreground">Ubah Password</div><div className="font-medium">Ya</div></div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          {credential && (
            <Button onClick={() => onOpenDashboard(credential.unit_id)}>
              <ExternalLink className="h-4 w-4 mr-1" /> Masuk ke Dashboard Unit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono, onCopy, copied }: { label: string; value: string; mono?: boolean; onCopy?: () => void; copied?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 mt-0.5">
        <div className={`flex-1 rounded border bg-muted/30 px-2 py-1.5 text-xs ${mono ? "font-mono" : ""} break-all`}>{value}</div>
        {onCopy && (
          <Button type="button" variant="ghost" size="sm" onClick={onCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
