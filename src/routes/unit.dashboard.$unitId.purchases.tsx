import { createFileRoute } from "@tanstack/react-router";
import { UnitPagePlaceholder } from "@/components/unit/unit-shell";
export const Route = createFileRoute("/unit/dashboard/$unitId/purchases")({
  component: () => (
    <UnitPagePlaceholder
      title="Pembelian Barang"
      description="Purchase order & goods receipt. Otomatis membuat jurnal persediaan & hutang."
      columns={["No. PO/GR", "Tanggal", "Supplier", "Total", "Status"]}
    />
  ),
});
