import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/unit/dashboard/$unitId/suppliers")({
  component: SuppliersPage,
});

function SuppliersPage() {
  const { unitId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-suppliers", unitId],
    queryFn: async () => (await supabase.from("suppliers").select("*").eq("unit_id", unitId).order("nama_supplier")).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 min-w-0">
        <div>
          <h2 className="font-display text-2xl font-bold">Supplier</h2>
          <p className="text-sm text-muted-foreground">Master supplier unit ini.</p>
        </div>
        <AddSupplierDialog unitId={unitId} onSuccess={() => qc.invalidateQueries({ queryKey: ["unit-suppliers", unitId] })} />
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nama</th><th className="px-4 py-3 font-medium">Kontak</th><th className="px-4 py-3 font-medium">Alamat</th><th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Belum ada supplier</td></tr>}
            {(data ?? []).map((s: any) => (
              <tr key={s.id}><td className="px-4 py-3 font-medium">{s.nama_supplier}</td><td className="px-4 py-3">{s.kontak ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{s.alamat ?? "—"}</td><td className="px-4 py-3"><span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">{s.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddSupplierDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama_supplier: "", kontak: "", alamat: "" });
  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("suppliers").insert({ unit_id: unitId, nama_supplier: form.nama_supplier, kontak: form.kontak || null, alamat: form.alamat || null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Supplier ditambahkan"); setOpen(false); setForm({ nama_supplier: "", kontak: "", alamat: "" }); onSuccess(); },
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan"),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Tambah Supplier</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Supplier</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nama Supplier</Label><Input value={form.nama_supplier} onChange={(e) => setForm({ ...form, nama_supplier: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Kontak</Label><Input value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Alamat</Label><Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!form.nama_supplier || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Menyimpan…" : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
