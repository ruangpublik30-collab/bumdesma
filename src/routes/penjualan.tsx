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
import { Plus, Trash2, FileCheck2 } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/penjualan")({
  head: () => ({ meta: [{ title: "Penjualan — ERP BUMDes" }] }),
  component: () => <Protected require="tenant"><Page /></Protected>,
});

function Page() {
  const { isTenantAdmin, unitId, tenantId } = useAuth();
  const { data: units } = useQuery({
    queryKey: ["units-pj", tenantId], enabled: !!tenantId,
    queryFn: async () => (await supabase.from("business_units").select("id, nama_unit").eq("tenant_id", tenantId!).order("nama_unit")).data ?? [],
  });
  const [sel, setSel] = useState<string | null>(unitId);
  const active = isTenantAdmin ? sel : unitId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 min-w-0">
        <div>
          <h2 className="font-display text-2xl font-bold">Penjualan</h2>
          <p className="text-sm text-muted-foreground">Faktur penjualan & pembayaran pelanggan. Posting otomatis ke jurnal.</p>
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
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Faktur Penjualan</TabsTrigger>
            <TabsTrigger value="payments">Pembayaran Pelanggan</TabsTrigger>
            <TabsTrigger value="ar">Piutang</TabsTrigger>
          </TabsList>
          <TabsContent value="invoices"><InvoicesTab unitId={active} /></TabsContent>
          <TabsContent value="payments"><PaymentsTab unitId={active} /></TabsContent>
          <TabsContent value="ar"><ARTab unitId={active} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function InvoicesTab({ unitId }: { unitId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sales-invoices", unitId],
    queryFn: async () =>
      (await supabase.from("sales_invoices")
        .select("id, nomor_invoice, tanggal_invoice, status, customer:customers(nama_customer), sales_invoice_lines(qty_invoiced, harga_jual)")
        .eq("unit_id", unitId).order("tanggal_invoice", { ascending: false }).limit(200)).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const post = async (id: string) => {
    const { error } = await supabase.rpc("post_sales_invoice", { p_sales_invoice_id: id });
    if (error) return toast.error(error.message);
    toast.success("Faktur diposting ke jurnal");
    qc.invalidateQueries({ queryKey: ["sales-invoices", unitId] });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Faktur Baru</Button></DialogTrigger>
          <NewInvoiceDialog unitId={unitId} onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["sales-invoices", unitId] }); }} />
        </Dialog>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Nomor</th><th className="px-4 py-3">Pelanggan</th>
            <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada faktur.</td></tr>}
            {(data ?? []).map((inv: any) => {
              const total = (inv.sales_invoice_lines ?? []).reduce((s: number, l: any) => s + Number(l.qty_invoiced) * Number(l.harga_jual), 0);
              return (
                <tr key={inv.id}>
                  <td className="px-4 py-2">{formatDate(inv.tanggal_invoice)}</td>
                  <td className="px-4 py-2 font-mono text-xs">{inv.nomor_invoice}</td>
                  <td className="px-4 py-2">{inv.customer?.nama_customer ?? "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatIDR(total)}</td>
                  <td className="px-4 py-2"><span className={`text-xs rounded px-2 py-0.5 ${inv.status === "posted" ? "bg-success/15 text-success" : "bg-secondary"}`}>{inv.status}</span></td>
                  <td className="px-4 py-2 text-right">
                    {inv.status !== "posted" && <Button size="sm" variant="outline" onClick={() => post(inv.id)}><FileCheck2 className="h-3.5 w-3.5 mr-1" />Posting</Button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewInvoiceDialog({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const { data: customers } = useQuery({
    queryKey: ["cust-pick", unitId],
    queryFn: async () => (await supabase.from("customers").select("id, nama_customer").eq("unit_id", unitId).order("nama_customer")).data ?? [],
  });
  const { data: items } = useQuery({
    queryKey: ["item-pick", unitId],
    queryFn: async () => (await supabase.from("inventory_items").select("id, nama_barang, harga_jual").eq("unit_id", unitId).order("nama_barang")).data ?? [],
  });
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState<string>("");
  const [lines, setLines] = useState<{ item_id: string; qty: string; harga: string }[]>([{ item_id: "", qty: "1", harga: "" }]);
  const [busy, setBusy] = useState(false);
  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.harga) || 0), 0), [lines]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return toast.error("Pilih pelanggan.");
    const validLines = lines.filter((l) => l.item_id && Number(l.qty) > 0 && Number(l.harga) > 0);
    if (validLines.length === 0) return toast.error("Tambah minimal 1 baris barang.");
    setBusy(true);
    try {
      const nomor = `INV-${Date.now()}`;
      const { data: inv, error } = await supabase.from("sales_invoices")
        .insert({ unit_id: unitId, customer_id: customerId, tanggal_invoice: tanggal, nomor_invoice: nomor, status: "draft" })
        .select().single();
      if (error || !inv) throw error;
      const { error: e2 } = await supabase.from("sales_invoice_lines").insert(
        validLines.map((l) => ({ sales_invoice_id: inv.id, item_id: l.item_id, qty_invoiced: Number(l.qty), harga_jual: Number(l.harga) })),
      );
      if (e2) throw e2;
      toast.success("Faktur dibuat (draft). Klik 'Posting' untuk menjurnal.");
      onClose();
    } catch (err: any) { toast.error(err?.message ?? "Gagal"); } finally { setBusy(false); }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Faktur Penjualan Baru</DialogTitle>
        <DialogDescription>Faktur akan dibuat sebagai draft. Klik "Posting" di daftar faktur untuk menjurnal Dr Piutang / Cr Penjualan.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Pelanggan</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Pilih pelanggan…" /></SelectTrigger>
              <SelectContent>{(customers ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.nama_customer}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Item</Label>
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <Select value={l.item_id} onValueChange={(v) => {
                  const it = (items ?? []).find((x) => x.id === v);
                  const next = [...lines]; next[i] = { ...next[i], item_id: v, harga: l.harga || String(it?.harga_jual ?? "") };
                  setLines(next);
                }}>
                  <SelectTrigger className="col-span-6"><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                  <SelectContent>{(items ?? []).map((it) => <SelectItem key={it.id} value={it.id}>{it.nama_barang}</SelectItem>)}</SelectContent>
                </Select>
                <Input className="col-span-2" type="number" placeholder="Qty" value={l.qty} onChange={(e) => { const n = [...lines]; n[i].qty = e.target.value; setLines(n); }} />
                <Input className="col-span-3" type="number" placeholder="Harga" value={l.harga} onChange={(e) => { const n = [...lines]; n[i].harga = e.target.value; setLines(n); }} />
                <button type="button" className="col-span-1 text-muted-foreground hover:text-destructive" onClick={() => setLines(lines.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { item_id: "", qty: "1", harga: "" }])}>+ Baris</Button>
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-3">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-lg font-bold">{formatIDR(total)}</div>
        </div>
        <DialogFooter><Button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Buat Faktur"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

function PaymentsTab({ unitId }: { unitId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["cust-payments", unitId],
    queryFn: async () => (await supabase.from("customer_payments")
      .select("id, nomor_payment, payment_date, amount, status, payment_method, customer:customers(nama_customer)")
      .eq("unit_id", unitId).order("payment_date", { ascending: false }).limit(200)).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const post = async (id: string) => {
    const { error } = await supabase.rpc("post_customer_payment", { p_payment_id: id });
    if (error) return toast.error(error.message);
    toast.success("Pembayaran diposting"); qc.invalidateQueries({ queryKey: ["cust-payments", unitId] });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Catat Pembayaran</Button></DialogTrigger>
          <NewPaymentDialog unitId={unitId} onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["cust-payments", unitId] }); }} />
        </Dialog>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Nomor</th><th className="px-4 py-3">Pelanggan</th>
            <th className="px-4 py-3">Metode</th><th className="px-4 py-3 text-right">Jumlah</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada pembayaran.</td></tr>}
            {(data ?? []).map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-2">{formatDate(p.payment_date)}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.nomor_payment}</td>
                <td className="px-4 py-2">{p.customer?.nama_customer ?? "-"}</td>
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

function NewPaymentDialog({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const { data: customers } = useQuery({
    queryKey: ["cust-pick-pay", unitId],
    queryFn: async () => (await supabase.from("customers").select("id, nama_customer").eq("unit_id", unitId).order("nama_customer")).data ?? [],
  });
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "bank">("cash");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return toast.error("Pilih pelanggan");
    if (!(Number(amount) > 0)) return toast.error("Jumlah > 0");
    setBusy(true);
    try {
      const nomor = `PAY-${Date.now()}`;
      const { data: unitRow } = await supabase.from("business_units").select("tenant_id").eq("id", unitId).single();
      const { error } = await supabase.from("customer_payments")
        .insert({ unit_id: unitId, tenant_id: unitRow!.tenant_id, customer_id: customerId, payment_date: tanggal, nomor_payment: nomor, amount: Number(amount), payment_method: method, status: "draft" });
      if (error) throw error;
      toast.success("Pembayaran tercatat (draft). Klik Posting untuk menjurnal.");
      onClose();
    } catch (err: any) { toast.error(err?.message); } finally { setBusy(false); }
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Catat Pembayaran Pelanggan</DialogTitle></DialogHeader>
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
          <Label>Pelanggan</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger><SelectValue placeholder="Pilih pelanggan…" /></SelectTrigger>
            <SelectContent>{(customers ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.nama_customer}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Jumlah</Label><Input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <DialogFooter><Button type="submit" disabled={busy}>{busy ? "…" : "Simpan"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

function ARTab({ unitId }: { unitId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["ar", unitId],
    queryFn: async () => (await supabase.from("v_accounts_receivable").select("*").eq("unit_id", unitId).order("tanggal_invoice", { ascending: false })).data ?? [],
  });
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary"><tr className="text-left">
          <th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Pelanggan</th>
          <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Dibayar</th>
          <th className="px-4 py-3 text-right">Sisa</th><th className="px-4 py-3">Status</th>
        </tr></thead>
        <tbody className="divide-y">
          {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
          {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada piutang.</td></tr>}
          {(data ?? []).map((r: any) => (
            <tr key={r.sales_invoice_id}>
              <td className="px-4 py-2">{formatDate(r.tanggal_invoice)}</td>
              <td className="px-4 py-2 font-mono text-xs">{r.nomor_invoice}</td>
              <td className="px-4 py-2">{r.nama_customer ?? "-"}</td>
              <td className="px-4 py-2 text-right">{formatIDR(r.total_invoice)}</td>
              <td className="px-4 py-2 text-right">{formatIDR(r.total_payment)}</td>
              <td className="px-4 py-2 text-right font-medium">{formatIDR(r.outstanding_amount)}</td>
              <td className="px-4 py-2"><span className="text-xs rounded bg-secondary px-2 py-0.5">{r.ar_status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
