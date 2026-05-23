import { createFileRoute } from "@tanstack/react-router";
import { UnitPagePlaceholder } from "@/components/unit/unit-shell";
export const Route = createFileRoute("/unit/dashboard/$unitId/receivables")({
  component: () => (
    <UnitPagePlaceholder
      title="Piutang Penjualan"
      description="Daftar piutang dari penjualan kredit & pencatatan pembayaran pelanggan."
      columns={["Pelanggan", "No. Invoice", "Tanggal", "Outstanding", "Aksi"]}
    />
  ),
});
