
CREATE TABLE public.unit_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_template text NOT NULL,
  kode_template text NOT NULL UNIQUE,
  deskripsi text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.unit_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_read_all" ON public.unit_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "templates_write_super" ON public.unit_templates
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

ALTER TABLE public.coa_template_unit
  ADD COLUMN template_id uuid REFERENCES public.unit_templates(id) ON DELETE CASCADE;

DELETE FROM public.coa_template_unit WHERE template_id IS NULL;
ALTER TABLE public.coa_template_unit ALTER COLUMN template_id SET NOT NULL;
CREATE INDEX idx_coa_tpl_unit_template ON public.coa_template_unit(template_id);

ALTER TABLE public.business_units
  ADD COLUMN template_id uuid REFERENCES public.unit_templates(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.provision_unit_coa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.chart_of_accounts (unit_id, kode, nama, tipe)
  SELECT NEW.id, kode, nama, tipe FROM public.coa_template_global;

  IF NEW.template_id IS NOT NULL THEN
    INSERT INTO public.chart_of_accounts (unit_id, kode, nama, tipe)
    SELECT NEW.id,
           t.kode || '-' || NEW.kode_unit,
           replace(t.nama, '{UNIT}', NEW.nama_unit),
           t.tipe
    FROM public.coa_template_unit t
    WHERE t.template_id = NEW.template_id;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_provision_unit_coa ON public.business_units;
CREATE TRIGGER trg_provision_unit_coa
AFTER INSERT ON public.business_units
FOR EACH ROW EXECUTE FUNCTION public.provision_unit_coa();

INSERT INTO public.unit_templates (nama_template, kode_template, deskripsi, is_default) VALUES
  ('Dagang', 'DAGANG', 'Unit usaha perdagangan / toko / sembako', true),
  ('Simpan Pinjam', 'SIMPAN_PINJAM', 'Unit usaha keuangan mikro / koperasi simpan pinjam', false),
  ('Budidaya', 'BUDIDAYA', 'Unit usaha pertanian, peternakan, perikanan, ketahanan pangan', false),
  ('Jasa', 'JASA', 'Unit usaha penyedia jasa', false),
  ('Air Bersih', 'AIR_BERSIH', 'Unit pengelolaan air bersih / PAM Desa', false);

INSERT INTO public.coa_template_unit (template_id, kode, nama, tipe)
SELECT id, '1201', 'Persediaan Barang Dagang {UNIT}', 'ASET'::account_type FROM public.unit_templates WHERE kode_template='DAGANG'
UNION ALL SELECT id, '4101', 'Pendapatan Penjualan {UNIT}', 'PENDAPATAN'::account_type FROM public.unit_templates WHERE kode_template='DAGANG'
UNION ALL SELECT id, '5101', 'Harga Pokok Penjualan {UNIT}', 'HPP'::account_type FROM public.unit_templates WHERE kode_template='DAGANG'
UNION ALL SELECT id, '1301', 'Piutang Anggota {UNIT}', 'ASET'::account_type FROM public.unit_templates WHERE kode_template='SIMPAN_PINJAM'
UNION ALL SELECT id, '2301', 'Simpanan Anggota {UNIT}', 'KEWAJIBAN'::account_type FROM public.unit_templates WHERE kode_template='SIMPAN_PINJAM'
UNION ALL SELECT id, '4301', 'Pendapatan Bunga Pinjaman {UNIT}', 'PENDAPATAN'::account_type FROM public.unit_templates WHERE kode_template='SIMPAN_PINJAM'
UNION ALL SELECT id, '1401', 'Persediaan Hasil Panen {UNIT}', 'ASET'::account_type FROM public.unit_templates WHERE kode_template='BUDIDAYA'
UNION ALL SELECT id, '4401', 'Pendapatan Penjualan Hasil {UNIT}', 'PENDAPATAN'::account_type FROM public.unit_templates WHERE kode_template='BUDIDAYA'
UNION ALL SELECT id, '5401', 'Beban Bibit & Pakan {UNIT}', 'BEBAN'::account_type FROM public.unit_templates WHERE kode_template='BUDIDAYA'
UNION ALL SELECT id, '4501', 'Pendapatan Jasa {UNIT}', 'PENDAPATAN'::account_type FROM public.unit_templates WHERE kode_template='JASA'
UNION ALL SELECT id, '5501', 'Beban Operasional Jasa {UNIT}', 'BEBAN'::account_type FROM public.unit_templates WHERE kode_template='JASA'
UNION ALL SELECT id, '1601', 'Persediaan Material Pipa {UNIT}', 'ASET'::account_type FROM public.unit_templates WHERE kode_template='AIR_BERSIH'
UNION ALL SELECT id, '4601', 'Pendapatan Tagihan Air {UNIT}', 'PENDAPATAN'::account_type FROM public.unit_templates WHERE kode_template='AIR_BERSIH'
UNION ALL SELECT id, '5601', 'Beban Pemeliharaan Jaringan {UNIT}', 'BEBAN'::account_type FROM public.unit_templates WHERE kode_template='AIR_BERSIH';

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_unit_templates_updated_at
BEFORE UPDATE ON public.unit_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
