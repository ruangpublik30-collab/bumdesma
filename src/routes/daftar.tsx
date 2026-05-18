import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitRegistration } from "@/lib/registrations.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/daftar")({
  head: () => ({ meta: [{ title: "Pendaftaran BUMDes — ERP BUMDes" }] }),
  component: DaftarPage,
});

const Req = () => <span className="text-destructive ml-0.5">*</span>;

function DaftarPage() {
  const submit = useServerFn(submitRegistration);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    nama_bumdes: "",
    nama_desa: "",
    nama_kecamatan: "",
    email: "",
    nama_pemohon: "",
    gender: "",
    agama: "",
    alamat: "",
    nomor_whatsapp: "",
    email_akses: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({
        data: {
          nama_bumdes: form.nama_bumdes,
          nama_desa: form.nama_desa,
          nama_kecamatan: form.nama_kecamatan,
          email: form.email,
          nama_pemohon: form.nama_pemohon,
          gender: form.gender || null,
          agama: form.agama || null,
          alamat: form.alamat || null,
          nomor_whatsapp: form.nomor_whatsapp || null,
          email_akses: form.email_akses,
        },
      });
      setDone(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal mengirim pendaftaran");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4 py-10">
        <div className="max-w-md rounded-lg border bg-card p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
          <h1 className="mt-4 font-display text-2xl font-bold">Pendaftaran Terkirim</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Terima kasih. Tim platform akan meninjau pendaftaran Anda dalam ≤28 jam. Setelah disetujui, kredensial login direktur BUMDes akan dikirim ke email <strong>{form.email_akses}</strong>.
          </p>
          <Button asChild className="mt-6 w-full"><Link to="/">Kembali ke Beranda</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="mt-4 rounded-lg border bg-card p-8">
          <h1 className="font-display text-2xl font-bold">Pendaftaran BUMDes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Isi data BUMDes dan pemohon. Tim platform akan meninjau dalam ≤28 jam.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Nama BUMDes <Req /></Label>
              <Input required value={form.nama_bumdes} onChange={(e) => setForm({ ...form, nama_bumdes: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nama Desa <Req /></Label>
                <Input required value={form.nama_desa} onChange={(e) => setForm({ ...form, nama_desa: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nama Kecamatan <Req /></Label>
                <Input required value={form.nama_kecamatan} onChange={(e) => setForm({ ...form, nama_kecamatan: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Kontak BUMDes <Req /></Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Nama Pemohon <Req /></Label>
              <Input required value={form.nama_pemohon} onChange={(e) => setForm({ ...form, nama_pemohon: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Agama</Label>
                <Input value={form.agama} onChange={(e) => setForm({ ...form, agama: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alamat</Label>
              <Textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Nomor WhatsApp</Label>
              <Input value={form.nomor_whatsapp} onChange={(e) => setForm({ ...form, nomor_whatsapp: e.target.value })} placeholder="08xxxxxxxxx" />
            </div>

            <div className="space-y-2">
              <Label>Email Akses (untuk login Direktur BUMDes) <Req /></Label>
              <Input type="email" required value={form.email_akses} onChange={(e) => setForm({ ...form, email_akses: e.target.value })} />
              <p className="text-xs text-muted-foreground">Email ini akan digunakan untuk login direktur setelah disetujui.</p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Mengirim…" : "Kirim Pendaftaran"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
