import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Building2, BookOpen, FileBarChart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ERP BUMDes — Akuntansi Multi-Unit untuk Desa" },
      { name: "description", content: "Platform ERP BUMDes berbasis multi-unit usaha dengan akuntansi double-entry, laporan keuangan per unit, dan konsolidasi." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded bg-primary text-primary-foreground grid place-items-center font-bold">B</div>
            <div>
              <div className="font-display font-semibold">ERP BUMDes</div>
              <div className="text-xs text-muted-foreground">Sistem Multi-Unit</div>
            </div>
          </div>
          <Button asChild><Link to="/login">Masuk</Link></Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Platform Resmi Akuntansi BUMDes
          </div>
          <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-foreground">
            ERP terpadu untuk <span className="text-primary">BUMDes multi-unit</span> usaha.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Kelola unit dagang, simpan pinjam, ketahanan pangan, jasa, air bersih, hingga wisata dalam satu sistem.
            Tambah unit baru cukup satu klik — akun, dashboard, dan laporan keuangan dibuat otomatis.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg"><Link to="/login">Mulai Sekarang</Link></Button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-Tenant Unit Usaha", desc: "Setiap unit punya login, dashboard, transaksi, dan laporan keuangan sendiri." },
            { icon: BookOpen, title: "Akuntansi Double-Entry", desc: "Jurnal terintegrasi dengan bagan akun template per jenis unit usaha." },
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
          <span>Sistem akuntansi multi-unit usaha desa</span>
        </div>
      </footer>
    </div>
  );
}
