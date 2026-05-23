import { formatIDR } from "@/lib/format";

export interface BSRow {
  account_code: string;
  account_name: string;
  account_type: string;
  aset?: number | string | null;
  kewajiban?: number | string | null;
  ekuitas?: number | string | null;
}

const n = (v: any) => Number(v ?? 0);

function classifyAset(code: string, name: string): "lancar" | "tetap" {
  // 1-1xxx = lancar, 1-2xxx = tetap; akumulasi penyusutan → tetap (kontra)
  if (/akumulasi|penyusutan/i.test(name)) return "tetap";
  if (code.startsWith("1-2") || code.startsWith("12")) return "tetap";
  return "lancar";
}

function classifyKewajiban(code: string): "lancar" | "panjang" {
  if (code.startsWith("2-2") || code.startsWith("22")) return "panjang";
  return "lancar";
}

interface Props {
  rows: BSRow[];
  /** Laba berjalan dari laporan laba rugi periode terkait (opsional). */
  labaBerjalan?: number;
}

function HeaderBand({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={2} className="bg-[#1e3a8a] text-white font-semibold px-3 py-2 text-sm tracking-wide">
        {children}
      </td>
    </tr>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr className="bg-[#e8f0fb]">
      <td colSpan={2} className="px-3 py-1.5 text-sm font-semibold text-[#1e3a8a]">
        {children}
      </td>
    </tr>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  const neg = value < 0;
  return (
    <tr className="border-b border-[#dbe6f4]">
      <td className="px-4 py-1.5 text-sm text-[#1e3a8a]">{label}</td>
      <td className="px-4 py-1.5 text-sm text-right font-mono text-[#1e3a8a]">
        {neg ? `-${formatIDR(Math.abs(value))}` : formatIDR(value)}
      </td>
    </tr>
  );
}

function Subtotal({ label, value }: { label: string; value: number }) {
  return (
    <tr className="bg-[#f3f7fc]">
      <td className="px-3 py-2 text-sm font-bold text-[#1e3a8a]">{label}</td>
      <td className="px-4 py-2 text-sm text-right font-mono font-bold text-[#1e3a8a]">
        {formatIDR(value)}
      </td>
    </tr>
  );
}

export function NeracaStaffel({ rows, labaBerjalan = 0 }: Props) {
  const aset = rows.filter((r) => n(r.aset) !== 0);
  const kewajiban = rows.filter((r) => n(r.kewajiban) !== 0);
  const ekuitas = rows.filter((r) => n(r.ekuitas) !== 0);

  const asetLancar = aset.filter((r) => classifyAset(r.account_code, r.account_name) === "lancar");
  const asetTetap = aset.filter((r) => classifyAset(r.account_code, r.account_name) === "tetap");
  const totalAsetLancar = asetLancar.reduce((s, r) => s + n(r.aset), 0);
  const totalAsetTetap = asetTetap.reduce((s, r) => s + n(r.aset), 0);
  const totalAset = totalAsetLancar + totalAsetTetap;

  const kwjLancar = kewajiban.filter((r) => classifyKewajiban(r.account_code) === "lancar");
  const kwjPanjang = kewajiban.filter((r) => classifyKewajiban(r.account_code) === "panjang");
  const totalKwjLancar = kwjLancar.reduce((s, r) => s + n(r.kewajiban), 0);
  const totalKwjPanjang = kwjPanjang.reduce((s, r) => s + n(r.kewajiban), 0);
  const totalKewajiban = totalKwjLancar + totalKwjPanjang;

  const totalEkuitasAkun = ekuitas.reduce((s, r) => s + n(r.ekuitas), 0);
  const totalEkuitas = totalEkuitasAkun + labaBerjalan;
  const totalPasiva = totalKewajiban + totalEkuitas;

  return (
    <div className="overflow-hidden rounded-md border border-[#1e3a8a]/30">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#1e3a8a] text-white">
            <th className="px-3 py-2 text-center text-sm font-semibold w-2/3">Keterangan</th>
            <th className="px-3 py-2 text-center text-sm font-semibold">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {/* AKTIVA */}
          <HeaderBand>📘 AKTIVA</HeaderBand>

          <SubHeader>Aktiva Lancar</SubHeader>
          {asetLancar.length === 0 && (
            <tr><td colSpan={2} className="px-4 py-1.5 text-sm text-[#1e3a8a]/60">—</td></tr>
          )}
          {asetLancar.map((r) => (
            <Line key={r.account_code} label={r.account_name} value={n(r.aset)} />
          ))}
          <Subtotal label="Total Aktiva Lancar" value={totalAsetLancar} />

          <SubHeader>Aktiva Tetap</SubHeader>
          {asetTetap.length === 0 && (
            <tr><td colSpan={2} className="px-4 py-1.5 text-sm text-[#1e3a8a]/60">—</td></tr>
          )}
          {asetTetap.map((r) => (
            <Line key={r.account_code} label={r.account_name} value={n(r.aset)} />
          ))}
          <Subtotal label="Total Aktiva Tetap" value={totalAsetTetap} />

          {/* PASIVA */}
          <HeaderBand>🛡 PASIVA</HeaderBand>

          <SubHeader>Kewajiban</SubHeader>
          {kwjLancar.length === 0 && kwjPanjang.length === 0 && (
            <tr><td colSpan={2} className="px-4 py-1.5 text-sm text-[#1e3a8a]/60">—</td></tr>
          )}
          {kwjLancar.map((r) => (
            <Line key={r.account_code} label={r.account_name} value={n(r.kewajiban)} />
          ))}
          {kwjPanjang.map((r) => (
            <Line key={r.account_code} label={r.account_name} value={n(r.kewajiban)} />
          ))}
          <Subtotal label="Total Kewajiban" value={totalKewajiban} />

          <SubHeader>Ekuitas</SubHeader>
          {ekuitas.map((r) => (
            <Line key={r.account_code} label={r.account_name} value={n(r.ekuitas)} />
          ))}
          {labaBerjalan !== 0 && (
            <Line label="Laba (Rugi) Berjalan" value={labaBerjalan} />
          )}
          {ekuitas.length === 0 && labaBerjalan === 0 && (
            <tr><td colSpan={2} className="px-4 py-1.5 text-sm text-[#1e3a8a]/60">—</td></tr>
          )}
          <Subtotal label="Total Ekuitas" value={totalEkuitas} />

          {/* TOTAL */}
          <tr className="bg-[#dbe6f4] border-t-2 border-[#1e3a8a]">
            <td className="px-3 py-3 font-extrabold text-[#1e3a8a]">⏱ TOTAL</td>
            <td className="px-4 py-3 text-right font-mono font-extrabold text-[#1e3a8a]">
              {formatIDR(totalAset)} &nbsp;|&nbsp; {formatIDR(totalPasiva)}
            </td>
          </tr>
        </tbody>
      </table>
      {Math.abs(totalAset - totalPasiva) > 0.5 && (
        <div className="bg-amber-50 text-amber-700 text-xs px-3 py-2 border-t no-print">
          ⚠ Aktiva dan Pasiva belum seimbang — periksa kembali jurnal.
        </div>
      )}
    </div>
  );
}
