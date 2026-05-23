import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/unit/dashboard/$unitId/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Laporan Unit</h2>
        <p className="text-sm text-muted-foreground">Laporan keuangan tingkat unit usaha.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Laba Rugi", to: "/laporan/laba-rugi", desc: "v_income_statement / v_laba_rugi" },
          { title: "Neraca", to: "/laporan/neraca", desc: "v_balance_sheet" },
          { title: "Arus Kas", to: "/laporan/arus-kas", desc: "v_cash_bank_balance + jurnal kas" },
        ].map((r) => (
          <Link key={r.to} to={r.to} className="rounded-lg border bg-card p-5 hover:bg-muted/40 transition-colors">
            <div className="font-display font-semibold">{r.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: pada halaman laporan, pilih unit ini dari filter untuk melihat laporan khusus unit.
      </p>
    </div>
  );
}
