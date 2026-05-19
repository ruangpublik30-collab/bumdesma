
-- Cleanup orphan untuk kolom FK NOT NULL
DELETE FROM public.customer_payment_lines WHERE customer_payment_id IN (SELECT id FROM public.customer_payments WHERE customer_id NOT IN (SELECT id FROM public.customers));
DELETE FROM public.customer_payments      WHERE customer_id NOT IN (SELECT id FROM public.customers);

-- Sales orphans cleanup
DELETE FROM public.sales_invoice_lines WHERE sales_invoice_id NOT IN (SELECT id FROM public.sales_invoices)
                                          OR item_id NOT IN (SELECT id FROM public.inventory_items);
DELETE FROM public.sales_order_lines   WHERE sales_order_id   NOT IN (SELECT id FROM public.sales_orders)
                                          OR item_id NOT IN (SELECT id FROM public.inventory_items);
DELETE FROM public.goods_delivery_lines WHERE goods_delivery_id NOT IN (SELECT id FROM public.goods_deliveries)
                                          OR item_id NOT IN (SELECT id FROM public.inventory_items);
DELETE FROM public.purchase_order_lines WHERE purchase_order_id NOT IN (SELECT id FROM public.purchase_orders)
                                          OR item_id NOT IN (SELECT id FROM public.inventory_items);
DELETE FROM public.goods_receipt_lines  WHERE goods_receipt_id NOT IN (SELECT id FROM public.goods_receipts)
                                          OR item_id NOT IN (SELECT id FROM public.inventory_items);
DELETE FROM public.customer_payment_lines WHERE customer_payment_id NOT IN (SELECT id FROM public.customer_payments)
                                          OR sales_invoice_id NOT IN (SELECT id FROM public.sales_invoices);
DELETE FROM public.supplier_payment_lines WHERE supplier_payment_id NOT IN (SELECT id FROM public.supplier_payments)
                                          OR (goods_receipt_id IS NOT NULL AND goods_receipt_id NOT IN (SELECT id FROM public.goods_receipts));

DELETE FROM public.sales_orders      WHERE unit_id NOT IN (SELECT id FROM public.business_units);
DELETE FROM public.sales_invoices    WHERE unit_id NOT IN (SELECT id FROM public.business_units);
DELETE FROM public.goods_deliveries  WHERE unit_id NOT IN (SELECT id FROM public.business_units);
DELETE FROM public.purchase_orders   WHERE unit_id NOT IN (SELECT id FROM public.business_units);
DELETE FROM public.goods_receipts    WHERE unit_id NOT IN (SELECT id FROM public.business_units);
DELETE FROM public.supplier_payments WHERE unit_id NOT IN (SELECT id FROM public.business_units);
DELETE FROM public.customer_payments WHERE unit_id NOT IN (SELECT id FROM public.business_units);
DELETE FROM public.inventory_movements WHERE unit_id NOT IN (SELECT id FROM public.business_units)
                                          OR item_id NOT IN (SELECT id FROM public.inventory_items);
DELETE FROM public.cash_transactions WHERE unit_id NOT IN (SELECT id FROM public.business_units);

-- Foreign keys (NOT VALID)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('business_units',         'tenant_id',           'tenants',             'id', 'CASCADE'),
      ('business_units',         'template_id',         'unit_templates',      'id', 'SET NULL'),
      ('chart_of_accounts',      'unit_id',             'business_units',      'id', 'CASCADE'),
      ('coa_template_unit',      'template_id',         'unit_templates',      'id', 'CASCADE'),
      ('accounting_rule_templates','template_id',       'unit_templates',      'id', 'CASCADE'),
      ('accounting_rule_settings','unit_id',            'business_units',      'id', 'CASCADE'),
      ('accounting_rule_settings','cash_account_id',    'chart_of_accounts',   'id', 'SET NULL'),
      ('accounting_rule_settings','bank_account_id',    'chart_of_accounts',   'id', 'SET NULL'),
      ('accounting_rule_settings','receivable_account_id','chart_of_accounts', 'id', 'SET NULL'),
      ('accounting_rule_settings','inventory_account_id','chart_of_accounts',  'id', 'SET NULL'),
      ('accounting_rule_settings','sales_account_id',   'chart_of_accounts',   'id', 'SET NULL'),
      ('accounting_rule_settings','cogs_account_id',    'chart_of_accounts',   'id', 'SET NULL'),
      ('journal_entries',        'unit_id',             'business_units',      'id', 'CASCADE'),
      ('journal_entry_lines',    'journal_entry_id',    'journal_entries',     'id', 'CASCADE'),
      ('journal_entry_lines',    'account_id',          'chart_of_accounts',   'id', 'RESTRICT'),
      ('customers',              'unit_id',             'business_units',      'id', 'CASCADE'),
      ('suppliers',              'unit_id',             'business_units',      'id', 'CASCADE'),
      ('inventory_items',        'unit_id',             'business_units',      'id', 'CASCADE'),
      ('inventory_movements',    'unit_id',             'business_units',      'id', 'CASCADE'),
      ('inventory_movements',    'item_id',             'inventory_items',     'id', 'CASCADE'),
      ('inventory_movements',    'journal_entry_id',    'journal_entries',     'id', 'SET NULL'),
      ('sales_orders',           'unit_id',             'business_units',      'id', 'CASCADE'),
      ('sales_orders',           'customer_id',         'customers',           'id', 'SET NULL'),
      ('sales_order_lines',      'sales_order_id',      'sales_orders',        'id', 'CASCADE'),
      ('sales_order_lines',      'item_id',             'inventory_items',     'id', 'RESTRICT'),
      ('sales_invoices',         'unit_id',             'business_units',      'id', 'CASCADE'),
      ('sales_invoices',         'customer_id',         'customers',           'id', 'SET NULL'),
      ('sales_invoices',         'sales_order_id',      'sales_orders',        'id', 'SET NULL'),
      ('sales_invoices',         'journal_entry_id',    'journal_entries',     'id', 'SET NULL'),
      ('sales_invoice_lines',    'sales_invoice_id',    'sales_invoices',      'id', 'CASCADE'),
      ('sales_invoice_lines',    'item_id',             'inventory_items',     'id', 'RESTRICT'),
      ('sales_invoice_lines',    'sales_order_line_id', 'sales_order_lines',   'id', 'SET NULL'),
      ('goods_deliveries',       'unit_id',             'business_units',      'id', 'CASCADE'),
      ('goods_deliveries',       'customer_id',         'customers',           'id', 'SET NULL'),
      ('goods_deliveries',       'sales_order_id',      'sales_orders',        'id', 'SET NULL'),
      ('goods_deliveries',       'sales_invoice_id',    'sales_invoices',      'id', 'SET NULL'),
      ('goods_deliveries',       'journal_entry_id',    'journal_entries',     'id', 'SET NULL'),
      ('goods_delivery_lines',   'goods_delivery_id',   'goods_deliveries',    'id', 'CASCADE'),
      ('goods_delivery_lines',   'item_id',             'inventory_items',     'id', 'RESTRICT'),
      ('customer_payments',      'unit_id',             'business_units',      'id', 'CASCADE'),
      ('customer_payments',      'customer_id',         'customers',           'id', 'RESTRICT'),
      ('customer_payments',      'journal_entry_id',    'journal_entries',     'id', 'SET NULL'),
      ('customer_payment_lines', 'customer_payment_id', 'customer_payments',   'id', 'CASCADE'),
      ('customer_payment_lines', 'sales_invoice_id',    'sales_invoices',      'id', 'RESTRICT'),
      ('purchase_orders',        'unit_id',             'business_units',      'id', 'CASCADE'),
      ('purchase_orders',        'supplier_id',         'suppliers',           'id', 'SET NULL'),
      ('purchase_order_lines',   'purchase_order_id',   'purchase_orders',     'id', 'CASCADE'),
      ('purchase_order_lines',   'item_id',             'inventory_items',     'id', 'RESTRICT'),
      ('goods_receipts',         'unit_id',             'business_units',      'id', 'CASCADE'),
      ('goods_receipts',         'supplier_id',         'suppliers',           'id', 'SET NULL'),
      ('goods_receipts',         'purchase_order_id',   'purchase_orders',     'id', 'SET NULL'),
      ('goods_receipts',         'journal_entry_id',    'journal_entries',     'id', 'SET NULL'),
      ('goods_receipt_lines',    'goods_receipt_id',    'goods_receipts',      'id', 'CASCADE'),
      ('goods_receipt_lines',    'item_id',             'inventory_items',     'id', 'RESTRICT'),
      ('supplier_payments',      'unit_id',             'business_units',      'id', 'CASCADE'),
      ('supplier_payments',      'supplier_id',         'suppliers',           'id', 'SET NULL'),
      ('supplier_payments',      'journal_entry_id',    'journal_entries',     'id', 'SET NULL'),
      ('supplier_payment_lines', 'supplier_payment_id', 'supplier_payments',   'id', 'CASCADE'),
      ('supplier_payment_lines', 'goods_receipt_id',    'goods_receipts',      'id', 'RESTRICT'),
      ('cash_transactions',      'unit_id',             'business_units',      'id', 'CASCADE'),
      ('cash_transactions',      'journal_entry_id',    'journal_entries',     'id', 'SET NULL')
    ) AS x(tbl, col, rtbl, rcol, ondel)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema='public' AND tc.table_name = r.tbl
        AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = r.col
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.%I(%I) ON DELETE %s NOT VALID',
        r.tbl, 'fk_'||r.tbl||'_'||r.col, r.col, r.rtbl, r.rcol, r.ondel
      );
    END IF;
  END LOOP;
END $$;

-- Unique constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_unit_per_tenant_kode') THEN
    ALTER TABLE public.business_units ADD CONSTRAINT uniq_unit_per_tenant_kode UNIQUE (tenant_id, kode_unit);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_coa_per_unit_kode') THEN
    ALTER TABLE public.chart_of_accounts ADD CONSTRAINT uniq_coa_per_unit_kode UNIQUE (unit_id, kode);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_rule_unit_code') THEN
    ALTER TABLE public.accounting_rule_settings ADD CONSTRAINT uniq_rule_unit_code UNIQUE (unit_id, rule_code);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_unit_tanggal ON public.journal_entries(unit_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry          ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account        ON public.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_business_units_tenant        ON public.business_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coa_unit                     ON public.chart_of_accounts(unit_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_unit_tgl      ON public.sales_invoices(unit_id, tanggal_invoice DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_unit_tgl     ON public.purchase_orders(unit_id, tanggal_po DESC);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_unit_tgl      ON public.goods_receipts(unit_id, tanggal_terima DESC);

-- Trigger auto-generate accounting rules
CREATE OR REPLACE FUNCTION public.trg_after_business_unit_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ BEGIN
  PERFORM public.generate_accounting_rules_for_unit(NEW.id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS business_units_after_insert ON public.business_units;
CREATE TRIGGER business_units_after_insert
AFTER INSERT ON public.business_units
FOR EACH ROW EXECUTE FUNCTION public.trg_after_business_unit_insert();

-- Dokumentasi
COMMENT ON TABLE  public.tenants               IS 'BUMDes pelanggan platform. 1 tenant = 1 BUMDes. Dibuat saat approve_tenant_registration.';
COMMENT ON COLUMN public.tenants.kode_bumdes   IS 'Kode unik BUMDes format BUM-XXXX.';
COMMENT ON TABLE  public.tenant_registrations  IS 'Form pendaftaran publik calon BUMDes. Anon boleh INSERT.';
COMMENT ON TABLE  public.business_units        IS 'Unit usaha milik tenant. AFTER INSERT: provision_unit_coa + auto-generate accounting rules.';
COMMENT ON TABLE  public.unit_templates        IS 'Template jenis unit usaha. Global, dipakai semua tenant.';
COMMENT ON TABLE  public.coa_template_global   IS 'COA universal untuk semua unit baru.';
COMMENT ON TABLE  public.coa_template_unit     IS 'COA spesifik per template unit.';
COMMENT ON TABLE  public.chart_of_accounts     IS 'Bagan akun per unit (auto-generated).';
COMMENT ON TABLE  public.accounting_rule_settings IS 'Mapping akun kas/bank/piutang/persediaan/penjualan/HPP per unit.';
COMMENT ON TABLE  public.journal_entries       IS 'Header jurnal. source_type+source_id menunjuk dokumen sumber.';
COMMENT ON TABLE  public.journal_entry_lines   IS 'Detail jurnal: debit + credit per akun.';
COMMENT ON TABLE  public.customers             IS 'Pelanggan per unit.';
COMMENT ON TABLE  public.suppliers             IS 'Pemasok per unit.';
COMMENT ON TABLE  public.inventory_items       IS 'Barang/jasa per unit.';
COMMENT ON TABLE  public.inventory_movements   IS 'Mutasi stok in/out otomatis dari posting GR/Delivery.';
COMMENT ON TABLE  public.sales_orders          IS 'SO (non-akuntansi).';
COMMENT ON TABLE  public.sales_invoices        IS 'Faktur penjualan. Posting: Dr Piutang / Cr Penjualan.';
COMMENT ON TABLE  public.goods_deliveries      IS 'Pengiriman barang. Posting: Dr HPP / Cr Persediaan + stok keluar.';
COMMENT ON TABLE  public.customer_payments     IS 'Pembayaran pelanggan. Posting: Dr Kas/Bank / Cr Piutang.';
COMMENT ON TABLE  public.purchase_orders       IS 'PO (non-akuntansi).';
COMMENT ON TABLE  public.goods_receipts        IS 'Penerimaan barang. Posting: Dr Persediaan / Cr Kas atau Utang.';
COMMENT ON TABLE  public.supplier_payments     IS 'Pembayaran ke supplier. Posting: Dr Utang / Cr Kas/Bank.';
COMMENT ON FUNCTION public.post_sales_invoice(uuid)    IS 'Dr Piutang / Cr Penjualan.';
COMMENT ON FUNCTION public.post_customer_payment(uuid) IS 'Dr Kas/Bank / Cr Piutang.';
COMMENT ON FUNCTION public.post_goods_delivery(uuid)   IS 'Dr HPP / Cr Persediaan + inventory_movements(out).';
COMMENT ON FUNCTION public.post_goods_receipt(uuid)    IS 'Dr Persediaan / Cr Kas atau Utang + inventory_movements(in).';
COMMENT ON FUNCTION public.post_supplier_payment(uuid) IS 'Dr Utang / Cr Kas/Bank.';
COMMENT ON FUNCTION public.generate_accounting_rules_for_unit(uuid) IS 'Auto-fill accounting_rule_settings per unit.';
COMMENT ON FUNCTION public.approve_tenant_registration(uuid)        IS 'Approve registration: buat tenant + kode BUM-XXXX.';
