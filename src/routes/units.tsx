import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createBusinessUnit } from "@/lib/units.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Building2 } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/units")({
  head: () => ({ meta: [{ title: "Unit Usaha — ERP BUMDes" }] }),
  component: () => <Protected require="tenant_admin"><UnitsPage /></Protected>,
});

const CUSTOM = "__custom__";

function UnitsPage() {
  const qc = useQueryClient();
  const { tenantId, currentTenant } = useAuth();
  const create = useServerFn(createBusinessUnit);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: templates } = useQuery({
    queryKey: ["unit-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_templates")
        .select("id, nama_template, kode_template, deskripsi, is_default")
        .order("nama_template");
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; nama_template: string; kode_template: string; deskripsi: string | null; is_default: boolean }>;
    },
  });

  const [form, setForm] = useState({
    nama_unit: "",
    kode_unit: "",
    template_choice: CUSTOM as string,
    jenis_unit_custom: "",
  });

  useEffect(() => {
    if (templates && templates.length > 0 && form.template_choice === CUSTOM) {
      const def = templates.find((t) => t.is_default) ?? templates[0];
      setForm((f) => ({ ...f, template_choice: def.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  const { data: units, isLoading } = useQuery({
    queryKey: ["units", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_units")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) { toast.error("BUMDes belum terdeteksi pada sesi Anda."); return; }
    setBusy(true);
    try {
      const isCustom = form.template_choice === CUSTOM;
      const tpl = !isCustom ? templates?.find((t) => t.id === form.template_choice) : null;
      const jenis = isCustom ? form.jenis_unit_custom.trim() : tpl?.nama_template ?? "Custom";
      if (isCustom && !jenis) {
        toast.error("Isi nama jenis unit custom.");
        setBusy(false);
        return;
      }
      await create({
        data: {
          tenant_id: tenantId,
          nama_unit: form.nama_unit,
          kode_unit: form.kode_unit,
          jenis_unit: jenis,
          template_id: isCustom ? null : form.template_choice,
        },
      });
      toast.success(`Unit "${form.nama_unit}" berhasil dibuat. Bagan akun disiapkan otomatis.`);
      setOpen(false);
      const def = templates?.find((t) => t.is_default) ?? templates?.[0];
      setForm({ nama_unit: "", kode_unit: "", template_choice: def?.id ?? CUSTOM, jenis_unit_custom: "" });
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["units-filter"] });
      qc.invalidateQueries({ queryKey: ["units-summary"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat unit");
    } finally {
      setBusy(false);
    }
  };

  const selectedTplDesc =
    form.template_choice !== CUSTOM
      ? templates?.find((t) => t.id === form.template_choice)?.deskripsi
      : "Hanya menyiapkan bagan akun universal. Akun spesifik dapat ditambah kemudian.";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Unit Usaha {currentTenant?.nama_bumdes ?? ""}</h2>
          <p className="text-sm text-muted-foreground">
            Tambah unit usaha baru — sistem otomatis menyiapkan bagan akun keuangannya.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Tambah Unit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Unit Usaha Baru</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nama Unit</Label>
                  <Input required value={form.nama_unit} onChange={(e) => setForm({ ...form, nama_unit: e.target.value })} placeholder="Unit Dagang Sembako" />
                </div>
                <div className="space-y-2">
                  <Label>Kode Unit</Label>
                  <Input required value={form.kode_unit} onChange={(e) => setForm({ ...form, kode_unit: e.target.value.toUpperCase() })} placeholder="DGG" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Template Unit</Label>
                <Select value={form.template_choice} onValueChange={(v) => setForm({ ...form, template_choice: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih template…" /></SelectTrigger>
                  <SelectContent>
                    {(templates ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nama_template}</SelectItem>
                    ))}
                    <SelectItem value={CUSTOM}>Custom Unit (tanpa template)</SelectItem>
                  </SelectContent>
                </Select>
                {selectedTplDesc && (
                  <p className="text-xs text-muted-foreground">{selectedTplDesc}</p>
                )}
              </div>

              {form.template_choice === CUSTOM && (
                <div className="space-y-2">
                  <Label>Nama Jenis Unit (Custom)</Label>
                  <Input
                    required
                    value={form.jenis_unit_custom}
                    onChange={(e) => setForm({ ...form, jenis_unit_custom: e.target.value })}
                    placeholder="cth: Energi Surya Desa"
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="submit" disabled={busy}>{busy ? "Memproses…" : "Buat Unit"}</Button>
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
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (units?.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Belum ada unit usaha. Klik "Tambah Unit" untuk memulai.
              </td></tr>
            )}
            {(units ?? []).map((u: any) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.nama_unit}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.kode_unit}</td>
                <td className="px-4 py-3">{u.jenis_unit}</td>
                <td className="px-4 py-3"><span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">{u.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
