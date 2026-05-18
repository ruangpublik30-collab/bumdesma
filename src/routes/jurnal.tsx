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
    queryFn: async () => (await supabase.from("business_units").select("id, nama_unit, kode_unit").order("nama_unit")).data ?? [],
  });

  const [selectedUnit, setSelectedUnit] = useState<string | null>(unitId);
  const activeUnit = isTenantAdmin ? selectedUnit : unitId;

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
          <h2 className="font-display text-2xl font-bold">Catat Transaksi</h2>
          <p className="text-sm text-muted-foreground">
            Catat pemasukan & pengeluaran kas. Sistem otomatis menyusun jurnal akuntansi — Anda tidak perlu tahu debit/kredit.
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
              <Button disabled={!activeUnit}><Plus className="h-4 w-4 mr-1" /> Transaksi Baru</Button>
            </DialogTrigger>
            {activeUnit && (
              <NewTransactionDialog
                unitId={activeUnit}
                onSaved={() => {
                  setOpen(false);
                  qc.invalidateQueries({ queryKey: ["journals", activeUnit] });
                }}
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
              <th className="px-4 py-3 font-medium">Deskripsi</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!activeUnit && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Pilih unit terlebih dahulu.</td></tr>}
            {activeUnit && isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {activeUnit && !isLoading && (journals?.length ?? 0) === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">Belum ada transaksi. Klik "Transaksi Baru".</td></tr>
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

function NewTransactionDialog({ unitId, onSaved }: { unitId: string; onSaved: () => void }) {
  const { data: coa } = useQuery({
    queryKey: ["coa", unitId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chart_of_accounts")
        .select("id, kode, nama, tipe")
        .eq("unit_id", unitId)
        .order("kode");
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
    if (jenis === "PENERIMAAN") {
      return all.filter((a) => ["pendapatan", "kewajiban", "ekuitas", "aset"].includes(a.tipe));
    }
    return all.filter((a) => ["beban", "aset", "kewajiban"].includes(a.tipe));
  }, [coa, akunKasId, jenis]);

  const groupedLawan = useMemo(() => {
    const groups: Record<string, Akun[]> = {};
    for (const a of akunLawan) (groups[a.tipe] ||= []).push(a);
    return groups;
  }, [akunLawan]);

  const tipeLabel: Record<string, string> = {
    pendapatan: "Pendapatan",
    beban: "Beban / HPP",
    aset: "Aset / Persediaan",
    kewajiban: "Utang / Kewajiban",
    ekuitas: "Modal / Ekuitas",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nominal = Number(jumlah);
    if (!akunKasId || !akunLawanId) { toast.error("Pilih akun kas dan akun lawan."); return; }
    if (!(nominal > 0)) { toast.error("Jumlah harus lebih dari 0."); return; }
    setBusy(true);
    try {
      const nomor = `TR-${Date.now()}`;
      const { data: jrn, error } = await supabase
        .from("journals")
        .insert({ unit_id: unitId, tanggal, nomor, deskripsi: deskripsi || (jenis === "PENERIMAAN" ? "Penerimaan kas" : "Pengeluaran kas") })
        .select()
        .single();
      if (error || !jrn) throw error ?? new Error("Gagal");

      const items =
        jenis === "PENERIMAAN"
          ? [
              { journal_id: jrn.id, account_id: akunKasId, unit_id: unitId, debit: nominal, kredit: 0, deskripsi: null },
              { journal_id: jrn.id, account_id: akunLawanId, unit_id: unitId, debit: 0, kredit: nominal, deskripsi: null },
            ]
          : [
              { journal_id: jrn.id, account_id: akunLawanId, unit_id: unitId, debit: nominal, kredit: 0, deskripsi: null },
              { journal_id: jrn.id, account_id: akunKasId, unit_id: unitId, debit: 0, kredit: nominal, deskripsi: null },
            ];

      const { error: e2 } = await supabase.from("journal_items").insert(items);
      if (e2) throw e2;
      toast.success("Transaksi tersimpan");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Catat Transaksi Baru</DialogTitle>
        <DialogDescription>
          Pilih apakah uang <strong>masuk</strong> atau <strong>keluar</strong>, lalu pilih asal/tujuan dananya. Sistem mengurus pencatatan akuntansinya.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setJenis("PENERIMAAN"); setAkunLawanId(""); }}
            className={`flex items-center gap-2 rounded-md border-2 px-3 py-3 text-sm font-medium transition ${jenis === "PENERIMAAN" ? "border-success bg-success/10 text-success" : "border-border hover:bg-muted/50"}`}
          >
            <ArrowDownToLine className="h-4 w-4" /> Uang Masuk
          </button>
          <button
            type="button"
            onClick={() => { setJenis("PENGELUARAN"); setAkunLawanId(""); }}
            className={`flex items-center gap-2 rounded-md border-2 px-3 py-3 text-sm font-medium transition ${jenis === "PENGELUARAN" ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:bg-muted/50"}`}
          >
            <ArrowUpFromLine className="h-4 w-4" /> Uang Keluar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Jumlah (Rp)</Label>
            <Input type="number" min="0" step="1" required value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{jenis === "PENERIMAAN" ? "Disimpan ke (Kas / Bank)" : "Dibayar dari (Kas / Bank)"}</Label>
          <Select value={akunKasId} onValueChange={setAkunKasId}>
            <SelectTrigger><SelectValue placeholder="Pilih akun kas / bank" /></SelectTrigger>
            <SelectContent>
              {akunKas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{jenis === "PENERIMAAN" ? "Sumber Penerimaan" : "Tujuan Pengeluaran"}</Label>
          <Select value={akunLawanId} onValueChange={setAkunLawanId}>
            <SelectTrigger>
              <SelectValue placeholder={jenis === "PENERIMAAN" ? "Cth: Pendapatan Penjualan" : "Cth: Beban Operasional"} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedLawan).map(([tipe, list]) => (
                <div key={tipe}>
                  <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{tipeLabel[tipe] ?? tipe}</div>
                  {list.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.kode} — {a.nama}</SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Keterangan (opsional)</Label>
          <Input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="cth: Penjualan tunai hari ini" />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Simpan Transaksi"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
