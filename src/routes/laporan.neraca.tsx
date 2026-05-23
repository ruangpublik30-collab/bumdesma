import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { ReportFilter, useDefaultFilter } from "@/components/report-filter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBalanceSheet } from "@/lib/reports.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ReportShell } from "@/components/reports/report-shell";
import { NeracaStaffel, BSRow } from "@/components/reports/neraca-staffel";

export const Route = createFileRoute("/laporan/neraca")({
  head: () => ({ meta: [{ title: "Laporan Neraca — ERP BUMDes" }] }),
  component: () => <Protected><NeracaPage /></Protected>,
});

function NeracaPage() {
  const def = useDefaultFilter();
  const [filter, setFilter] = useState(def);
  const fn = useServerFn(getBalanceSheet);
  const { tenantId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["bs", filter],
    queryFn: () => fn({ data: filter }),
  });

  const { data: header } = useQuery({
    queryKey: ["bs-header", filter.unit_id, tenantId],
    queryFn: async () => {
      if (filter.unit_id) {
        const r = await supabase
          .from("business_units")
          .select("nama_unit, tenant:tenants(nama_bumdes, nama_desa, nama_kecamatan)")
          .eq("id", filter.unit_id)
          .maybeSingle();
        const u: any = r.data;
        return {
          nama_bumdes: u?.tenant?.nama_bumdes,
          nama_desa: u?.tenant?.nama_desa,
          nama_kecamatan: u?.tenant?.nama_kecamatan,
          nama_unit: u?.nama_unit,
        };
      }
      if (tenantId) {
        const r = await supabase.from("tenants").select("nama_bumdes, nama_desa, nama_kecamatan").eq("id", tenantId).maybeSingle();
        return { ...(r.data as any), nama_unit: "Konsolidasi Seluruh Unit" };
      }
      return {};
    },
  });

  // Map server-fn output -> BSRow (account_code/account_name/aset/kewajiban/ekuitas)
  const rows: BSRow[] = data
    ? [
        ...data.aset.map((a: any) => ({
          account_code: a.kode, account_name: a.nama, account_type: "aset", aset: a.saldo,
        })),
        ...data.kewajiban.map((a: any) => ({
          account_code: a.kode, account_name: a.nama, account_type: "kewajiban", kewajiban: a.saldo,
        })),
        ...data.ekuitas.map((a: any) => ({
          account_code: a.kode, account_name: a.nama, account_type: "ekuitas", ekuitas: a.saldo,
        })),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h2 className="font-display text-2xl font-bold">Laporan Neraca</h2>
        <p className="text-sm text-muted-foreground">Per tanggal {filter.end_date}</p>
      </div>
      <div className="no-print"><ReportFilter value={filter} onChange={setFilter} /></div>

      {isLoading || !data ? (
        <div className="text-center text-muted-foreground py-10">Memuat…</div>
      ) : (
        <ReportShell
          title="Laporan Neraca"
          subtitle="Bentuk Staffel"
          bumdes={header ?? {}}
          periodLabel={`Per tanggal ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(filter.end_date))}`}
        >
          <NeracaStaffel rows={rows} labaBerjalan={data.labaBerjalan} />
        </ReportShell>
      )}
    </div>
  );
}
