import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/purchases")({
  component: PurchasesPage,
});

function StatusBadge({ value }: { value: string | null }) {
  const v = (value ?? "").toLowerCase();
  const tone = v === "posted" ? "bg-success/15 text-success" : v === "draft" ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{value ?? "—"}</span>;
}

function PurchasesPage() {
  const { unitId } = Route.useParams();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["unit-gr", unitId] });

  const { data, isLoading } = useQuery({
    queryKey: ["unit-gr", unitId],
    queryFn: async () => {
      const { data } = await supabase
        .from("goods_receipts")
        .select("id, nomor_gr, tanggal_gr, status, payment_status, supplier:suppliers(nama_supplier), lines:goods_receipt_lines(subtotal)")
        .eq("unit_id", unitId)
        .order("tanggal_gr", { ascending: false })
        .limit(200);
      return (data ?? []).map((g: any) => ({ ...g, total: (g.lines ?? []).reduce((s: number, l: any) => s + Number(l.subtotal ?? 0), 0) }));
    },
  });

  const post = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("post_goods_receipt", { p_gr_id: id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("GR diposting & stok diupdate"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Pembelian / Goods Receipt</h2>
          <p className="text-sm text-muted-foreground">Buat draft penerimaan barang, lalu posting untuk update stok & utang otomatis.</p>
        </div>
        <CreateGrDialog unitId={unitId} onSuccess={invalidate} />
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nomor</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Supplier</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Pembayaran</th>
            <th className="px-4 py-3 font-medium text-right">Aksi</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada GR</td></tr>}
            {(data ?? []).map((g: any) => (
              <tr key={g.id}>
                <td className="px-4 py-3 font-mono text-xs">{g.nomor_gr}</td>
                <td className="px-4 py-3">{formatDate(g.tanggal_gr)}</td>
                <td className="px-4 py-3">{g.supplier?.nama_supplier ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(g.total)}</td>
                <td className="px-4 py-3"><StatusBadge value={g.status} /></td>
                <td className="px-4 py-3"><StatusBadge value={g.payment_status} /></td>
                <td className="px-4 py-3 text-right">
                  {String(g.status).toLowerCase() === "draft" && (
                    <Button size="sm" disabled={post.isPending} onClick={() => post.mutate(g.id)}>
                      <Send className="h-3.5 w-3.5 mr-1" />Posting
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type Line = { item_id: string; qty: string; harga_beli: string };

function CreateGrDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerm, setPaymentTerm] = useState<"cash" | "credit">("credit");
  const [lines, setLines] = useState<Line[]>([{ item_id: "", qty: "1", harga_beli: "0" }]);

  const { data: suppliers } = useQuery({
    queryKey: ["gr-sup", unitId], enabled: open,
    queryFn: async () => (await supabase.from("suppliers").select("id, nama_supplier").eq("unit_id", unitId).order("nama_supplier")).data ?? [],
  });
  const { data: items } = useQuery({
    queryKey: ["gr-item", unitId], enabled: open,
    queryFn: async () => (await supabase.from("inventory_items").select("id, nama_barang, harga_beli").eq("unit_id", unitId).order("nama_barang")).data ?? [],
  });

  const total = useMemo(() => lines.reduce((s, l) => s + Number(l.qty || 0) * Number(l.harga_beli || 0), 0), [lines]);

  const m = useMutation({
    mutationFn: async () => {
      const nomor = `GR-${Date.now()}`;
      const { data: gr, error } = await supabase.from("goods_receipts").insert({
        unit_id: unitId,
        supplier_id: supplierId,
        nomor_gr: nomor,
        tanggal_gr: tanggal,
        payment_term: paymentTerm,
        status: "draft",
      }).select("id").single();
      if (error) throw error;

      const payload = lines
        .filter((l) => l.item_id && Number(l.qty) > 0)
        .map((l) => ({
          gr_id: gr!.id,
          item_id: l.item_id,
          qty: Number(l.qty),
          harga_beli: Number(l.harga_beli),
          subtotal: Number(l.qty) * Number(l.harga_beli),
        }));
      if (payload.length === 0) throw new Error("Minimal 1 baris barang");
      const { error: e2 } = await supabase.from("goods_receipt_lines").insert(payload);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Draft GR dibuat. Klik Posting untuk update stok & utang.");
      setOpen(false);
      setLines([{ item_id: "", qty: "1", harga_beli: "0" }]);
      setSupplierId("");
      onSuccess();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const setLine = (idx: number, patch: Partial<Line>) => setLines((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const onPickItem = (idx: number, id: string) => {
    const it = (items ?? []).find((x: any) => x.id === id);
    setLine(idx, { item_id: id, harga_beli: it ? String(it.harga_beli) : "0" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Buat GR Baru</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Goods Receipt Baru</DialogTitle></DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
          <div className="col-span-2 space-y-1.5"><Label>Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
              <SelectContent>{(suppliers ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nama_supplier}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Term Pembayaran</Label>
            <Select value={paymentTerm} onValueChange={(v: any) => setPaymentTerm(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit (jadi Utang)</SelectItem>
                <SelectItem value="cash">Cash (langsung lunas)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Baris Barang</div>
          {lines.map((l, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6">
                <Select value={l.item_id} onValueChange={(v) => onPickItem(idx, v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                  <SelectContent>{(items ?? []).map((i: any) => <SelectItem key={i.id} value={i.id}>{i.nama_barang}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Input type="number" placeholder="Qty" value={l.qty} onChange={(e) => setLine(idx, { qty: e.target.value })} /></div>
              <div className="col-span-3"><Input type="number" placeholder="Harga" value={l.harga_beli} onChange={(e) => setLine(idx, { harga_beli: e.target.value })} /></div>
              <div className="col-span-1"><Button size="icon" variant="ghost" onClick={() => setLines((p) => p.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setLines((p) => [...p, { item_id: "", qty: "1", harga_beli: "0" }])}>+ Tambah Baris</Button>
        </div>
        <div className="text-right font-semibold">Total: {formatIDR(total)}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!supplierId || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Menyimpan…" : "Simpan Draft"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
