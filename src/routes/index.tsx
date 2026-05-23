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
    <div className="min-h-screen bg-[#F8FAF7]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-[#16A34A] text-white grid place-items-center font-bold shadow-sm">B</div>
            <div>
              <div className="font-display font-bold text-[#111827]">ERP BUMDes</div>
              <div className="text-xs text-[#6B7280]">Platform Multi-Tenant</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-[#16A34A] text-[#16A34A] hover:bg-[#EAF7EE]"><Link to="/login">Masuk</Link></Button>
            <Button asChild className="bg-[#16A34A] hover:bg-[#15803D] text-white"><Link to="/daftar">Daftarkan BUMDes</Link></Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8] px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Platform Resmi Akuntansi BUMDes
          </div>
          <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-[#111827]">
            Platform akuntansi untuk <span className="text-[#16A34A]">BUMDes seluruh Indonesia</span>.
          </h1>
          <p className="mt-4 text-lg text-[#6B7280]">
            Daftarkan BUMDes Anda — setelah disetujui oleh admin platform, BUMDes Anda mendapat workspace tersendiri:
            login direktur, manajemen unit usaha, pencatatan transaksi, dan laporan keuangan multi-unit beserta konsolidasi.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg" className="bg-[#16A34A] hover:bg-[#15803D] text-white"><Link to="/daftar">Daftarkan BUMDes</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-[#16A34A] text-[#16A34A] hover:bg-[#EAF7EE]"><Link to="/login">Sudah punya akun? Masuk</Link></Button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-Unit Usaha", desc: "Tambah unit dagang, simpan pinjam, budidaya, jasa, air bersih — semua dalam satu BUMDes.", iconBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]" },
            { icon: BookOpen, title: "Transaksi Sederhana", desc: "Catat uang masuk & keluar — sistem otomatis menyusun jurnal akuntansi double-entry.", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#2563EB]" },
            { icon: FileBarChart, title: "Laporan + Konsolidasi", desc: "Laba Rugi, Neraca, Arus Kas per unit serta konsolidasi seluruh BUMDes.", iconBg: "bg-[#FED7AA]", iconColor: "text-[#F97316]" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-11 w-11 rounded-xl grid place-items-center ${f.iconBg}`}>
                <f.icon className={`h-5 w-5 ${f.iconColor}`} />
              </div>
              <h3 className="mt-4 font-display font-bold text-[#111827]">{f.title}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-[#6B7280] flex justify-between">
          <span>© {new Date().getFullYear()} ERP BUMDes</span>
          <span>Platform akuntansi multi-tenant untuk BUMDes</span>
        </div>
      </footer>
    </div>
  );
}

