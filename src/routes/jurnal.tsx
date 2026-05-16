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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/jurnal")({
  head: () => ({ meta: [{ title: "Jurnal — ERP BUMDes" }] }),
  component: () => <Protected><JurnalPage /></Protected>,
});

interface JurnalRow { id: string; tanggal: string; nomor: string; deskripsi: string | null; unit_id: string; }

function JurnalPage() {
  const { isSuperAdmin, unitId } = useAuth();
  const qc = useQueryClient();

  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: async () => (await supabase.from("business_units").select("id, nama_unit, kode_unit").order("nama_unit")).data ?? [],
  });

  const [selectedUnit, setSelectedUnit] = useState<string | null>(unitId);
  const activeUnit = isSuperAdmin ? selectedUnit : unitId;

  const { data: journals, isLoading } = useQuery({
    queryKey: ["journals", activeUnit],
    enabled: !!activeUnit,
    queryFn: async () => {
      const { data } = await supabase
        .from("journals")
        .select("id, tanggal, nomor, deskripsi, unit_id, journal_items(debit, kredit)")
        .eq("unit_id", activeUnit!)
        .order("tanggal", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Jurnal Umum</h2>
          <p className="text-sm text-muted-foreground">Catatan transaksi double-entry per unit.</p>
        </div>
        <div className="flex items-end gap-3">
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <Label className="text-xs">Unit</Label>
              <Select value={selectedUnit ?? ""} onValueChange={(v) => setSelectedUnit(v)}>
                <SelectTrigger className="min-w-[220px]"><SelectValue placeholder="Pilih unit…" /></SelectTrigger>
                <SelectContent>
                  {(units ?? []).map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.nama_unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!activeUnit}><Plus className="h-4 w-4 mr-1" /> Jurnal Baru</Button>
            </DialogTrigger>
            <NewJournalDialog unitId={activeUnit!} onSaved={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["journals", activeUnit] }); }} />
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Nomor</th>
              <th className="px-4 py-3 font-medium">Deskripsi</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!activeUnit && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Pilih unit terlebih dahulu.</td></tr>}
            {activeUnit && isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {activeUnit && !isLoading && (journals?.length ?? 0) === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">Belum ada jurnal. Klik "Jurnal Baru".</td></tr>
            )}
            {(journals ?? []).map((j: any) => {
              const total = (j.journal_items ?? []).reduce((s: number, it: any) => s + Number(it.debit), 0);
              return (
                <tr key={j.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{formatDate(j.tanggal)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{j.nomor}</td>
                  <td className="px-4 py-3">{j.deskripsi}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatIDR(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewJournalDialog({ unitId, onSaved }: { unitId: string; onSaved: () => void }) {
  const { data: coa } = useQuery({
    queryKey: ["coa", unitId],
    queryFn: async () => (await supabase.from("chart_of_accounts").select("id, kode, nama, tipe").eq("unit_id", unitId).order("kode")).data ?? [],
  });
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [deskripsi, setDeskripsi] = useState("");
  const [lines, setLines] = useState<Array<{ account_id: string; debit: string; kredit: string; deskripsi: string }>>(
    [{ account_id: "", debit: "", kredit: "", deskripsi: "" }, { account_id: "", debit: "", kredit: "", deskripsi: "" }]
  );
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const td = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const tk = lines.reduce((s, l) => s + (Number(l.kredit) || 0), 0);
    return { td, tk, seimbang: td > 0 && td === tk };
  }, [lines]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totals.seimbang) { toast.error("Debit dan Kredit harus seimbang."); return; }
    setBusy(true);
    try {
      const nomor = `JU-${Date.now()}`;
      const { data: jrn, error } = await supabase.from("journals")
        .insert({ unit_id: unitId, tanggal, nomor, deskripsi }).select().single();
      if (error || !jrn) throw error ?? new Error("Gagal");
      const items = lines.filter((l) => l.account_id && (Number(l.debit) > 0 || Number(l.kredit) > 0))
        .map((l) => ({
          journal_id: jrn.id,
          account_id: l.account_id,
          unit_id: unitId,
          debit: Number(l.debit) || 0,
          kredit: Number(l.kredit) || 0,
          deskripsi: l.deskripsi || null,
        }));
      const { error: e2 } = await supabase.from("journal_items").insert(items);
      if (e2) throw e2;
      toast.success("Jurnal tersimpan");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menyimpan");
    } finally { setBusy(false); }
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader><DialogTitle>Jurnal Baru</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Penerimaan kas penjualan…" />
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="text-left">
                <th className="px-2 py-2 font-medium">Akun</th>
                <th className="px-2 py-2 font-medium text-right">Debit</th>
                <th className="px-2 py-2 font-medium text-right">Kredit</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lines.map((l, i) => (
                <tr key={i}>
                  <td className="px-1 py-1">
                    <Select value={l.account_id} onValueChange={(v) => setLines(lines.map((x, j) => j === i ? { ...x, account_id: v } : x))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Pilih akun" /></SelectTrigger>
                      <SelectContent>
                        {(coa ?? []).map((a: any) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-1 py-1">
                    <Input type="number" min="0" step="0.01" className="text-right" value={l.debit}
                      onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, debit: e.target.value, kredit: e.target.value ? "" : x.kredit } : x))} />
                  </td>
                  <td className="px-1 py-1">
                    <Input type="number" min="0" step="0.01" className="text-right" value={l.kredit}
                      onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, kredit: e.target.value, debit: e.target.value ? "" : x.debit } : x))} />
                  </td>
                  <td className="px-1 py-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30 font-medium">
              <tr>
                <td className="px-2 py-2 text-right">Total</td>
                <td className="px-2 py-2 text-right">{formatIDR(totals.td)}</td>
                <td className="px-2 py-2 text-right">{formatIDR(totals.tk)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { account_id: "", debit: "", kredit: "", deskripsi: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Baris
          </Button>
          <div className={`text-sm font-medium ${totals.seimbang ? "text-success" : "text-destructive"}`}>
            {totals.seimbang ? "✓ Seimbang" : "Belum seimbang"}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={busy || !totals.seimbang}>{busy ? "Menyimpan…" : "Simpan Jurnal"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
