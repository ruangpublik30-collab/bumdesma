
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_unit');
CREATE TYPE public.account_type AS ENUM ('ASET','KEWAJIBAN','EKUITAS','PENDAPATAN','HPP','BEBAN');
CREATE TYPE public.unit_status AS ENUM ('aktif','nonaktif');

-- ============ MASTER ============
CREATE TABLE public.business_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_unit text NOT NULL,
  kode_unit text NOT NULL UNIQUE,
  jenis_unit text NOT NULL,
  status public.unit_status NOT NULL DEFAULT 'aktif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  unit_id uuid REFERENCES public.business_units(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, unit_id)
);

-- ============ COA TEMPLATES ============
CREATE TABLE public.coa_template_global (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE,
  nama text NOT NULL,
  tipe public.account_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.coa_template_unit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE,
  nama text NOT NULL,
  tipe public.account_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ COA AKTIF ============
CREATE TABLE public.chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  kode text NOT NULL,
  nama text NOT NULL,
  tipe public.account_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(unit_id, kode)
);
CREATE INDEX idx_coa_unit ON public.chart_of_accounts(unit_id);

-- ============ JURNAL ============
CREATE TABLE public.journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  nomor text NOT NULL,
  deskripsi text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(unit_id, nomor)
);
CREATE INDEX idx_journals_unit_tgl ON public.journals(unit_id, tanggal);

CREATE TABLE public.journal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
  unit_id uuid NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  debit numeric(18,2) NOT NULL DEFAULT 0,
  kredit numeric(18,2) NOT NULL DEFAULT 0,
  deskripsi text,
  CHECK (debit >= 0 AND kredit >= 0),
  CHECK (NOT (debit > 0 AND kredit > 0))
);
CREATE INDEX idx_jitems_journal ON public.journal_items(journal_id);
CREATE INDEX idx_jitems_account ON public.journal_items(account_id);
CREATE INDEX idx_jitems_unit ON public.journal_items(unit_id);

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.user_unit_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT unit_id FROM public.user_roles WHERE user_id = _user_id AND unit_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.can_access_unit(_user_id uuid, _unit_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_user_id)
      OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND unit_id = _unit_id);
$$;

-- ============ AUTO PROVISION COA ON UNIT INSERT ============
CREATE OR REPLACE FUNCTION public.provision_unit_coa()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Akun global: kode disalin apa adanya
  INSERT INTO public.chart_of_accounts (unit_id, kode, nama, tipe)
  SELECT NEW.id, kode, nama, tipe FROM public.coa_template_global;

  -- Akun per-unit: kode dibuat unik dengan suffix kode_unit, nama disisipi nama_unit
  INSERT INTO public.chart_of_accounts (unit_id, kode, nama, tipe)
  SELECT NEW.id,
         t.kode || '-' || NEW.kode_unit,
         replace(t.nama, '{UNIT}', NEW.nama_unit),
         t.tipe
  FROM public.coa_template_unit t;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_provision_unit_coa
AFTER INSERT ON public.business_units
FOR EACH ROW EXECUTE FUNCTION public.provision_unit_coa();

-- ============ RLS ============
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_template_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_template_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_items ENABLE ROW LEVEL SECURITY;

-- business_units
CREATE POLICY "units_select" ON public.business_units FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()) OR id IN (SELECT public.user_unit_ids(auth.uid())));
CREATE POLICY "units_insert_super" ON public.business_units FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "units_update_super" ON public.business_units FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()));
CREATE POLICY "units_delete_super" ON public.business_units FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()));

-- user_roles: hanya super_admin yang kelola; user bisa lihat role miliknya
CREATE POLICY "roles_select_self_or_super" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "roles_write_super" ON public.user_roles FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- coa templates: read-only untuk authenticated, kelola via super_admin
CREATE POLICY "tpl_global_read" ON public.coa_template_global FOR SELECT TO authenticated USING (true);
CREATE POLICY "tpl_global_write" ON public.coa_template_global FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "tpl_unit_read" ON public.coa_template_unit FOR SELECT TO authenticated USING (true);
CREATE POLICY "tpl_unit_write" ON public.coa_template_unit FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- chart_of_accounts: berdasarkan unit
CREATE POLICY "coa_select" ON public.chart_of_accounts FOR SELECT TO authenticated
USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY "coa_write_super" ON public.chart_of_accounts FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- journals
CREATE POLICY "jrn_select" ON public.journals FOR SELECT TO authenticated
USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY "jrn_insert" ON public.journals FOR INSERT TO authenticated
WITH CHECK (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY "jrn_update" ON public.journals FOR UPDATE TO authenticated
USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY "jrn_delete" ON public.journals FOR DELETE TO authenticated
USING (public.can_access_unit(auth.uid(), unit_id));

-- journal_items
CREATE POLICY "jit_select" ON public.journal_items FOR SELECT TO authenticated
USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY "jit_insert" ON public.journal_items FOR INSERT TO authenticated
WITH CHECK (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY "jit_update" ON public.journal_items FOR UPDATE TO authenticated
USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY "jit_delete" ON public.journal_items FOR DELETE TO authenticated
USING (public.can_access_unit(auth.uid(), unit_id));

-- ============ SEED TEMPLATES ============
INSERT INTO public.coa_template_global (kode, nama, tipe) VALUES
  ('1-1000','Kas','ASET'),
  ('1-1100','Bank','ASET'),
  ('1-1200','Piutang Usaha','ASET'),
  ('1-1500','Aset Tetap','ASET'),
  ('2-1000','Hutang Usaha','KEWAJIBAN'),
  ('2-2000','Hutang Bank','KEWAJIBAN'),
  ('3-1000','Modal','EKUITAS'),
  ('3-2000','Laba Ditahan','EKUITAS');

INSERT INTO public.coa_template_unit (kode, nama, tipe) VALUES
  ('4-1000','Pendapatan {UNIT}','PENDAPATAN'),
  ('4-1900','Pendapatan Lain {UNIT}','PENDAPATAN'),
  ('5-1000','HPP {UNIT}','HPP'),
  ('6-1000','Beban Gaji {UNIT}','BEBAN'),
  ('6-2000','Beban Operasional {UNIT}','BEBAN'),
  ('6-3000','Beban Perawatan {UNIT}','BEBAN');
