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

export const Route = createFileRoute("/unit/dashboard/$unitId/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { unitId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["unit-customers", unitId],
    queryFn: async () => (await supabase.from("customers").select("*").eq("unit_id", unitId).order("nama_customer")).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Pelanggan</h2>
          <p className="text-sm text-muted-foreground">Master data pelanggan unit ini.</p>
        </div>
        <AddCustomerDialog unitId={unitId} onSuccess={() => qc.invalidateQueries({ queryKey: ["unit-customers", unitId] })} />
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr className="text-left">
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Kontak</th>
            <th className="px-4 py-3 font-medium">Alamat</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Belum ada pelanggan</td></tr>}
            {(data ?? []).map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.nama_customer}</td>
                <td className="px-4 py-3">{c.kontak ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.alamat ?? "—"}</td>
                <td className="px-4 py-3"><span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddCustomerDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama_customer: "", kontak: "", alamat: "" });
  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("customers").insert({ unit_id: unitId, nama_customer: form.nama_customer, kontak: form.kontak || null, alamat: form.alamat || null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Pelanggan ditambahkan"); setOpen(false); setForm({ nama_customer: "", kontak: "", alamat: "" }); onSuccess(); },
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan"),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Tambah Pelanggan</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nama Pelanggan</Label><Input value={form.nama_customer} onChange={(e) => setForm({ ...form, nama_customer: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Kontak</Label><Input value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} placeholder="No. HP / email" /></div>
          <div className="space-y-1.5"><Label>Alamat</Label><Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!form.nama_customer || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Menyimpan…" : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
