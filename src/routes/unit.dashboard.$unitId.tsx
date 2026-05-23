import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UnitProtected } from "@/components/unit/unit-protected";

export const Route = createFileRoute("/unit/dashboard/$unitId")({
  head: () => ({ meta: [{ title: "Dashboard Unit — ERP BUMDes" }] }),
  component: UnitLayout,
});

function UnitLayout() {
  const { unitId } = Route.useParams();
  return (
    <UnitProtected unitId={unitId}>
      <Outlet />
    </UnitProtected>
  );
}
