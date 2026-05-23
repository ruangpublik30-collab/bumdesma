import { createFileRoute } from "@tanstack/react-router";
import { UnitPagePlaceholder } from "@/components/unit/unit-shell";
export const Route = createFileRoute("/unit/dashboard/$unitId/payables")({
  component: () => (
    <UnitPagePlaceholder
      title="Hutang Pembelian"
      description="Daftar hutang supplier & pencatatan pembayaran."
      columns={["Supplier", "No. Dokumen", "Tanggal", "Outstanding", "Aksi"]}
    />
  ),
});
