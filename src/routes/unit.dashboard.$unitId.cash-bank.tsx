import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRightLeft, Receipt } from "lucide-react";
import { toast } from "sonner";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/unit/dashboard/$unitId/cash-bank")({
  component: CashBankPage,
});

function StatusPill({ value }: { value: string | null }) {
  const v = (value ?? "draft").toLowerCase();
  const tone = v === "posted" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{v}</span>;
}

function CashBankPage() {
  const { unitId } = Route.useParams();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["unit-cash", unitId] });
  const { data, isLoading } = useQuery({
    queryKey: ["unit-cash", unitId],
    queryFn: async () => (await supabase.from("cash_transactions").select("*").eq("unit_id", unitId).order("tanggal", { ascending: false }).limit(100)).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Kas & Bank</h2>
          <p className="text-sm text-muted-foreground">Catat biaya operasional dan mutasi antar akun kas/bank unit.</p>
        </div>
        <div className="flex gap-2">
          <ExpenseDialog unitId={unitId} onSuccess={invalidate} />
          <TransferDialog unitId={unitId} onSuccess={invalidate} />
        </div>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Nomor</th>
            <th className="px-4 py-3 font-medium">Jenis</th>
            <th className="px-4 py-3 font-medium">Deskripsi</th>
            <th className="px-4 py-3 font-medium text-right">Jumlah</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada transaksi</td></tr>}
            {(data ?? []).map((t: any) => (
              <tr key={t.id}>
                <td className="px-4 py-3">{formatDate(t.tanggal)}</td>
                <td className="px-4 py-3 font-mono text-xs">{t.nomor ?? "—"}</td>
                <td className="px-4 py-3 capitalize">{t.jenis}</td>
                <td className="px-4 py-3">{t.deskripsi ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatIDR(Number(t.jumlah))}</td>
                <td className="px-4 py-3"><StatusPill value={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function useUnitAccounts(unitId: string, enabled: boolean, filter?: (a: any) => boolean) {
  return useQuery({
    queryKey: ["coa-unit", unitId],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from("chart_of_accounts")
        .select("id, kode, nama, tipe")
        .eq("unit_id", unitId)
        .order("kode");
      return ((data ?? []) as any[]).filter(filter ?? (() => true));
    },
  });
}

function ExpenseDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ tanggal: new Date().toISOString().slice(0, 10), jumlah: "0", deskripsi: "", expense_account_id: "", account_id: "" });
  const cashAccounts = useUnitAccounts(unitId, open, (a) => a.tipe === "aset" && /^1-1/.test(a.kode ?? ""));
  const expenseAccounts = useUnitAccounts(unitId, open, (a) => a.tipe === "beban");

  const m = useMutation({
    mutationFn: async () => {
      const ts = Date.now();
      const { data: ct, error } = await supabase.from("cash_transactions").insert({
        unit_id: unitId,
        tanggal: f.tanggal,
        jenis: "expense",
        jumlah: Number(f.jumlah),
        deskripsi: f.deskripsi || null,
        account_id: f.account_id,
        expense_account_id: f.expense_account_id,
        status: "draft",
        nomor: `EXP-${ts}`,
      }).select("id").single();
      if (error) throw error;
      const { error: ep } = await supabase.rpc("post_operational_expense", { p_cash_transaction_id: ct!.id });
      if (ep) throw ep;
    },
    onSuccess: () => { toast.success("Biaya diposting"); setOpen(false); onSuccess(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Receipt className="h-4 w-4 mr-1" />Biaya Operasional</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Catat Biaya Operasional</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={f.tanggal} onChange={(e) => setF({ ...f, tanggal: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Jumlah</Label><Input type="number" value={f.jumlah} onChange={(e) => setF({ ...f, jumlah: e.target.value })} /></div>
          <div className="col-span-2 space-y-1.5"><Label>Akun Kas/Bank (Dibayar dari)</Label>
            <Select value={f.account_id} onValueChange={(v) => setF({ ...f, account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih akun kas/bank" /></SelectTrigger>
              <SelectContent>{(cashAccounts.data ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Akun Beban</Label>
            <Select value={f.expense_account_id} onValueChange={(v) => setF({ ...f, expense_account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih akun beban" /></SelectTrigger>
              <SelectContent>{(expenseAccounts.data ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Deskripsi</Label><Textarea rows={2} value={f.deskripsi} onChange={(e) => setF({ ...f, deskripsi: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!f.account_id || !f.expense_account_id || Number(f.jumlah) <= 0 || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Memposting…" : "Posting"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ tanggal: new Date().toISOString().slice(0, 10), jumlah: "0", deskripsi: "", from_account_id: "", to_account_id: "" });
  const cashAccounts = useUnitAccounts(unitId, open, (a) => a.tipe === "aset" && /^1-1/.test(a.kode ?? ""));

  const m = useMutation({
    mutationFn: async () => {
      if (f.from_account_id === f.to_account_id) throw new Error("Akun asal dan tujuan harus berbeda");
      const ts = Date.now();
      const { data: ct, error } = await supabase.from("cash_transactions").insert({
        unit_id: unitId,
        tanggal: f.tanggal,
        jenis: "transfer",
        jumlah: Number(f.jumlah),
        deskripsi: f.deskripsi || null,
        from_account_id: f.from_account_id,
        to_account_id: f.to_account_id,
        status: "draft",
        nomor: `TRF-${ts}`,
      }).select("id").single();
      if (error) throw error;
      const { error: ep } = await supabase.rpc("post_cash_bank_transfer", { p_cash_transaction_id: ct!.id });
      if (ep) throw ep;
    },
    onSuccess: () => { toast.success("Mutasi kas diposting"); setOpen(false); onSuccess(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><ArrowRightLeft className="h-4 w-4 mr-1" />Mutasi Kas/Bank</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Mutasi Kas/Bank</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={f.tanggal} onChange={(e) => setF({ ...f, tanggal: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Jumlah</Label><Input type="number" value={f.jumlah} onChange={(e) => setF({ ...f, jumlah: e.target.value })} /></div>
          <div className="col-span-2 space-y-1.5"><Label>Dari Akun</Label>
            <Select value={f.from_account_id} onValueChange={(v) => setF({ ...f, from_account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih akun asal" /></SelectTrigger>
              <SelectContent>{(cashAccounts.data ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Ke Akun</Label>
            <Select value={f.to_account_id} onValueChange={(v) => setF({ ...f, to_account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih akun tujuan" /></SelectTrigger>
              <SelectContent>{(cashAccounts.data ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Deskripsi</Label><Textarea rows={2} value={f.deskripsi} onChange={(e) => setF({ ...f, deskripsi: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!f.from_account_id || !f.to_account_id || Number(f.jumlah) <= 0 || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Memposting…" : "Posting"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
