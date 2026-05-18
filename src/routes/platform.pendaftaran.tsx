import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { approveRegistration, rejectRegistration } from "@/lib/registrations.functions";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Copy, Inbox, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/platform/pendaftaran")({
  head: () => ({ meta: [{ title: "Pendaftaran BUMDes — Platform" }] }),
  component: () => <Protected require="platform"><PlatformPendaftaranPage /></Protected>,
});

type Registration = {
  id: string;
  nama_bumdes: string;
  nama_desa: string;
  nama_kecamatan: string;
  email: string;
  nama_pemohon: string;
  gender: string | null;
  agama: string | null;
  alamat: string | null;
  nomor_whatsapp: string | null;
  email_akses: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason: string | null;
};

interface ApprovalResult {
  tenant_id: string;
  kode_bumdes: string;
  nama_bumdes: string;
  email: string;
  password: string;
  nama_pemohon: string;
}

function PlatformPendaftaranPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const approve = useServerFn(approveRegistration);
  const reject = useServerFn(rejectRegistration);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["registrations", tab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_registrations")
        .select("*")
        .eq("status", tab)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Registration[];
    },
  });

  const doApprove = async (id: string) => {
    try {
      const res = await approve({ data: { registration_id: id } });
      setApprovalResult(res);
      qc.invalidateQueries({ queryKey: ["registrations"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menyetujui");
    }
  };

  const doReject = async () => {
    if (!rejectingId) return;
    try {
      await reject({ data: { registration_id: rejectingId, reason: rejectReason } });
      toast.success("Pendaftaran ditolak");
      setRejectingId(null);
      setRejectReason("");
      qc.invalidateQueries({ queryKey: ["registrations"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menolak");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Pendaftaran BUMDes</h2>
        <p className="text-sm text-muted-foreground">Tinjau dan setujui pendaftaran BUMDes baru.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Menunggu</TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="space-y-3">
            {isLoading && <div className="text-center text-muted-foreground py-10">Memuat…</div>}
            {!isLoading && (rows?.length ?? 0) === 0 && (
              <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Tidak ada pendaftaran {tab === "pending" ? "menunggu" : tab === "approved" ? "yang disetujui" : "yang ditolak"}.
              </div>
            )}
            {(rows ?? []).map((r) => (
              <div key={r.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-display font-semibold text-lg">{r.nama_bumdes}</div>
                    <div className="text-sm text-muted-foreground">
                      Desa {r.nama_desa}, Kec. {r.nama_kecamatan}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Diajukan {formatDate(r.created_at)}</div>
                  </div>
                  {tab === "pending" && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setRejectingId(r.id); setRejectReason(""); }}>
                        <X className="h-4 w-4 mr-1" /> Tolak
                      </Button>
                      <Button size="sm" onClick={() => doApprove(r.id)}>
                        <Check className="h-4 w-4 mr-1" /> Setujui
                      </Button>
                    </div>
                  )}
                </div>
                <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <Field label="Pemohon" value={r.nama_pemohon} />
                  <Field label="Email Akses" value={r.email_akses} />
                  <Field label="Email Kontak" value={r.email} />
                  <Field label="WhatsApp" value={r.nomor_whatsapp ?? "—"} />
                  <Field label="Jenis Kelamin" value={r.gender ?? "—"} />
                  <Field label="Agama" value={r.agama ?? "—"} />
                  {r.alamat && <Field label="Alamat" value={r.alamat} className="sm:col-span-2" />}
                  {r.rejection_reason && <Field label="Alasan Penolakan" value={r.rejection_reason} className="sm:col-span-2 text-destructive" />}
                </dl>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal hasil approve — tampilkan kredensial sekali */}
      <Dialog open={!!approvalResult} onOpenChange={(o) => !o && setApprovalResult(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>BUMDes berhasil dibuat</DialogTitle>
            <DialogDescription>
              Sampaikan kredensial berikut kepada direktur BUMDes. <strong>Password tidak akan ditampilkan lagi.</strong>
            </DialogDescription>
          </DialogHeader>
          {approvalResult && (
            <div className="space-y-3">
              <div className="rounded-md border bg-secondary p-3 text-sm">
                <div className="text-xs text-muted-foreground">BUMDes</div>
                <div className="font-semibold">{approvalResult.nama_bumdes}</div>
                <div className="text-xs text-muted-foreground mt-1">Kode: <span className="font-mono">{approvalResult.kode_bumdes}</span></div>
              </div>
              <CredRow label="Email Login" value={approvalResult.email} />
              <CredRow label="Password Sementara" value={approvalResult.password} />
              <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span>Salin kredensial sekarang dan kirim secara aman (mis. WhatsApp pribadi). Setelah dialog ditutup, password tidak dapat ditampilkan lagi.</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setApprovalResult(null)}>Saya sudah menyalin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal reject */}
      <Dialog open={!!rejectingId} onOpenChange={(o) => !o && setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pendaftaran</DialogTitle>
            <DialogDescription>Berikan alasan singkat. Alasan akan disimpan untuk arsip.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Alasan Penolakan</Label>
            <Textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="cth: Data desa tidak valid…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>Batal</Button>
            <Button variant="destructive" onClick={doReject} disabled={rejectReason.trim().length < 3}>Tolak Pendaftaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex gap-2">
        <Input readOnly value={value} className="font-mono" />
        <Button type="button" variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} disalin`); }}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
