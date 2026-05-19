import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/master-data")({
  head: () => ({ meta: [{ title: "Master Data — ERP BUMDes" }] }),
  component: () => <Protected require="tenant"><MasterPage /></Protected>,
});

function useUnitPicker() {
  const { isTenantAdmin, unitId, tenantId } = useAuth();
  const { data: units } = useQuery({
    queryKey: ["units-md", tenantId],
    enabled: !!tenantId,
    queryFn: async () =>
      (await supabase.from("business_units").select("id, nama_unit").eq("tenant_id", tenantId!).order("nama_unit")).data ?? [],
  });
  const [selected, setSelected] = useState<string | null>(unitId);
  const active = isTenantAdmin ? selected : unitId;
  return { units: units ?? [], active, selected, setSelected, isTenantAdmin };
}

function UnitPicker({ value, onChange, units, show }: { value: string | null; onChange: (v: string) => void; units: any[]; show: boolean }) {
  if (!show) return null;
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Unit</Label>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="min-w-[240px]"><SelectValue placeholder="Pilih unit…" /></SelectTrigger>
        <SelectContent>{units.map((u) => <SelectItem key={u.id} value={u.id}>{u.nama_unit}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function MasterPage() {
  const u = useUnitPicker();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Master Data</h2>
          <p className="text-sm text-muted-foreground">Kelola pelanggan, pemasok, dan barang per unit usaha.</p>
        </div>
        <UnitPicker value={u.selected} onChange={u.setSelected} units={u.units} show={u.isTenantAdmin} />
      </div>

      {!u.active && <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">Pilih unit dahulu.</div>}

      {u.active && (
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Pelanggan</TabsTrigger>
            <TabsTrigger value="suppliers">Pemasok</TabsTrigger>
            <TabsTrigger value="items">Barang</TabsTrigger>
          </TabsList>
          <TabsContent value="customers"><CustomersTab unitId={u.active} /></TabsContent>
          <TabsContent value="suppliers"><SuppliersTab unitId={u.active} /></TabsContent>
          <TabsContent value="items"><ItemsTab unitId={u.active} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function CustomersTab({ unitId }: { unitId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["customers", unitId],
    queryFn: async () => (await supabase.from("customers").select("*").eq("unit_id", unitId).order("nama_customer")).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nama: "", kontak: "", alamat: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("customers").insert({ unit_id: unitId, nama_customer: f.nama, kontak: f.kontak || null, alamat: f.alamat || null });
    if (error) return toast.error(error.message);
    toast.success("Pelanggan ditambahkan"); setOpen(false); setF({ nama: "", kontak: "", alamat: "" });
    qc.invalidateQueries({ queryKey: ["customers", unitId] });
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Tambah Pelanggan</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5"><Label>Nama</Label><Input required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Kontak</Label><Input value={f.kontak} onChange={(e) => setF({ ...f, kontak: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Alamat</Label><Input value={f.alamat} onChange={(e) => setF({ ...f, alamat: e.target.value })} /></div>
              <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left"><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Kontak</th><th className="px-4 py-3">Alamat</th></tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">Belum ada pelanggan.</td></tr>}
            {(data ?? []).map((c: any) => (<tr key={c.id}><td className="px-4 py-2 font-medium">{c.nama_customer}</td><td className="px-4 py-2">{c.kontak ?? "-"}</td><td className="px-4 py-2 text-muted-foreground">{c.alamat ?? "-"}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuppliersTab({ unitId }: { unitId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", unitId],
    queryFn: async () => (await supabase.from("suppliers").select("*").eq("unit_id", unitId).order("nama_supplier")).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nama: "", kontak: "", alamat: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("suppliers").insert({ unit_id: unitId, nama_supplier: f.nama, kontak: f.kontak || null, alamat: f.alamat || null });
    if (error) return toast.error(error.message);
    toast.success("Pemasok ditambahkan"); setOpen(false); setF({ nama: "", kontak: "", alamat: "" });
    qc.invalidateQueries({ queryKey: ["suppliers", unitId] });
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Tambah Pemasok</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Pemasok</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5"><Label>Nama Pemasok</Label><Input required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Kontak</Label><Input value={f.kontak} onChange={(e) => setF({ ...f, kontak: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Alamat</Label><Input value={f.alamat} onChange={(e) => setF({ ...f, alamat: e.target.value })} /></div>
              <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left"><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Kontak</th><th className="px-4 py-3">Alamat</th></tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">Belum ada pemasok.</td></tr>}
            {(data ?? []).map((c: any) => (<tr key={c.id}><td className="px-4 py-2 font-medium">{c.nama_supplier}</td><td className="px-4 py-2">{c.kontak ?? "-"}</td><td className="px-4 py-2 text-muted-foreground">{c.alamat ?? "-"}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemsTab({ unitId }: { unitId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["items", unitId],
    queryFn: async () => (await supabase.from("inventory_items").select("*").eq("unit_id", unitId).order("nama_barang")).data ?? [],
  });
  const { data: stock } = useQuery({
    queryKey: ["stock", unitId],
    queryFn: async () => (await supabase.from("v_inventory_stock").select("item_id, qty_saldo").eq("unit_id", unitId)).data ?? [],
  });
  const stockMap = new Map((stock ?? []).map((s: any) => [s.item_id, Number(s.qty_saldo)]));
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ kode: "", nama: "", satuan: "pcs", harga_beli: "", harga_jual: "", stok_awal: "0" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("inventory_items").insert({
      unit_id: unitId, kode_barang: f.kode || null, nama_barang: f.nama, satuan: f.satuan,
      harga_beli: Number(f.harga_beli) || 0, harga_jual: Number(f.harga_jual) || 0, stok_awal: Number(f.stok_awal) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Barang ditambahkan"); setOpen(false);
    setF({ kode: "", nama: "", satuan: "pcs", harga_beli: "", harga_jual: "", stok_awal: "0" });
    qc.invalidateQueries({ queryKey: ["items", unitId] });
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Tambah Barang</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Barang</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Kode</Label><Input value={f.kode} onChange={(e) => setF({ ...f, kode: e.target.value })} placeholder="BRG-001" /></div>
                <div className="space-y-1.5"><Label>Satuan</Label><Input value={f.satuan} onChange={(e) => setF({ ...f, satuan: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Nama Barang</Label><Input required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label>Harga Beli</Label><Input type="number" value={f.harga_beli} onChange={(e) => setF({ ...f, harga_beli: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Harga Jual</Label><Input type="number" value={f.harga_jual} onChange={(e) => setF({ ...f, harga_jual: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Stok Awal</Label><Input type="number" value={f.stok_awal} onChange={(e) => setF({ ...f, stok_awal: e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3">Kode</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Satuan</th>
            <th className="px-4 py-3 text-right">Harga Beli</th><th className="px-4 py-3 text-right">Harga Jual</th><th className="px-4 py-3 text-right">Stok</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada barang.</td></tr>}
            {(data ?? []).map((i: any) => (
              <tr key={i.id}>
                <td className="px-4 py-2 font-mono text-xs">{i.kode_barang ?? "-"}</td>
                <td className="px-4 py-2 font-medium">{i.nama_barang}</td>
                <td className="px-4 py-2">{i.satuan}</td>
                <td className="px-4 py-2 text-right">{formatIDR(i.harga_beli)}</td>
                <td className="px-4 py-2 text-right">{formatIDR(i.harga_jual)}</td>
                <td className="px-4 py-2 text-right font-medium">{stockMap.get(i.id) ?? Number(i.stok_awal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
