import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/sales")({
  component: SalesPage,
});

function StatusBadge({ value }: { value: string | null }) {
  const v = (value ?? "").toLowerCase();
  const tone =
    v === "paid" || v === "posted" ? "bg-success/15 text-success" :
    v === "partial" ? "bg-amber-500/15 text-amber-600" :
    v === "draft" ? "bg-muted text-muted-foreground" :
    "bg-primary/15 text-primary";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{value ?? "—"}</span>;
}

function SalesPage() {
  const { unitId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-sales", unitId],
    queryFn: async () => {
      const { data } = await supabase
        .from("sales_invoices")
        .select("id, nomor_invoice, tanggal_invoice, status, payment_status, customer:customers(nama_customer), lines:sales_invoice_lines(subtotal)")
        .eq("unit_id", unitId)
        .order("tanggal_invoice", { ascending: false })
        .limit(200);
      return (data ?? []).map((inv: any) => ({
        ...inv,
        total: (inv.lines ?? []).reduce((s: number, l: any) => s + Number(l.subtotal ?? 0), 0),
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Penjualan Barang</h2>
          <p className="text-sm text-muted-foreground">Penjualan cepat (cash) langsung terposting ke jurnal pendapatan + HPP + kas/bank via engine.</p>
        </div>
        <QuickCashSaleDialog unitId={unitId} onSuccess={() => qc.invalidateQueries({ queryKey: ["unit-sales", unitId] })} />
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nomor</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Pelanggan</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Pembayaran</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada invoice penjualan</td></tr>}
            {(data ?? []).map((inv: any) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-mono text-xs">{inv.nomor_invoice}</td>
                <td className="px-4 py-3">{formatDate(inv.tanggal_invoice)}</td>
                <td className="px-4 py-3">{inv.customer?.nama_customer ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(inv.total)}</td>
                <td className="px-4 py-3"><StatusBadge value={inv.status} /></td>
                <td className="px-4 py-3"><StatusBadge value={inv.payment_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickCashSaleDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ customer_id: "", item_id: "", qty: "1", harga_jual: "", harga_pokok: "", payment_method: "cash", tanggal: new Date().toISOString().slice(0, 10) });

  const { data: customers } = useQuery({
    queryKey: ["sel-cust", unitId], enabled: open,
    queryFn: async () => (await supabase.from("customers").select("id, nama_customer").eq("unit_id", unitId).order("nama_customer")).data ?? [],
  });
  const { data: items } = useQuery({
    queryKey: ["sel-item", unitId], enabled: open,
    queryFn: async () => (await supabase.from("inventory_items").select("id, nama_barang, harga_jual, harga_beli").eq("unit_id", unitId).order("nama_barang")).data ?? [],
  });

  const onItem = (id: string) => {
    const it = (items ?? []).find((x: any) => x.id === id);
    setF((p) => ({ ...p, item_id: id, harga_jual: it ? String(it.harga_jual) : p.harga_jual, harga_pokok: it ? String(it.harga_beli) : p.harga_pokok }));
  };

  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("post_quick_cash_sale", {
        p_unit_id: unitId,
        p_customer_id: f.customer_id || null,
        p_item_id: f.item_id,
        p_qty: Number(f.qty),
        p_harga_jual: Number(f.harga_jual),
        p_harga_pokok: Number(f.harga_pokok),
        p_payment_method: f.payment_method,
        p_tanggal: f.tanggal,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Penjualan diposting"); setOpen(false); onSuccess(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Zap className="h-4 w-4 mr-1" />Penjualan Cepat (Cash)</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Penjualan Cepat — post_quick_cash_sale</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={f.tanggal} onChange={(e) => setF({ ...f, tanggal: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Metode</Label>
            <Select value={f.payment_method} onValueChange={(v) => setF({ ...f, payment_method: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="bank">Bank</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Pelanggan (opsional)</Label>
            <Select value={f.customer_id} onValueChange={(v) => setF({ ...f, customer_id: v })}>
              <SelectTrigger><SelectValue placeholder="— umum / walk-in —" /></SelectTrigger>
              <SelectContent>{(customers ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nama_customer}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Barang</Label>
            <Select value={f.item_id} onValueChange={onItem}>
              <SelectTrigger><SelectValue placeholder="Pilih barang…" /></SelectTrigger>
              <SelectContent>{(items ?? []).map((i: any) => <SelectItem key={i.id} value={i.id}>{i.nama_barang}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Qty</Label><Input type="number" min={1} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Harga Jual</Label><Input type="number" value={f.harga_jual} onChange={(e) => setF({ ...f, harga_jual: e.target.value })} /></div>
          <div className="col-span-2 space-y-1.5"><Label>Harga Pokok (HPP)</Label><Input type="number" value={f.harga_pokok} onChange={(e) => setF({ ...f, harga_pokok: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!f.item_id || !f.qty || !f.harga_jual || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Memposting…" : "Posting Penjualan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
