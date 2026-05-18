import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Building2, BookOpen, FileBarChart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ERP BUMDes — Platform Akuntansi Multi-Unit untuk Desa" },
      { name: "description", content: "Platform ERP BUMDes multi-tenant: pendaftaran BUMDes online, akuntansi multi-unit, laporan keuangan per unit dan konsolidasi." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading, isPlatformAdmin } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && user) {
      nav({ to: isPlatformAdmin ? "/platform/pendaftaran" : "/dashboard" });
    }
  }, [user, loading, isPlatformAdmin, nav]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded bg-primary text-primary-foreground grid place-items-center font-bold">B</div>
            <div>
              <div className="font-display font-semibold">ERP BUMDes</div>
              <div className="text-xs text-muted-foreground">Platform Multi-Tenant</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/login">Masuk</Link></Button>
            <Button asChild><Link to="/daftar">Daftarkan BUMDes</Link></Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Platform Resmi Akuntansi BUMDes
          </div>
          <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-foreground">
            Platform akuntansi untuk <span className="text-primary">BUMDes seluruh Indonesia</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Daftarkan BUMDes Anda — setelah disetujui oleh admin platform, BUMDes Anda mendapat workspace tersendiri:
            login direktur, manajemen unit usaha, pencatatan transaksi, dan laporan keuangan multi-unit beserta konsolidasi.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg"><Link to="/daftar">Daftarkan BUMDes</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/login">Sudah punya akun? Masuk</Link></Button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-Unit Usaha", desc: "Tambah unit dagang, simpan pinjam, budidaya, jasa, air bersih — semua dalam satu BUMDes." },
            { icon: BookOpen, title: "Transaksi Sederhana", desc: "Catat uang masuk & keluar — sistem otomatis menyusun jurnal akuntansi double-entry." },
            { icon: FileBarChart, title: "Laporan + Konsolidasi", desc: "Laba Rugi, Neraca, Arus Kas per unit serta konsolidasi seluruh BUMDes." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border bg-card p-6">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} ERP BUMDes</span>
          <span>Platform akuntansi multi-tenant untuk BUMDes</span>
        </div>
      </footer>
    </div>
  );
}
