export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounting_rule_settings: {
        Row: {
          bank_account_id: string | null
          cash_account_id: string | null
          cogs_account_id: string | null
          created_at: string
          id: string
          inventory_account_id: string | null
          receivable_account_id: string | null
          rule_code: string
          sales_account_id: string | null
          unit_id: string
        }
        Insert: {
          bank_account_id?: string | null
          cash_account_id?: string | null
          cogs_account_id?: string | null
          created_at?: string
          id?: string
          inventory_account_id?: string | null
          receivable_account_id?: string | null
          rule_code: string
          sales_account_id?: string | null
          unit_id: string
        }
        Update: {
          bank_account_id?: string | null
          cash_account_id?: string | null
          cogs_account_id?: string | null
          created_at?: string
          id?: string
          inventory_account_id?: string | null
          receivable_account_id?: string | null
          rule_code?: string
          sales_account_id?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_rule_settings_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cash_account_id_fkey"
            columns: ["cash_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cash_account_id_fkey"
            columns: ["cash_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cash_account_id_fkey"
            columns: ["cash_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cash_account_id_fkey"
            columns: ["cash_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cash_account_id_fkey"
            columns: ["cash_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_inventory_account_id_fkey"
            columns: ["inventory_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_inventory_account_id_fkey"
            columns: ["inventory_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_inventory_account_id_fkey"
            columns: ["inventory_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_inventory_account_id_fkey"
            columns: ["inventory_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_inventory_account_id_fkey"
            columns: ["inventory_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_receivable_account_id_fkey"
            columns: ["receivable_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_receivable_account_id_fkey"
            columns: ["receivable_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_receivable_account_id_fkey"
            columns: ["receivable_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_receivable_account_id_fkey"
            columns: ["receivable_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_receivable_account_id_fkey"
            columns: ["receivable_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_sales_account_id_fkey"
            columns: ["sales_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_sales_account_id_fkey"
            columns: ["sales_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_sales_account_id_fkey"
            columns: ["sales_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_sales_account_id_fkey"
            columns: ["sales_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_sales_account_id_fkey"
            columns: ["sales_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounting_rule_settings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_rule_templates: {
        Row: {
          bank_account_code: string | null
          cash_account_code: string | null
          cogs_account_code: string | null
          created_at: string
          id: string
          inventory_account_code: string | null
          receivable_account_code: string | null
          rule_code: string
          sales_account_code: string | null
          template_id: string
        }
        Insert: {
          bank_account_code?: string | null
          cash_account_code?: string | null
          cogs_account_code?: string | null
          created_at?: string
          id?: string
          inventory_account_code?: string | null
          receivable_account_code?: string | null
          rule_code: string
          sales_account_code?: string | null
          template_id: string
        }
        Update: {
          bank_account_code?: string | null
          cash_account_code?: string | null
          cogs_account_code?: string | null
          created_at?: string
          id?: string
          inventory_account_code?: string | null
          receivable_account_code?: string | null
          rule_code?: string
          sales_account_code?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_rule_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unit_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          created_at: string
          id: string
          jenis_unit: string
          kode_unit: string
          nama_unit: string
          status: Database["public"]["Enums"]["unit_status"]
          template_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_unit: string
          kode_unit: string
          nama_unit: string
          status?: Database["public"]["Enums"]["unit_status"]
          template_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_unit?: string
          kode_unit?: string
          nama_unit?: string
          status?: Database["public"]["Enums"]["unit_status"]
          template_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_units_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unit_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_transactions: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          jenis: string
          journal_entry_id: string | null
          jumlah: number
          kategori: string | null
          tanggal: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          jenis: string
          journal_entry_id?: string | null
          jumlah?: number
          kategori?: string | null
          tanggal?: string
          unit_id: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          jenis?: string
          journal_entry_id?: string | null
          jumlah?: number
          kategori?: string | null
          tanggal?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "cash_transactions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          created_at: string
          id: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["coa_tipe"]
          unit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["coa_tipe"]
          unit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          nama?: string
          tipe?: Database["public"]["Enums"]["coa_tipe"]
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      coa_template_global: {
        Row: {
          created_at: string
          id: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["coa_tipe"]
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["coa_tipe"]
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          nama?: string
          tipe?: Database["public"]["Enums"]["coa_tipe"]
        }
        Relationships: []
      }
      coa_template_unit: {
        Row: {
          created_at: string
          id: string
          kode: string
          nama: string
          template_id: string
          tipe: Database["public"]["Enums"]["coa_tipe"]
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          nama: string
          template_id: string
          tipe: Database["public"]["Enums"]["coa_tipe"]
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          nama?: string
          template_id?: string
          tipe?: Database["public"]["Enums"]["coa_tipe"]
        }
        Relationships: [
          {
            foreignKeyName: "coa_template_unit_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unit_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_payment_lines: {
        Row: {
          amount: number
          created_at: string
          customer_payment_id: string
          id: string
          sales_invoice_id: string
          tenant_id: string
          unit_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_payment_id: string
          id?: string
          sales_invoice_id: string
          tenant_id: string
          unit_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_payment_id?: string
          id?: string
          sales_invoice_id?: string
          tenant_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_payment_lines_customer_payment_id_fkey"
            columns: ["customer_payment_id"]
            isOneToOne: false
            referencedRelation: "customer_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_payment_lines_sales_invoice_id_fkey"
            columns: ["sales_invoice_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_payment_lines_sales_invoice_id_fkey"
            columns: ["sales_invoice_id"]
            isOneToOne: false
            referencedRelation: "v_accounts_receivable"
            referencedColumns: ["sales_invoice_id"]
          },
        ]
      }
      customer_payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          description: string | null
          id: string
          journal_entry_id: string | null
          nomor_payment: string
          payment_date: string
          payment_method: string
          status: string
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          nomor_payment: string
          payment_date?: string
          payment_method?: string
          status?: string
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          nomor_payment?: string
          payment_date?: string
          payment_method?: string
          status?: string
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          kontak: string | null
          nama_customer: string
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          kontak?: string | null
          nama_customer: string
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          kontak?: string | null
          nama_customer?: string
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_deliveries: {
        Row: {
          catatan: string | null
          created_at: string
          customer_id: string | null
          id: string
          journal_entry_id: string | null
          nomor_delivery: string
          sales_invoice_id: string | null
          sales_order_id: string | null
          status: string
          tanggal_kirim: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          journal_entry_id?: string | null
          nomor_delivery: string
          sales_invoice_id?: string | null
          sales_order_id?: string | null
          status?: string
          tanggal_kirim?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          journal_entry_id?: string | null
          nomor_delivery?: string
          sales_invoice_id?: string | null
          sales_order_id?: string | null
          status?: string
          tanggal_kirim?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_deliveries_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_deliveries_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "goods_deliveries_sales_invoice_id_fkey"
            columns: ["sales_invoice_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_deliveries_sales_invoice_id_fkey"
            columns: ["sales_invoice_id"]
            isOneToOne: false
            referencedRelation: "v_accounts_receivable"
            referencedColumns: ["sales_invoice_id"]
          },
          {
            foreignKeyName: "goods_deliveries_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_deliveries_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_delivery_lines: {
        Row: {
          created_at: string
          goods_delivery_id: string
          harga_pokok: number
          id: string
          item_id: string
          qty_delivered: number
          sales_invoice_line_id: string | null
          sales_order_line_id: string | null
          subtotal_hpp: number | null
        }
        Insert: {
          created_at?: string
          goods_delivery_id: string
          harga_pokok?: number
          id?: string
          item_id: string
          qty_delivered?: number
          sales_invoice_line_id?: string | null
          sales_order_line_id?: string | null
          subtotal_hpp?: number | null
        }
        Update: {
          created_at?: string
          goods_delivery_id?: string
          harga_pokok?: number
          id?: string
          item_id?: string
          qty_delivered?: number
          sales_invoice_line_id?: string | null
          sales_order_line_id?: string | null
          subtotal_hpp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_delivery_lines_goods_delivery_id_fkey"
            columns: ["goods_delivery_id"]
            isOneToOne: false
            referencedRelation: "goods_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_delivery_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_delivery_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "goods_delivery_lines_sales_invoice_line_id_fkey"
            columns: ["sales_invoice_line_id"]
            isOneToOne: false
            referencedRelation: "sales_invoice_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_delivery_lines_sales_order_line_id_fkey"
            columns: ["sales_order_line_id"]
            isOneToOne: false
            referencedRelation: "sales_order_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_lines: {
        Row: {
          created_at: string
          goods_receipt_id: string
          harga_pokok: number
          id: string
          item_id: string
          purchase_order_line_id: string | null
          qty_received: number
          subtotal: number | null
        }
        Insert: {
          created_at?: string
          goods_receipt_id: string
          harga_pokok?: number
          id?: string
          item_id: string
          purchase_order_line_id?: string | null
          qty_received?: number
          subtotal?: number | null
        }
        Update: {
          created_at?: string
          goods_receipt_id?: string
          harga_pokok?: number
          id?: string
          item_id?: string
          purchase_order_line_id?: string | null
          qty_received?: number
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_lines_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "v_accounts_payable"
            referencedColumns: ["goods_receipt_id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_purchase_order_line_id_fkey"
            columns: ["purchase_order_line_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          journal_entry_id: string | null
          nomor_gr: string
          payment_method: string
          purchase_order_id: string
          status: string
          supplier_id: string | null
          tanggal_terima: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          nomor_gr: string
          payment_method?: string
          purchase_order_id: string
          status?: string
          supplier_id?: string | null
          tanggal_terima?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          nomor_gr?: string
          payment_method?: string
          purchase_order_id?: string
          status?: string
          supplier_id?: string | null
          tanggal_terima?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "goods_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          created_at: string
          harga_beli: number
          harga_jual: number
          id: string
          kode_barang: string | null
          nama_barang: string
          satuan: string
          stok_awal: number
          unit_id: string
        }
        Insert: {
          created_at?: string
          harga_beli?: number
          harga_jual?: number
          id?: string
          kode_barang?: string | null
          nama_barang: string
          satuan?: string
          stok_awal?: number
          unit_id: string
        }
        Update: {
          created_at?: string
          harga_beli?: number
          harga_jual?: number
          id?: string
          kode_barang?: string | null
          nama_barang?: string
          satuan?: string
          stok_awal?: number
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          harga_pokok: number
          id: string
          item_id: string
          journal_entry_id: string | null
          keterangan: string | null
          qty: number
          tanggal: string
          tipe: string
          total_nilai: number | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          harga_pokok?: number
          id?: string
          item_id: string
          journal_entry_id?: string | null
          keterangan?: string | null
          qty?: number
          tanggal?: string
          tipe: string
          total_nilai?: number | null
          unit_id: string
        }
        Update: {
          created_at?: string
          harga_pokok?: number
          id?: string
          item_id?: string
          journal_entry_id?: string | null
          keterangan?: string | null
          qty?: number
          tanggal?: string
          tipe?: string
          total_nilai?: number | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "inventory_movements_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "inventory_movements_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          nomor: string | null
          source_id: string | null
          source_type: string | null
          status: string
          tanggal: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          nomor?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          tanggal?: string
          unit_id: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          nomor?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          tanggal?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          id: string
          journal_entry_id: string
          keterangan: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          id?: string
          journal_entry_id: string
          keterangan?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          id?: string
          journal_entry_id?: string
          keterangan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          default_tenant_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_tenant_id?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_tenant_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_tenant_id_fkey"
            columns: ["default_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_lines: {
        Row: {
          created_at: string
          harga_beli: number
          id: string
          item_id: string
          purchase_order_id: string
          qty_ordered: number
          subtotal: number | null
        }
        Insert: {
          created_at?: string
          harga_beli?: number
          id?: string
          item_id: string
          purchase_order_id: string
          qty_ordered?: number
          subtotal?: number | null
        }
        Update: {
          created_at?: string
          harga_beli?: number
          id?: string
          item_id?: string
          purchase_order_id?: string
          qty_ordered?: number
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "purchase_order_lines_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          nomor_po: string
          status: string
          supplier_id: string | null
          tanggal_po: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          nomor_po: string
          status?: string
          supplier_id?: string | null
          tanggal_po?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          nomor_po?: string
          status?: string
          supplier_id?: string | null
          tanggal_po?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_invoice_lines: {
        Row: {
          created_at: string
          harga_jual: number
          id: string
          item_id: string
          qty_invoiced: number
          sales_invoice_id: string
          sales_order_line_id: string | null
          subtotal: number | null
        }
        Insert: {
          created_at?: string
          harga_jual?: number
          id?: string
          item_id: string
          qty_invoiced?: number
          sales_invoice_id: string
          sales_order_line_id?: string | null
          subtotal?: number | null
        }
        Update: {
          created_at?: string
          harga_jual?: number
          id?: string
          item_id?: string
          qty_invoiced?: number
          sales_invoice_id?: string
          sales_order_line_id?: string | null
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoice_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoice_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "sales_invoice_lines_sales_invoice_id_fkey"
            columns: ["sales_invoice_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoice_lines_sales_invoice_id_fkey"
            columns: ["sales_invoice_id"]
            isOneToOne: false
            referencedRelation: "v_accounts_receivable"
            referencedColumns: ["sales_invoice_id"]
          },
          {
            foreignKeyName: "sales_invoice_lines_sales_order_line_id_fkey"
            columns: ["sales_order_line_id"]
            isOneToOne: false
            referencedRelation: "sales_order_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_invoices: {
        Row: {
          catatan: string | null
          created_at: string
          customer_id: string | null
          id: string
          journal_entry_id: string | null
          nomor_invoice: string
          payment_status: string
          sales_order_id: string | null
          status: string
          tanggal_invoice: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          journal_entry_id?: string | null
          nomor_invoice: string
          payment_status?: string
          sales_order_id?: string | null
          status?: string
          tanggal_invoice?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          journal_entry_id?: string | null
          nomor_invoice?: string
          payment_status?: string
          sales_order_id?: string | null
          status?: string
          tanggal_invoice?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "sales_invoices_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_lines: {
        Row: {
          created_at: string
          harga_jual: number
          id: string
          item_id: string
          qty_ordered: number
          sales_order_id: string
          subtotal: number | null
        }
        Insert: {
          created_at?: string
          harga_jual?: number
          id?: string
          item_id: string
          qty_ordered?: number
          sales_order_id: string
          subtotal?: number | null
        }
        Update: {
          created_at?: string
          harga_jual?: number
          id?: string
          item_id?: string
          qty_ordered?: number
          sales_order_id?: string
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "sales_order_lines_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          catatan: string | null
          created_at: string
          customer_id: string | null
          id: string
          nomor_so: string
          status: string
          tanggal_so: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          nomor_so: string
          status?: string
          tanggal_so?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          nomor_so?: string
          status?: string
          tanggal_so?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payment_lines: {
        Row: {
          amount: number
          created_at: string
          goods_receipt_id: string | null
          id: string
          supplier_payment_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          goods_receipt_id?: string | null
          id?: string
          supplier_payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          goods_receipt_id?: string | null
          id?: string
          supplier_payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payment_lines_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payment_lines_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "v_accounts_payable"
            referencedColumns: ["goods_receipt_id"]
          },
          {
            foreignKeyName: "supplier_payment_lines_supplier_payment_id_fkey"
            columns: ["supplier_payment_id"]
            isOneToOne: false
            referencedRelation: "supplier_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          catatan: string | null
          created_at: string
          id: string
          journal_entry_id: string | null
          nomor_payment: string
          payment_method: string
          status: string
          supplier_id: string | null
          tanggal_payment: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          catatan?: string | null
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          nomor_payment: string
          payment_method?: string
          status?: string
          supplier_id?: string | null
          tanggal_payment?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          catatan?: string | null
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          nomor_payment?: string
          payment_method?: string
          status?: string
          supplier_id?: string | null
          tanggal_payment?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          kontak: string | null
          nama_supplier: string
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          kontak?: string | null
          nama_supplier: string
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          kontak?: string | null
          nama_supplier?: string
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_registrations: {
        Row: {
          agama: string | null
          alamat: string | null
          created_at: string
          email: string
          email_akses: string
          gender: string | null
          id: string
          nama_bumdes: string
          nama_desa: string
          nama_kecamatan: string
          nama_pemohon: string
          nomor_whatsapp: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["registration_status"]
          tenant_id: string | null
        }
        Insert: {
          agama?: string | null
          alamat?: string | null
          created_at?: string
          email: string
          email_akses: string
          gender?: string | null
          id?: string
          nama_bumdes: string
          nama_desa: string
          nama_kecamatan: string
          nama_pemohon: string
          nomor_whatsapp?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          tenant_id?: string | null
        }
        Update: {
          agama?: string | null
          alamat?: string | null
          created_at?: string
          email?: string
          email_akses?: string
          gender?: string | null
          id?: string
          nama_bumdes?: string
          nama_desa?: string
          nama_kecamatan?: string
          nama_pemohon?: string
          nomor_whatsapp?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_registrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          alamat: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string | null
          id: string
          kode_bumdes: string
          nama_bumdes: string
          nama_desa: string
          nama_kecamatan: string
          nomor_whatsapp: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kode_bumdes: string
          nama_bumdes: string
          nama_desa: string
          nama_kecamatan: string
          nomor_whatsapp?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kode_bumdes?: string
          nama_bumdes?: string
          nama_desa?: string
          nama_kecamatan?: string
          nomor_whatsapp?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Relationships: []
      }
      unit_templates: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          is_default: boolean
          kode_template: string
          nama_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          is_default?: boolean
          kode_template: string
          nama_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          is_default?: boolean
          kode_template?: string
          nama_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          unit_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          unit_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          unit_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_account_balances: {
        Row: {
          account_code: string | null
          account_id: string | null
          account_name: string | null
          account_type: Database["public"]["Enums"]["coa_tipe"] | null
          saldo: number | null
          total_credit: number | null
          total_debit: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_accounts_payable: {
        Row: {
          ap_status: string | null
          goods_receipt_id: string | null
          nama_supplier: string | null
          nomor_gr: string | null
          outstanding_amount: number | null
          supplier_id: string | null
          tanggal_terima: string | null
          total_gr: number | null
          total_payment: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_accounts_receivable: {
        Row: {
          ar_status: string | null
          customer_id: string | null
          nama_customer: string | null
          nomor_invoice: string | null
          outstanding_amount: number | null
          sales_invoice_id: string | null
          tanggal_invoice: string | null
          total_invoice: number | null
          total_payment: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_balance_sheet: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: Database["public"]["Enums"]["coa_tipe"] | null
          aset: number | null
          ekuitas: number | null
          kewajiban: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_cash_bank_balance: {
        Row: {
          account_id: string | null
          kode: string | null
          nama: string | null
          saldo: number | null
          tipe: Database["public"]["Enums"]["coa_tipe"] | null
          total_credit: number | null
          total_debit: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_general_ledger: {
        Row: {
          account_code: string | null
          account_id: string | null
          account_name: string | null
          account_type: Database["public"]["Enums"]["coa_tipe"] | null
          balance_effect: number | null
          created_at: string | null
          credit: number | null
          debit: number | null
          journal_description: string | null
          journal_entry_id: string | null
          journal_line_id: string | null
          line_description: string | null
          nomor: string | null
          tanggal: string | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_income_statement: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: Database["public"]["Enums"]["coa_tipe"] | null
          beban: number | null
          laba_rugi_effect: number | null
          pendapatan: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_inventory_stock: {
        Row: {
          item_id: string | null
          kode_barang: string | null
          nama_barang: string | null
          nilai_persediaan: number | null
          qty_saldo: number | null
          satuan: string | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_laba_rugi: {
        Row: {
          kode: string | null
          nama: string | null
          saldo: number | null
          tipe: string | null
          total_credit: number | null
          total_debit: number | null
        }
        Relationships: []
      }
      v_trial_balance: {
        Row: {
          account_code: string | null
          account_id: string | null
          account_name: string | null
          account_type: Database["public"]["Enums"]["coa_tipe"] | null
          saldo_normal: number | null
          total_credit: number | null
          total_debit: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_tenant_registration: {
        Args: { _registration_id: string }
        Returns: Json
      }
      can_access_unit: {
        Args: { _unit_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      generate_accounting_rules_for_unit: {
        Args: { p_unit_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin_platform: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      post_customer_payment: { Args: { p_payment_id: string }; Returns: string }
      post_goods_delivery: {
        Args: { p_goods_delivery_id: string }
        Returns: string
      }
      post_goods_receipt: {
        Args: { p_goods_receipt_id: string }
        Returns: string
      }
      post_sales_invoice: {
        Args: { p_sales_invoice_id: string }
        Returns: string
      }
      post_supplier_payment: {
        Args: { p_supplier_payment_id: string }
        Returns: string
      }
      reject_tenant_registration: {
        Args: { _reason: string; _registration_id: string }
        Returns: undefined
      }
      unit_tenant_id: { Args: { _unit_id: string }; Returns: string }
    }
    Enums: {
      account_type:
        | "ASET"
        | "KEWAJIBAN"
        | "EKUITAS"
        | "PENDAPATAN"
        | "HPP"
        | "BEBAN"
      app_role:
        | "super_admin_platform"
        | "direktur_bumdes"
        | "admin_bumdes"
        | "manager_unit"
      coa_tipe: "aset" | "kewajiban" | "ekuitas" | "pendapatan" | "beban"
      registration_status: "pending" | "approved" | "rejected"
      tenant_status: "pending" | "active" | "suspended"
      unit_status: "aktif" | "nonaktif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: [
        "ASET",
        "KEWAJIBAN",
        "EKUITAS",
        "PENDAPATAN",
        "HPP",
        "BEBAN",
      ],
      app_role: [
        "super_admin_platform",
        "direktur_bumdes",
        "admin_bumdes",
        "manager_unit",
      ],
      coa_tipe: ["aset", "kewajiban", "ekuitas", "pendapatan", "beban"],
      registration_status: ["pending", "approved", "rejected"],
      tenant_status: ["pending", "active", "suspended"],
      unit_status: ["aktif", "nonaktif"],
    },
  },
} as const
