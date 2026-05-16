import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ReportFilterValue {
  unit_id: string | null;
  start_date: string;
  end_date: string;
}

export function ReportFilter({
  value, onChange, showConsolidate = true, showDateRange = true,
}: {
  value: ReportFilterValue;
  onChange: (v: ReportFilterValue) => void;
  showConsolidate?: boolean;
  showDateRange?: boolean;
}) {
  const { isSuperAdmin, unitId } = useAuth();
  const { data: units } = useQuery({
    queryKey: ["units"],
    enabled: isSuperAdmin,
    queryFn: async () => (await supabase.from("business_units").select("id, nama_unit").order("nama_unit")).data ?? [],
  });

  return (
    <div className="rounded-lg border bg-card p-4 flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Cakupan</Label>
        {isSuperAdmin ? (
          <Select value={value.unit_id ?? "__all__"} onValueChange={(v) => onChange({ ...value, unit_id: v === "__all__" ? null : v })}>
            <SelectTrigger className="min-w-[240px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {showConsolidate && <SelectItem value="__all__">Konsolidasi Seluruh BUMDes</SelectItem>}
              {(units ?? []).map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nama_unit}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <div className="px-3 py-2 text-sm rounded-md bg-secondary min-w-[240px]">Unit milik Anda</div>
        )}
      </div>
      {showDateRange && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">Mulai</Label>
            <Input type="date" value={value.start_date} onChange={(e) => onChange({ ...value, start_date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Akhir</Label>
            <Input type="date" value={value.end_date} onChange={(e) => onChange({ ...value, end_date: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );
}

export function useDefaultFilter(): ReportFilterValue {
  const { isSuperAdmin, unitId } = useAuth();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const end = today.toISOString().slice(0, 10);
  return { unit_id: isSuperAdmin ? null : unitId, start_date: start, end_date: end };
}
