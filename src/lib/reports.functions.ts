import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ReportInput = z.object({
  unit_id: z.string().uuid().nullable(), // null = konsolidasi (super admin only)
  start_date: z.string(), // YYYY-MM-DD
  end_date: z.string(),
});

type AccountType = "ASET" | "KEWAJIBAN" | "EKUITAS" | "PENDAPATAN" | "HPP" | "BEBAN";

interface Line {
  unit_id: string;
  unit_nama: string;
  account_id: string;
  kode: string;
  nama: string;
  tipe: AccountType;
  debit: number;
  kredit: number;
}

async function fetchLines(supabase: any, unitId: string | null, start: string, end: string): Promise<Line[]> {
  let q = supabase
    .from("journal_items")
    .select(`
      debit, kredit, unit_id,
      account:chart_of_accounts!inner(id, kode, nama, tipe),
      journal:journals!inner(tanggal, unit_id),
      unit:business_units!inner(id, nama_unit)
    `)
    .gte("journal.tanggal", start)
    .lte("journal.tanggal", end);
  if (unitId) q = q.eq("unit_id", unitId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((r) => ({
    unit_id: r.unit_id,
    unit_nama: r.unit?.nama_unit ?? "",
    account_id: r.account.id,
    kode: r.account.kode,
    nama: r.account.nama,
    tipe: r.account.tipe as AccountType,
    debit: Number(r.debit) || 0,
    kredit: Number(r.kredit) || 0,
  }));
}

interface AccountAgg {
  account_id: string;
  kode: string;
  nama: string;
  tipe: AccountType;
  saldo: number; // signed by normal balance
}

function aggregate(lines: Line[]): AccountAgg[] {
  const map = new Map<string, AccountAgg>();
  for (const l of lines) {
    const key = l.account_id;
    const existing = map.get(key) ?? {
      account_id: l.account_id, kode: l.kode, nama: l.nama, tipe: l.tipe, saldo: 0,
    };
    // Normal balance: ASET, HPP, BEBAN -> debit positif; lainnya -> kredit positif
    const debitNormal = l.tipe === "ASET" || l.tipe === "HPP" || l.tipe === "BEBAN";
    existing.saldo += debitNormal ? (l.debit - l.kredit) : (l.kredit - l.debit);
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => a.kode.localeCompare(b.kode));
}

export const getProfitLoss = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ReportInput.parse(i))
  .handler(async ({ data, context }) => {
    const lines = await fetchLines(context.supabase, data.unit_id, data.start_date, data.end_date);
    const all = aggregate(lines);
    const pendapatan = all.filter((a) => a.tipe === "PENDAPATAN");
    const hpp = all.filter((a) => a.tipe === "HPP");
    const beban = all.filter((a) => a.tipe === "BEBAN");
    const totalPendapatan = pendapatan.reduce((s, a) => s + a.saldo, 0);
    const totalHpp = hpp.reduce((s, a) => s + a.saldo, 0);
    const labaKotor = totalPendapatan - totalHpp;
    const totalBeban = beban.reduce((s, a) => s + a.saldo, 0);
    const labaBersih = labaKotor - totalBeban;
    return { pendapatan, hpp, beban, totalPendapatan, totalHpp, labaKotor, totalBeban, labaBersih };
  });

export const getBalanceSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ReportInput.parse(i))
  .handler(async ({ data, context }) => {
    // Neraca: sejak awal sampai end_date
    const lines = await fetchLines(context.supabase, data.unit_id, "1900-01-01", data.end_date);
    const all = aggregate(lines);
    const aset = all.filter((a) => a.tipe === "ASET");
    const kewajiban = all.filter((a) => a.tipe === "KEWAJIBAN");
    const ekuitas = all.filter((a) => a.tipe === "EKUITAS");
    // Hitung laba berjalan = pendapatan - hpp - beban
    const pend = all.filter((a) => a.tipe === "PENDAPATAN").reduce((s, a) => s + a.saldo, 0);
    const hpp = all.filter((a) => a.tipe === "HPP").reduce((s, a) => s + a.saldo, 0);
    const beban = all.filter((a) => a.tipe === "BEBAN").reduce((s, a) => s + a.saldo, 0);
    const labaBerjalan = pend - hpp - beban;
    const totalAset = aset.reduce((s, a) => s + a.saldo, 0);
    const totalKewajiban = kewajiban.reduce((s, a) => s + a.saldo, 0);
    const totalEkuitas = ekuitas.reduce((s, a) => s + a.saldo, 0) + labaBerjalan;
    return { aset, kewajiban, ekuitas, labaBerjalan, totalAset, totalKewajiban, totalEkuitas, totalPasiva: totalKewajiban + totalEkuitas };
  });

export const getCashFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ReportInput.parse(i))
  .handler(async ({ data, context }) => {
    // Arus kas sederhana: mutasi pada akun bertipe ASET dengan kode mulai 1-1 (Kas/Bank)
    const lines = await fetchLines(context.supabase, data.unit_id, data.start_date, data.end_date);
    const kasLines = lines.filter((l) =>
      l.tipe === "ASET" && (l.kode.startsWith("1-1000") || l.kode.startsWith("1-1100"))
    );
    const masuk = kasLines.reduce((s, l) => s + l.debit, 0);
    const keluar = kasLines.reduce((s, l) => s + l.kredit, 0);
    return { masuk, keluar, net: masuk - keluar, transaksi: kasLines.length };
  });

export const getDashboardStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ unit_id: z.string().uuid().nullable() }).parse(i))
  .handler(async ({ data, context }) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const end = today.toISOString().slice(0, 10);
    const lines = await fetchLines(context.supabase, data.unit_id, start, end);
    const all = aggregate(lines);
    const pend = all.filter((a) => a.tipe === "PENDAPATAN").reduce((s, a) => s + a.saldo, 0);
    const hpp = all.filter((a) => a.tipe === "HPP").reduce((s, a) => s + a.saldo, 0);
    const beban = all.filter((a) => a.tipe === "BEBAN").reduce((s, a) => s + a.saldo, 0);
    const aset = all.filter((a) => a.tipe === "ASET").reduce((s, a) => s + a.saldo, 0);
    const kas = lines.filter((l) => l.tipe === "ASET" && (l.kode.startsWith("1-1000") || l.kode.startsWith("1-1100")));
    const saldoKasMutasi = kas.reduce((s, l) => s + l.debit - l.kredit, 0);
    return {
      laba_bulan_ini: pend - hpp - beban,
      pendapatan_bulan_ini: pend,
      total_aset: aset,
      saldo_kas_mutasi: saldoKasMutasi,
    };
  });
