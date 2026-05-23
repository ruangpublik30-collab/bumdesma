import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/pembelian")({
  head: () => ({ meta: [{ title: "Pembelian — ERP BUMDes" }] }),
  component: () => <Protected require="tenant"><Page /></Protected>,
});

function Page() {
  const { isTenantAdmin, unitId, tenantId } = useAuth();
  const { data: units } = useQuery({
    queryKey: ["units-pb", tenantId], enabled: !!tenantId,
    queryFn: async () => (await supabase.from("business_units").select("id, nama_unit").eq("tenant_id", tenantId!).order("nama_unit")).data ?? [],
  });
  const [sel, setSel] = useState<string | null>(unitId);
  const active = isTenantAdmin ? sel : unitId;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:flex-wrap min-w-0">
        <div>
          <h2 className="font-display text-2xl font-bold">Pembelian</h2>
          <p className="text-sm text-muted-foreground">Penerimaan barang & pembayaran ke pemasok. Posting otomatis ke jurnal & stok.</p>
        </div>
        {isTenantAdmin && (
          <div className="space-y-1.5">
            <Label className="text-xs">Unit</Label>
            <Select value={sel ?? ""} onValueChange={setSel}>
              <SelectTrigger className="min-w-[240px]"><SelectValue placeholder="Pilih unit…" /></SelectTrigger>
              <SelectContent>{(units ?? []).map((u) => <SelectItem key={u.id} value={u.id}>{u.nama_unit}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
      </div>
      {!active && <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">Pilih unit dahulu.</div>}
      {active && (
        <Tabs defaultValue="gr" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gr">Penerimaan Barang</TabsTrigger>
            <TabsTrigger value="pay">Pembayaran Pemasok</TabsTrigger>
            <TabsTrigger value="ap">Utang</TabsTrigger>
          </TabsList>
          <TabsContent value="gr"><GRTab unitId={active} /></TabsContent>
          <TabsContent value="pay"><PayTab unitId={active} /></TabsContent>
          <TabsContent value="ap"><APTab unitId={active} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function GRTab({ unitId }: { unitId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["gr", unitId],
    queryFn: async () => (await supabase.from("goods_receipts")
      .select("id, nomor_gr, tanggal_terima, status, payment_method, supplier:suppliers(nama_supplier), goods_receipt_lines(qty_received, harga_pokok)")
      .eq("unit_id", unitId).order("tanggal_terima", { ascending: false }).limit(200)).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const post = async (id: string) => {
    const { error } = await supabase.rpc("post_goods_receipt", { p_goods_receipt_id: id });
    if (error) return toast.error(error.message);
    toast.success("Diposting (stok + jurnal)"); qc.invalidateQueries({ queryKey: ["gr", unitId] });
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Penerimaan Baru</Button></DialogTrigger>
          <NewGRDialog unitId={unitId} onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["gr", unitId] }); }} />
        </Dialog>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Nomor</th><th className="px-4 py-3">Pemasok</th>
            <th className="px-4 py-3">Metode</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada penerimaan.</td></tr>}
            {(data ?? []).map((g: any) => {
              const total = (g.goods_receipt_lines ?? []).reduce((s: number, l: any) => s + Number(l.qty_received) * Number(l.harga_pokok), 0);
              return (
                <tr key={g.id}>
                  <td className="px-4 py-2">{formatDate(g.tanggal_terima)}</td>
                  <td className="px-4 py-2 font-mono text-xs">{g.nomor_gr}</td>
                  <td className="px-4 py-2">{g.supplier?.nama_supplier ?? "-"}</td>
                  <td className="px-4 py-2 uppercase text-xs">{g.payment_method}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatIDR(total)}</td>
                  <td className="px-4 py-2"><span className={`text-xs rounded px-2 py-0.5 ${g.status === "posted" ? "bg-success/15 text-success" : "bg-secondary"}`}>{g.status}</span></td>
                  <td className="px-4 py-2 text-right">{g.status !== "posted" && <Button size="sm" variant="outline" onClick={() => post(g.id)}>Posting</Button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewGRDialog({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const { data: suppliers } = useQuery({
    queryKey: ["sup-pick", unitId],
    queryFn: async () => (await supabase.from("suppliers").select("id, nama_supplier").eq("unit_id", unitId).order("nama_supplier")).data ?? [],
  });
  const { data: items } = useQuery({
    queryKey: ["item-pick-gr", unitId],
    queryFn: async () => (await supabase.from("inventory_items").select("id, nama_barang, harga_beli").eq("unit_id", unitId).order("nama_barang")).data ?? [],
  });
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState("");
  const [method, setMethod] = useState<"cash" | "credit">("credit");
  const [lines, setLines] = useState<{ item_id: string; qty: string; harga: string }[]>([{ item_id: "", qty: "1", harga: "" }]);
  const [busy, setBusy] = useState(false);
  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.harga) || 0), 0), [lines]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = lines.filter((l) => l.item_id && Number(l.qty) > 0 && Number(l.harga) > 0);
    if (valid.length === 0) return toast.error("Tambah minimal 1 baris.");
    setBusy(true);
    try {
      // PO dummy karena goods_receipts.purchase_order_id NOT NULL? Let me check - actually it's nullable now via FK SET NULL. But the original has NOT NULL.
      // Cek schema: purchase_order_id text NOT NULL? Let's see - it was 'NOT NULL' in earlier columns dump. We'll create PO inline.
      const poNomor = `PO-${Date.now()}`;
      const { data: po, error: e0 } = await supabase.from("purchase_orders")
        .insert({ unit_id: unitId, supplier_id: supplierId || null, tanggal_po: tanggal, nomor_po: poNomor, status: "approved" })
        .select().single();
      if (e0 || !po) throw e0;

      const nomor = `GR-${Date.now()}`;
      const { data: gr, error } = await supabase.from("goods_receipts")
        .insert({ unit_id: unitId, supplier_id: supplierId || null, purchase_order_id: po.id, tanggal_terima: tanggal, nomor_gr: nomor, payment_method: method, status: "draft" })
        .select().single();
      if (error || !gr) throw error;
      const { error: e2 } = await supabase.from("goods_receipt_lines").insert(
        valid.map((l) => ({ goods_receipt_id: gr.id, item_id: l.item_id, qty_received: Number(l.qty), harga_pokok: Number(l.harga) })),
      );
      if (e2) throw e2;
      toast.success("Penerimaan dibuat (draft). Klik Posting untuk update stok & jurnal.");
      onClose();
    } catch (err: any) { toast.error(err?.message); } finally { setBusy(false); }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Penerimaan Barang Baru</DialogTitle>
        <DialogDescription>Akan otomatis membuat PO terkait. Posting menjurnal: Dr Persediaan / Cr {method === "cash" ? "Kas" : "Utang Usaha"}.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Pemasok</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Pilih pemasok…" /></SelectTrigger>
              <SelectContent>{(suppliers ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.nama_supplier}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Metode</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cash">Tunai</SelectItem><SelectItem value="credit">Kredit (Utang)</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Item</Label>
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <Select value={l.item_id} onValueChange={(v) => {
                const it = (items ?? []).find((x) => x.id === v);
                const n = [...lines]; n[i] = { ...n[i], item_id: v, harga: l.harga || String(it?.harga_beli ?? "") };
                setLines(n);
              }}>
                <SelectTrigger className="col-span-6"><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                <SelectContent>{(items ?? []).map((it) => <SelectItem key={it.id} value={it.id}>{it.nama_barang}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="col-span-2" type="number" placeholder="Qty" value={l.qty} onChange={(e) => { const n = [...lines]; n[i].qty = e.target.value; setLines(n); }} />
              <Input className="col-span-3" type="number" placeholder="Harga Pokok" value={l.harga} onChange={(e) => { const n = [...lines]; n[i].harga = e.target.value; setLines(n); }} />
              <button type="button" className="col-span-1 text-muted-foreground hover:text-destructive" onClick={() => setLines(lines.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { item_id: "", qty: "1", harga: "" }])}>+ Baris</Button>
        </div>
        <div className="flex justify-between items-center border-t pt-3">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-lg font-bold">{formatIDR(total)}</div>
        </div>
        <DialogFooter><Button type="submit" disabled={busy}>{busy ? "…" : "Buat Penerimaan"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

function PayTab({ unitId }: { unitId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sup-pay", unitId],
    queryFn: async () => (await supabase.from("supplier_payments")
      .select("id, nomor_payment, tanggal_payment, amount, status, payment_method, supplier:suppliers(nama_supplier)")
      .eq("unit_id", unitId).order("tanggal_payment", { ascending: false }).limit(200)).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const post = async (id: string) => {
    const { error } = await supabase.rpc("post_supplier_payment", { p_supplier_payment_id: id });
    if (error) return toast.error(error.message);
    toast.success("Pembayaran diposting"); qc.invalidateQueries({ queryKey: ["sup-pay", unitId] });
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Catat Pembayaran</Button></DialogTrigger>
          <NewSupPayDialog unitId={unitId} onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["sup-pay", unitId] }); }} />
        </Dialog>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Nomor</th><th className="px-4 py-3">Pemasok</th>
            <th className="px-4 py-3">Metode</th><th className="px-4 py-3 text-right">Jumlah</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada pembayaran.</td></tr>}
            {(data ?? []).map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-2">{formatDate(p.tanggal_payment)}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.nomor_payment}</td>
                <td className="px-4 py-2">{p.supplier?.nama_supplier ?? "-"}</td>
                <td className="px-4 py-2 uppercase text-xs">{p.payment_method}</td>
                <td className="px-4 py-2 text-right font-medium">{formatIDR(p.amount)}</td>
                <td className="px-4 py-2"><span className={`text-xs rounded px-2 py-0.5 ${p.status === "posted" ? "bg-success/15 text-success" : "bg-secondary"}`}>{p.status}</span></td>
                <td className="px-4 py-2 text-right">{p.status !== "posted" && <Button size="sm" variant="outline" onClick={() => post(p.id)}>Posting</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewSupPayDialog({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const { data: suppliers } = useQuery({
    queryKey: ["sup-pick-pay", unitId],
    queryFn: async () => (await supabase.from("suppliers").select("id, nama_supplier").eq("unit_id", unitId).order("nama_supplier")).data ?? [],
  });
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "bank">("cash");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error("Pilih pemasok");
    if (!(Number(amount) > 0)) return toast.error("Jumlah > 0");
    setBusy(true);
    try {
      const nomor = `SPAY-${Date.now()}`;
      const { error } = await supabase.from("supplier_payments")
        .insert({ unit_id: unitId, supplier_id: supplierId, tanggal_payment: tanggal, nomor_payment: nomor, amount: Number(amount), payment_method: method, status: "draft" });
      if (error) throw error;
      toast.success("Pembayaran tercatat (draft).");
      onClose();
    } catch (err: any) { toast.error(err?.message); } finally { setBusy(false); }
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Catat Pembayaran Pemasok</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Metode</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cash">Tunai</SelectItem><SelectItem value="bank">Transfer Bank</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Pemasok</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger><SelectValue placeholder="Pilih pemasok…" /></SelectTrigger>
            <SelectContent>{(suppliers ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.nama_supplier}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Jumlah</Label><Input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <DialogFooter><Button type="submit" disabled={busy}>{busy ? "…" : "Simpan"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

function APTab({ unitId }: { unitId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["ap", unitId],
    queryFn: async () => (await supabase.from("v_accounts_payable").select("*").eq("unit_id", unitId).order("tanggal_terima", { ascending: false })).data ?? [],
  });
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead className="bg-secondary"><tr className="text-left">
          <th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">GR</th><th className="px-4 py-3">Pemasok</th>
          <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Dibayar</th>
          <th className="px-4 py-3 text-right">Sisa</th><th className="px-4 py-3">Status</th>
        </tr></thead>
        <tbody className="divide-y">
          {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
          {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada utang.</td></tr>}
          {(data ?? []).map((r: any) => (
            <tr key={r.goods_receipt_id}>
              <td className="px-4 py-2">{formatDate(r.tanggal_terima)}</td>
              <td className="px-4 py-2 font-mono text-xs">{r.nomor_gr}</td>
              <td className="px-4 py-2">{r.nama_supplier ?? "-"}</td>
              <td className="px-4 py-2 text-right">{formatIDR(r.total_gr)}</td>
              <td className="px-4 py-2 text-right">{formatIDR(r.total_payment)}</td>
              <td className="px-4 py-2 text-right font-medium">{formatIDR(r.outstanding_amount)}</td>
              <td className="px-4 py-2"><span className="text-xs rounded bg-secondary px-2 py-0.5">{r.ap_status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
