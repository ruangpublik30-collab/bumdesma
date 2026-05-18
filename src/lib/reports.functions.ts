import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ReportInput = z.object({
  unit_id: z.string().uuid().nullable(),
  start_date: z.string(),
  end_date: z.string(),
});

type AccountType = "aset" | "kewajiban" | "ekuitas" | "pendapatan" | "beban";

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
  saldo: number;
}

function aggregate(lines: Line[]): AccountAgg[] {
  const map = new Map<string, AccountAgg>();
  for (const l of lines) {
    const key = l.account_id;
    const existing = map.get(key) ?? {
      account_id: l.account_id, kode: l.kode, nama: l.nama, tipe: l.tipe, saldo: 0,
    };
    const debitNormal = l.tipe === "aset" || l.tipe === "beban";
    existing.saldo += debitNormal ? (l.debit - l.kredit) : (l.kredit - l.debit);
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => a.kode.localeCompare(b.kode));
}

function isHpp(a: { kode: string; nama: string }): boolean {
  return /hpp|harga pokok/i.test(a.nama) || a.kode.startsWith("5-1100");
}

export const getProfitLoss = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ReportInput.parse(i))
  .handler(async ({ data, context }) => {
    const lines = await fetchLines(context.supabase, data.unit_id, data.start_date, data.end_date);
    const all = aggregate(lines);
    const pendapatan = all.filter((a) => a.tipe === "pendapatan");
    const hpp = all.filter((a) => a.tipe === "beban" && isHpp(a));
    const beban = all.filter((a) => a.tipe === "beban" && !isHpp(a));
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
    const lines = await fetchLines(context.supabase, data.unit_id, "1900-01-01", data.end_date);
    const all = aggregate(lines);
    const aset = all.filter((a) => a.tipe === "aset");
    const kewajiban = all.filter((a) => a.tipe === "kewajiban");
    const ekuitas = all.filter((a) => a.tipe === "ekuitas");
    const pend = all.filter((a) => a.tipe === "pendapatan").reduce((s, a) => s + a.saldo, 0);
    const beban = all.filter((a) => a.tipe === "beban").reduce((s, a) => s + a.saldo, 0);
    const labaBerjalan = pend - beban;
    const totalAset = aset.reduce((s, a) => s + a.saldo, 0);
    const totalKewajiban = kewajiban.reduce((s, a) => s + a.saldo, 0);
    const totalEkuitas = ekuitas.reduce((s, a) => s + a.saldo, 0) + labaBerjalan;
    return { aset, kewajiban, ekuitas, labaBerjalan, totalAset, totalKewajiban, totalEkuitas, totalPasiva: totalKewajiban + totalEkuitas };
  });

export const getCashFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ReportInput.parse(i))
  .handler(async ({ data, context }) => {
    const lines = await fetchLines(context.supabase, data.unit_id, data.start_date, data.end_date);
    const kasLines = lines.filter((l) => l.tipe === "aset" && l.kode.startsWith("1-1"));
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
    const pend = all.filter((a) => a.tipe === "pendapatan").reduce((s, a) => s + a.saldo, 0);
    const beban = all.filter((a) => a.tipe === "beban").reduce((s, a) => s + a.saldo, 0);
    const aset = all.filter((a) => a.tipe === "aset").reduce((s, a) => s + a.saldo, 0);
    const kas = lines.filter((l) => l.tipe === "aset" && l.kode.startsWith("1-1"));
    const saldoKasMutasi = kas.reduce((s, l) => s + l.debit - l.kredit, 0);
    return {
      laba_bulan_ini: pend - beban,
      pendapatan_bulan_ini: pend,
      total_aset: aset,
      saldo_kas_mutasi: saldoKasMutasi,
    };
  });
