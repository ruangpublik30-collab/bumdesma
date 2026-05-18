
-- ============ DROP OLD ============
DROP TABLE IF EXISTS public.journal_items CASCADE;
DROP TABLE IF EXISTS public.journals CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;
DROP TABLE IF EXISTS public.business_units CASCADE;
DROP TABLE IF EXISTS public.coa_template_unit CASCADE;
DROP TABLE IF EXISTS public.coa_template_global CASCADE;
DROP TABLE IF EXISTS public.unit_templates CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.unit_status CASCADE;
DROP TYPE IF EXISTS public.coa_tipe CASCADE;
DROP FUNCTION IF EXISTS public.provision_unit_coa() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.user_unit_ids(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_access_unit(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- ============ ENUMS ============
CREATE TYPE public.tenant_status AS ENUM ('pending','active','suspended');
CREATE TYPE public.registration_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.app_role AS ENUM ('super_admin_platform','direktur_bumdes','admin_bumdes','manager_unit');
CREATE TYPE public.coa_tipe AS ENUM ('aset','kewajiban','ekuitas','pendapatan','beban');
CREATE TYPE public.unit_status AS ENUM ('aktif','nonaktif');

-- ============ COMMON ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ TENANTS ============
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_bumdes TEXT NOT NULL,
  kode_bumdes TEXT NOT NULL UNIQUE,
  nama_desa TEXT NOT NULL,
  nama_kecamatan TEXT NOT NULL,
  alamat TEXT,
  nomor_whatsapp TEXT,
  email TEXT,
  status public.tenant_status NOT NULL DEFAULT 'active',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER tenants_updated BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ REGISTRATIONS ============
CREATE TABLE public.tenant_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_bumdes TEXT NOT NULL,
  nama_desa TEXT NOT NULL,
  nama_kecamatan TEXT NOT NULL,
  email TEXT NOT NULL,
  nama_pemohon TEXT NOT NULL,
  gender TEXT,
  agama TEXT,
  alamat TEXT,
  nomor_whatsapp TEXT,
  email_akses TEXT NOT NULL,
  status public.registration_status NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ UNIT TEMPLATES ============
CREATE TABLE public.unit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_template TEXT NOT NULL,
  kode_template TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.coa_template_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL,
  nama TEXT NOT NULL,
  tipe public.coa_tipe NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.coa_template_unit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.unit_templates(id) ON DELETE CASCADE,
  kode TEXT NOT NULL,
  nama TEXT NOT NULL,
  tipe public.coa_tipe NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ BUSINESS UNITS ============
CREATE TABLE public.business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.unit_templates(id) ON DELETE SET NULL,
  kode_unit TEXT NOT NULL,
  nama_unit TEXT NOT NULL,
  jenis_unit TEXT NOT NULL,
  status public.unit_status NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, kode_unit)
);
CREATE TRIGGER units_updated BEFORE UPDATE ON public.business_units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  kode TEXT NOT NULL,
  nama TEXT NOT NULL,
  tipe public.coa_tipe NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (unit_id, kode)
);

CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  nomor TEXT NOT NULL,
  deskripsi TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.journal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
  debit NUMERIC NOT NULL DEFAULT 0,
  kredit NUMERIC NOT NULL DEFAULT 0,
  deskripsi TEXT
);

-- ============ PROFILES & ROLES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  default_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.business_units(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX user_roles_unique_idx ON public.user_roles
  (user_id, role, COALESCE(tenant_id,'00000000-0000-0000-0000-000000000000'::uuid),
   COALESCE(unit_id,'00000000-0000-0000-0000-000000000000'::uuid));

-- ============ SECURITY DEFINER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_platform(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin_platform')
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND tenant_id = _tenant_id)
$$;

CREATE OR REPLACE FUNCTION public.can_manage_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin_platform(_user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND tenant_id = _tenant_id
      AND role IN ('direktur_bumdes','admin_bumdes')
  )
$$;

CREATE OR REPLACE FUNCTION public.unit_tenant_id(_unit_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.business_units WHERE id = _unit_id
$$;

CREATE OR REPLACE FUNCTION public.can_access_unit(_user_id UUID, _unit_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin_platform(_user_id)
      OR public.is_tenant_member(_user_id, public.unit_tenant_id(_unit_id))
$$;

-- ============ ENABLE RLS ============
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_template_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_template_unit ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
-- tenants
CREATE POLICY tenants_super_all ON public.tenants FOR ALL TO authenticated
  USING (public.is_super_admin_platform(auth.uid()))
  WITH CHECK (public.is_super_admin_platform(auth.uid()));
CREATE POLICY tenants_member_select ON public.tenants FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), id));

-- registrations
CREATE POLICY reg_anyone_insert ON public.tenant_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY reg_super_select ON public.tenant_registrations FOR SELECT TO authenticated
  USING (public.is_super_admin_platform(auth.uid()));
CREATE POLICY reg_super_update ON public.tenant_registrations FOR UPDATE TO authenticated
  USING (public.is_super_admin_platform(auth.uid()));

-- templates (read all authenticated, write super admin)
CREATE POLICY tpl_read ON public.unit_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY tpl_write ON public.unit_templates FOR ALL TO authenticated
  USING (public.is_super_admin_platform(auth.uid()))
  WITH CHECK (public.is_super_admin_platform(auth.uid()));
CREATE POLICY tpl_g_read ON public.coa_template_global FOR SELECT TO authenticated USING (true);
CREATE POLICY tpl_g_write ON public.coa_template_global FOR ALL TO authenticated
  USING (public.is_super_admin_platform(auth.uid()))
  WITH CHECK (public.is_super_admin_platform(auth.uid()));
CREATE POLICY tpl_u_read ON public.coa_template_unit FOR SELECT TO authenticated USING (true);
CREATE POLICY tpl_u_write ON public.coa_template_unit FOR ALL TO authenticated
  USING (public.is_super_admin_platform(auth.uid()))
  WITH CHECK (public.is_super_admin_platform(auth.uid()));

-- business_units
CREATE POLICY units_select ON public.business_units FOR SELECT TO authenticated
  USING (public.is_super_admin_platform(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY units_manage ON public.business_units FOR ALL TO authenticated
  USING (public.can_manage_tenant(auth.uid(), tenant_id))
  WITH CHECK (public.can_manage_tenant(auth.uid(), tenant_id));

-- coa
CREATE POLICY coa_select ON public.chart_of_accounts FOR SELECT TO authenticated
  USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY coa_manage ON public.chart_of_accounts FOR ALL TO authenticated
  USING (public.can_manage_tenant(auth.uid(), public.unit_tenant_id(unit_id)))
  WITH CHECK (public.can_manage_tenant(auth.uid(), public.unit_tenant_id(unit_id)));

-- journals
CREATE POLICY jrn_select ON public.journals FOR SELECT TO authenticated
  USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY jrn_insert ON public.journals FOR INSERT TO authenticated
  WITH CHECK (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY jrn_update ON public.journals FOR UPDATE TO authenticated
  USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY jrn_delete ON public.journals FOR DELETE TO authenticated
  USING (public.can_access_unit(auth.uid(), unit_id));

CREATE POLICY jit_select ON public.journal_items FOR SELECT TO authenticated
  USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY jit_insert ON public.journal_items FOR INSERT TO authenticated
  WITH CHECK (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY jit_update ON public.journal_items FOR UPDATE TO authenticated
  USING (public.can_access_unit(auth.uid(), unit_id));
CREATE POLICY jit_delete ON public.journal_items FOR DELETE TO authenticated
  USING (public.can_access_unit(auth.uid(), unit_id));

-- profiles
CREATE POLICY prof_self_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin_platform(auth.uid()));
CREATE POLICY prof_self_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY prof_self_insert ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY prof_super_manage ON public.profiles FOR ALL TO authenticated
  USING (public.is_super_admin_platform(auth.uid()))
  WITH CHECK (public.is_super_admin_platform(auth.uid()));

-- user_roles
CREATE POLICY roles_self_select ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin_platform(auth.uid()));
CREATE POLICY roles_super_manage ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin_platform(auth.uid()))
  WITH CHECK (public.is_super_admin_platform(auth.uid()));

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.provision_unit_coa()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

CREATE TRIGGER trg_provision_unit_coa
  AFTER INSERT ON public.business_units
  FOR EACH ROW EXECUTE FUNCTION public.provision_unit_coa();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE has_super BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role='super_admin_platform') INTO has_super;
  IF NOT has_super THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin_platform');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ APPROVAL RPC ============
CREATE OR REPLACE FUNCTION public.approve_tenant_registration(_registration_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  reg RECORD;
  new_tenant_id UUID;
  new_kode TEXT;
  seq INT;
BEGIN
  IF NOT public.is_super_admin_platform(auth.uid()) THEN
    RAISE EXCEPTION 'Hanya super admin platform yang dapat menyetujui pendaftaran';
  END IF;

  SELECT * INTO reg FROM public.tenant_registrations WHERE id = _registration_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pendaftaran tidak ditemukan'; END IF;
  IF reg.status <> 'pending' THEN RAISE EXCEPTION 'Pendaftaran sudah diproses'; END IF;

  SELECT COUNT(*)+1 INTO seq FROM public.tenants;
  new_kode := 'BUM-' || LPAD(seq::TEXT, 4, '0');

  INSERT INTO public.tenants (nama_bumdes, kode_bumdes, nama_desa, nama_kecamatan, alamat, nomor_whatsapp, email, status, approved_at, approved_by)
  VALUES (reg.nama_bumdes, new_kode, reg.nama_desa, reg.nama_kecamatan, reg.alamat, reg.nomor_whatsapp, reg.email_akses, 'active', now(), auth.uid())
  RETURNING id INTO new_tenant_id;

  UPDATE public.tenant_registrations
  SET status='approved', reviewed_at=now(), reviewed_by=auth.uid(), tenant_id=new_tenant_id
  WHERE id = _registration_id;

  RETURN jsonb_build_object('tenant_id', new_tenant_id, 'kode_bumdes', new_kode, 'nama_bumdes', reg.nama_bumdes, 'email_akses', reg.email_akses, 'nama_pemohon', reg.nama_pemohon);
END $$;

CREATE OR REPLACE FUNCTION public.reject_tenant_registration(_registration_id UUID, _reason TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin_platform(auth.uid()) THEN
    RAISE EXCEPTION 'Hanya super admin platform yang dapat menolak pendaftaran';
  END IF;
  UPDATE public.tenant_registrations
  SET status='rejected', reviewed_at=now(), reviewed_by=auth.uid(), rejection_reason=_reason
  WHERE id = _registration_id AND status='pending';
END $$;

-- Realtime untuk pendaftaran
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_registrations;
