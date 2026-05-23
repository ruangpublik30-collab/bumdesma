import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/receivables")({
  component: ReceivablesPage,
});

function ARStatus({ value }: { value: string | null }) {
  const v = (value ?? "").toLowerCase();
  const tone = v === "lunas" || v === "paid" ? "bg-success/15 text-success" : v === "sebagian" || v === "partial" ? "bg-amber-500/15 text-amber-600" : "bg-destructive/15 text-destructive";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{value ?? "—"}</span>;
}

function ReceivablesPage() {
  const { unitId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-ar", unitId],
    queryFn: async () =>
      (await supabase.from("v_accounts_receivable").select("*").eq("unit_id", unitId).order("tanggal_invoice", { ascending: false })).data ?? [],
  });

  const totals = (data ?? []).reduce((acc: any, r: any) => {
    acc.invoice += Number(r.total_invoice ?? 0);
    acc.paid += Number(r.total_payment ?? 0);
    acc.outstanding += Number(r.outstanding_amount ?? 0);
    return acc;
  }, { invoice: 0, paid: 0, outstanding: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Piutang Penjualan</h2>
        <p className="text-sm text-muted-foreground">Catat pelunasan pelanggan langsung dari baris piutang.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">Total Tagihan</div><div className="mt-1 font-display text-lg font-bold">{formatIDR(totals.invoice)}</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">Sudah Dibayar</div><div className="mt-1 font-display text-lg font-bold">{formatIDR(totals.paid)}</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">Outstanding</div><div className="mt-1 font-display text-lg font-bold">{formatIDR(totals.outstanding)}</div></div>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Invoice</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Pelanggan</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium text-right">Dibayar</th>
            <th className="px-4 py-3 font-medium text-right">Outstanding</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Aksi</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Belum ada piutang</td></tr>}
            {(data ?? []).map((r: any) => (
              <tr key={r.sales_invoice_id}>
                <td className="px-4 py-3 font-mono text-xs">{r.nomor_invoice}</td>
                <td className="px-4 py-3">{formatDate(r.tanggal_invoice)}</td>
                <td className="px-4 py-3">{r.nama_customer ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(r.total_invoice))}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(r.total_payment))}</td>
                <td className="px-4 py-3 text-right font-medium">{formatIDR(Number(r.outstanding_amount))}</td>
                <td className="px-4 py-3"><ARStatus value={r.ar_status} /></td>
                <td className="px-4 py-3 text-right">
                  {Number(r.outstanding_amount) > 0 && (
                    <PayDialog unitId={unitId} row={r} onSuccess={() => qc.invalidateQueries({ queryKey: ["unit-ar", unitId] })} />
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

function PayDialog({ unitId, row, onSuccess }: { unitId: string; row: any; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(row.outstanding_amount ?? 0));
  const [method, setMethod] = useState("cash");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

  const m = useMutation({
    mutationFn: async () => {
      // Find tenant_id via unit
      const { data: unit, error: eu } = await supabase.from("business_units").select("tenant_id").eq("id", unitId).single();
      if (eu) throw eu;
      const ts = Date.now();
      const { data: pay, error } = await supabase.from("customer_payments").insert({
        tenant_id: unit!.tenant_id,
        unit_id: unitId,
        customer_id: row.customer_id,
        nomor_payment: `RCV-${ts}`,
        payment_date: tanggal,
        payment_method: method,
        amount: Number(amount),
        status: "draft",
      }).select("id, tenant_id").single();
      if (error) throw error;

      const { error: el } = await supabase.from("customer_payment_lines").insert({
        tenant_id: pay!.tenant_id,
        unit_id: unitId,
        customer_payment_id: pay!.id,
        sales_invoice_id: row.sales_invoice_id,
        amount: Number(amount),
      });
      if (el) throw el;

      const { error: ep } = await supabase.rpc("post_customer_payment", { p_payment_id: pay!.id });
      if (ep) throw ep;
    },
    onSuccess: () => { toast.success("Pembayaran diposting"); setOpen(false); onSuccess(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Wallet className="h-3.5 w-3.5 mr-1" />Bayar</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Catat Pembayaran — {row.nomor_invoice}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Metode</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="bank">Bank</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Jumlah Bayar</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={Number(amount) <= 0 || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Memposting…" : "Posting Pembayaran"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
