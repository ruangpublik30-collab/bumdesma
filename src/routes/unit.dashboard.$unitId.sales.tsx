import { createFileRoute } from "@tanstack/react-router";
import { UnitPagePlaceholder } from "@/components/unit/unit-shell";

export const Route = createFileRoute("/unit/dashboard/$unitId/sales")({
  component: () => (
    <UnitPagePlaceholder
      title="Penjualan Barang"
      description="Sales order, invoice, dan pengiriman barang. Otomatis membuat jurnal pendapatan & HPP."
      columns={["Nomor", "Tanggal", "Pelanggan", "Total", "Status", "Aksi"]}
    />
  ),
});
