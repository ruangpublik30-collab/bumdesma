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
import { toast } from "sonner";
import { Plus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/jurnal")({
  head: () => ({ meta: [{ title: "Transaksi — ERP BUMDes" }] }),
  component: () => <Protected require="tenant"><JurnalPage /></Protected>,
});

type Akun = { id: string; kode: string; nama: string; tipe: string };

function JurnalPage() {
  const { isTenantAdmin, unitId } = useAuth();
  const qc = useQueryClient();

  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: async () =>
      (await supabase.from("business_units").select("id, nama_unit, kode_unit").order("nama_unit")).data ?? [],
  });

  const [selectedUnit, setSelectedUnit] = useState<string | null>(unitId);
  const activeUnit = isTenantAdmin ? selectedUnit : unitId;

  const { data: journals, isLoading } = useQuery({
    queryKey: ["journals", activeUnit],
    enabled: !!activeUnit,
    queryFn: async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("id, tanggal, nomor, deskripsi, source_type, journal_entry_lines(debit, credit)")
        .eq("unit_id", activeUnit!)
        .order("tanggal", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 min-w-0">
        <div>
          <h2 className="font-display text-2xl font-bold">Buku Jurnal</h2>
          <p className="text-sm text-muted-foreground">
            Semua transaksi (penjualan, pembelian, kas) tercatat di sini. Anda juga bisa mencatat transaksi kas manual.
          </p>
        </div>
        <div className="flex items-end gap-3">
          {isTenantAdmin && (
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
              <Button disabled={!activeUnit}><Plus className="h-4 w-4 mr-1" /> Transaksi Kas</Button>
            </DialogTrigger>
            {activeUnit && (
              <NewTransactionDialog
                unitId={activeUnit}
                onSaved={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["journals", activeUnit] }); }}
              />
            )}
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Nomor</th>
              <th className="px-4 py-3 font-medium">Sumber</th>
              <th className="px-4 py-3 font-medium">Deskripsi</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!activeUnit && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Pilih unit terlebih dahulu.</td></tr>}
            {activeUnit && isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {activeUnit && !isLoading && (journals?.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Belum ada transaksi.</td></tr>
            )}
            {(journals ?? []).map((j: any) => {
              const total = (j.journal_entry_lines ?? []).reduce((s: number, it: any) => s + Number(it.debit), 0);
              return (
                <tr key={j.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{formatDate(j.tanggal)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{j.nomor}</td>
                  <td className="px-4 py-3"><span className="text-xs rounded bg-secondary px-2 py-0.5">{j.source_type ?? "manual"}</span></td>
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

function NewTransactionDialog({ unitId, onSaved }: { unitId: string; onSaved: () => void }) {
  const { data: coa } = useQuery({
    queryKey: ["coa", unitId],
    queryFn: async () => {
      const { data } = await supabase.from("chart_of_accounts").select("id, kode, nama, tipe").eq("unit_id", unitId).order("kode");
      return (data ?? []) as Akun[];
    },
  });

  const [jenis, setJenis] = useState<"PENERIMAAN" | "PENGELUARAN">("PENERIMAAN");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [akunKasId, setAkunKasId] = useState("");
  const [akunLawanId, setAkunLawanId] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [busy, setBusy] = useState(false);

  const akunKas = useMemo(() => {
    const aset = (coa ?? []).filter((a) => a.tipe === "aset");
    const kasBank = aset.filter((a) => /kas|bank/i.test(a.nama) || a.kode.startsWith("1-1"));
    return kasBank.length > 0 ? kasBank : aset;
  }, [coa]);

  const akunLawan = useMemo(() => {
    const all = (coa ?? []).filter((a) => a.id !== akunKasId);
    if (jenis === "PENERIMAAN") return all.filter((a) => ["pendapatan", "kewajiban", "ekuitas", "aset"].includes(a.tipe));
    return all.filter((a) => ["beban", "aset", "kewajiban"].includes(a.tipe));
  }, [coa, akunKasId, jenis]);

  const groupedLawan = useMemo(() => {
    const g: Record<string, Akun[]> = {};
    for (const a of akunLawan) (g[a.tipe] ||= []).push(a);
    return g;
  }, [akunLawan]);

  const tipeLabel: Record<string, string> = {
    pendapatan: "Pendapatan", beban: "Beban / HPP", aset: "Aset",
    kewajiban: "Utang / Kewajiban", ekuitas: "Modal / Ekuitas",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nominal = Number(jumlah);
    if (!akunKasId || !akunLawanId) return toast.error("Pilih akun kas dan akun lawan.");
    if (!(nominal > 0)) return toast.error("Jumlah harus > 0.");
    setBusy(true);
    try {
      const nomor = `TR-${Date.now()}`;
      const { data: entry, error } = await supabase
        .from("journal_entries")
        .insert({
          unit_id: unitId, tanggal, nomor,
          deskripsi: deskripsi || (jenis === "PENERIMAAN" ? "Penerimaan kas" : "Pengeluaran kas"),
          source_type: "manual", status: "posted",
        })
        .select().single();
      if (error || !entry) throw error ?? new Error("Gagal");

      const lines =
        jenis === "PENERIMAAN"
          ? [
              { journal_entry_id: entry.id, account_id: akunKasId, debit: nominal, credit: 0 },
              { journal_entry_id: entry.id, account_id: akunLawanId, debit: 0, credit: nominal },
            ]
          : [
              { journal_entry_id: entry.id, account_id: akunLawanId, debit: nominal, credit: 0 },
              { journal_entry_id: entry.id, account_id: akunKasId, debit: 0, credit: nominal },
            ];
      const { error: e2 } = await supabase.from("journal_entry_lines").insert(lines);
      if (e2) throw e2;
      toast.success("Transaksi tersimpan");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menyimpan");
    } finally { setBusy(false); }
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Catat Transaksi Kas Manual</DialogTitle>
        <DialogDescription>Pilih uang <strong>masuk</strong> atau <strong>keluar</strong>, lalu pilih asal/tujuan dana. Sistem otomatis menjurnal.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => { setJenis("PENERIMAAN"); setAkunLawanId(""); }}
            className={`flex items-center gap-2 rounded-md border-2 px-3 py-3 text-sm font-medium transition ${jenis === "PENERIMAAN" ? "border-success bg-success/10 text-success" : "border-border hover:bg-muted/50"}`}>
            <ArrowDownToLine className="h-4 w-4" /> Uang Masuk
          </button>
          <button type="button" onClick={() => { setJenis("PENGELUARAN"); setAkunLawanId(""); }}
            className={`flex items-center gap-2 rounded-md border-2 px-3 py-3 text-sm font-medium transition ${jenis === "PENGELUARAN" ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:bg-muted/50"}`}>
            <ArrowUpFromLine className="h-4 w-4" /> Uang Keluar
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Tanggal</Label><Input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
          <div className="space-y-2"><Label>Jumlah (Rp)</Label><Input type="number" min="0" required value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="0" /></div>
        </div>
        <div className="space-y-2">
          <Label>{jenis === "PENERIMAAN" ? "Disimpan ke (Kas/Bank)" : "Dibayar dari (Kas/Bank)"}</Label>
          <Select value={akunKasId} onValueChange={setAkunKasId}>
            <SelectTrigger><SelectValue placeholder="Pilih akun kas/bank" /></SelectTrigger>
            <SelectContent>{akunKas.map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{jenis === "PENERIMAAN" ? "Sumber Penerimaan" : "Tujuan Pengeluaran"}</Label>
          <Select value={akunLawanId} onValueChange={setAkunLawanId}>
            <SelectTrigger><SelectValue placeholder={jenis === "PENERIMAAN" ? "cth: Pendapatan" : "cth: Beban"} /></SelectTrigger>
            <SelectContent>
              {Object.entries(groupedLawan).map(([tipe, list]) => (
                <div key={tipe}>
                  <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{tipeLabel[tipe] ?? tipe}</div>
                  {list.map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>)}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Keterangan (opsional)</Label><Input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} /></div>
        <DialogFooter><Button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Simpan Transaksi"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
