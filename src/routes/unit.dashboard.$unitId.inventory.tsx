import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const { unitId } = Route.useParams();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["unit-inventory", unitId] });

  const { data, isLoading } = useQuery({
    queryKey: ["unit-inventory", unitId],
    queryFn: async () => (await supabase.from("inventory_items").select("*").eq("unit_id", unitId).order("nama_barang")).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Persediaan Barang</h2>
          <p className="text-sm text-muted-foreground">Master barang & nilai persediaan unit.</p>
        </div>
        <AddItemDialog unitId={unitId} onSuccess={invalidate} />
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Kode</th>
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Satuan</th>
            <th className="px-4 py-3 font-medium text-right">Harga Beli</th>
            <th className="px-4 py-3 font-medium text-right">Harga Jual</th>
            <th className="px-4 py-3 font-medium text-right">Stok Awal</th>
            <th className="px-4 py-3 font-medium text-right">Aksi</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada barang</td></tr>}
            {(data ?? []).map((it: any) => (
              <tr key={it.id}>
                <td className="px-4 py-3 font-mono text-xs">{it.kode_barang ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{it.nama_barang}</td>
                <td className="px-4 py-3">{it.satuan}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(it.harga_beli))}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(it.harga_jual))}</td>
                <td className="px-4 py-3 text-right">{Number(it.stok_awal)}</td>
                <td className="px-4 py-3 text-right"><UpdateMasterDialog item={it} onSuccess={invalidate} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddItemDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ kode_barang: "", nama_barang: "", satuan: "pcs", harga_beli: "0", harga_jual: "0", stok_awal: "0" });
  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("inventory_items").insert({
        unit_id: unitId,
        kode_barang: f.kode_barang || null,
        nama_barang: f.nama_barang,
        satuan: f.satuan,
        harga_beli: Number(f.harga_beli),
        harga_jual: Number(f.harga_jual),
        stok_awal: Number(f.stok_awal),
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Barang ditambahkan"); setOpen(false); onSuccess(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Tambah Barang</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Barang</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Kode</Label><Input value={f.kode_barang} onChange={(e) => setF({ ...f, kode_barang: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Satuan</Label><Input value={f.satuan} onChange={(e) => setF({ ...f, satuan: e.target.value })} /></div>
          <div className="col-span-2 space-y-1.5"><Label>Nama Barang</Label><Input value={f.nama_barang} onChange={(e) => setF({ ...f, nama_barang: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Harga Beli</Label><Input type="number" value={f.harga_beli} onChange={(e) => setF({ ...f, harga_beli: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Harga Jual</Label><Input type="number" value={f.harga_jual} onChange={(e) => setF({ ...f, harga_jual: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Stok Awal</Label><Input type="number" value={f.stok_awal} onChange={(e) => setF({ ...f, stok_awal: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!f.nama_barang || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Menyimpan…" : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UpdateMasterDialog({ item, onSuccess }: { item: any; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nama_barang: item.nama_barang, satuan: item.satuan, harga_beli: String(item.harga_beli), harga_jual: String(item.harga_jual) });
  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("update_inventory_item_master", {
        p_item_id: item.id,
        p_nama_barang: f.nama_barang,
        p_satuan: f.satuan,
        p_harga_beli: Number(f.harga_beli),
        p_harga_jual: Number(f.harga_jual),
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Master barang diupdate"); setOpen(false); onSuccess(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Master Barang</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5"><Label>Nama</Label><Input value={f.nama_barang} onChange={(e) => setF({ ...f, nama_barang: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Satuan</Label><Input value={f.satuan} onChange={(e) => setF({ ...f, satuan: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Harga Beli</Label><Input type="number" value={f.harga_beli} onChange={(e) => setF({ ...f, harga_beli: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Harga Jual</Label><Input type="number" value={f.harga_jual} onChange={(e) => setF({ ...f, harga_jual: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Menyimpan…" : "Update via RPC"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
