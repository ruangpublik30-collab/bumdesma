import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createBusinessUnit } from "@/lib/units.functions";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Building2 } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/units")({
  head: () => ({ meta: [{ title: "Manajemen Unit — ERP BUMDes" }] }),
  component: () => <Protected requireSuper><UnitsPage /></Protected>,
});

const JENIS = ["Dagang", "Simpan Pinjam", "Budidaya / Ketahanan Pangan", "Jasa", "Air Bersih", "Wisata", "Lainnya"];

function UnitsPage() {
  const qc = useQueryClient();
  const create = useServerFn(createBusinessUnit);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama_unit: "", kode_unit: "", jenis_unit: JENIS[0], email_admin: "", password: "" });
  const [busy, setBusy] = useState(false);

  const { data: units, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_units").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: form });
      toast.success(`Unit "${form.nama_unit}" berhasil dibuat. COA & login admin otomatis disiapkan.`);
      setOpen(false);
      setForm({ nama_unit: "", kode_unit: "", jenis_unit: JENIS[0], email_admin: "", password: "" });
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["units-summary"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat unit");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Manajemen Unit Usaha</h2>
          <p className="text-sm text-muted-foreground">Tambah unit baru — sistem otomatis menyiapkan bagan akun, login admin, dan modul laporan.</p>
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
                <Label>Jenis Unit</Label>
                <Select value={form.jenis_unit} onValueChange={(v) => setForm({ ...form, jenis_unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JENIS.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email Admin Unit</Label>
                <Input type="email" required value={form.email_admin} onChange={(e) => setForm({ ...form, email_admin: e.target.value })} placeholder="admin.dagang@bumdes.id" />
              </div>
              <div className="space-y-2">
                <Label>Kata Sandi Awal</Label>
                <Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <p className="text-xs text-muted-foreground">Minimal 8 karakter. Sampaikan ke admin unit secara aman.</p>
              </div>
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
