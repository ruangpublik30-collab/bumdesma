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
      accounting_periods: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closing_note: string | null
          created_at: string
          end_date: string
          id: string
          period_month: number
          period_year: number
          start_date: string
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closing_note?: string | null
          created_at?: string
          end_date: string
          id?: string
          period_month: number
          period_year: number
          start_date: string
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closing_note?: string | null
          created_at?: string
          end_date?: string
          id?: string
          period_month?: number
          period_year?: number
          start_date?: string
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
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
            referencedRelation: "v_equity_rollforward"
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
            referencedRelation: "v_equity_rollforward"
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
            referencedRelation: "v_equity_rollforward"
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
            referencedRelation: "v_equity_rollforward"
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
            referencedRelation: "v_equity_rollforward"
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
            referencedRelation: "v_equity_rollforward"
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
      audit_timeline: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json
          unit_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
          unit_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
          unit_id?: string | null
        }
        Relationships: []
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
          account_id: string | null
          created_at: string
          deskripsi: string | null
          expense_account_id: string | null
          from_account_id: string | null
          id: string
          jenis: string
          journal_entry_id: string | null
          jumlah: number
          kategori: string | null
          nomor: string | null
          payment_method: string | null
          status: string | null
          tanggal: string
          to_account_id: string | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          deskripsi?: string | null
          expense_account_id?: string | null
          from_account_id?: string | null
          id?: string
          jenis: string
          journal_entry_id?: string | null
          jumlah?: number
          kategori?: string | null
          nomor?: string | null
          payment_method?: string | null
          status?: string | null
          tanggal?: string
          to_account_id?: string | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          deskripsi?: string | null
          expense_account_id?: string | null
          from_account_id?: string | null
          id?: string
          jenis?: string
          journal_entry_id?: string | null
          jumlah?: number
          kategori?: string | null
          nomor?: string | null
          payment_method?: string | null
          status?: string | null
          tanggal?: string
          to_account_id?: string | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_equity_rollforward"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transactions_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_equity_rollforward"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "v_equity_rollforward"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
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
            foreignKeyName: "cash_transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "v_equity_rollforward"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "cash_transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
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
        Relationships: [
          {
            foreignKeyName: "fk_customer_payments_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_payments_journal_entry_id"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_payments_journal_entry_id"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "fk_customer_payments_unit_id"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
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
      depreciation_runs: {
        Row: {
          created_at: string
          id: string
          journal_entry_id: string | null
          period_month: number
          period_year: number
          posted_at: string | null
          run_by: string | null
          run_date: string
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          period_month: number
          period_year: number
          posted_at?: string | null
          run_by?: string | null
          run_date?: string
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          period_month?: number
          period_year?: number
          posted_at?: string | null
          run_by?: string | null
          run_date?: string
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_runs_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciation_runs_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "depreciation_runs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      equity_closing_lines: {
        Row: {
          account_id: string
          account_type: string
          closing_amount: number
          created_at: string
          equity_closing_run_id: string
          id: string
        }
        Insert: {
          account_id: string
          account_type: string
          closing_amount: number
          created_at?: string
          equity_closing_run_id: string
          id?: string
        }
        Update: {
          account_id?: string
          account_type?: string
          closing_amount?: number
          created_at?: string
          equity_closing_run_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equity_closing_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equity_closing_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "equity_closing_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "equity_closing_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_equity_rollforward"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "equity_closing_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "equity_closing_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "equity_closing_lines_equity_closing_run_id_fkey"
            columns: ["equity_closing_run_id"]
            isOneToOne: false
            referencedRelation: "equity_closing_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      equity_closing_runs: {
        Row: {
          closed_by: string | null
          closing_date: string
          created_at: string
          id: string
          journal_entry_id: string | null
          net_income: number
          period_month: number
          period_year: number
          posted_at: string | null
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          closed_by?: string | null
          closing_date: string
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          net_income?: number
          period_month: number
          period_year: number
          posted_at?: string | null
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          closed_by?: string | null
          closing_date?: string
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          net_income?: number
          period_month?: number
          period_year?: number
          posted_at?: string | null
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equity_closing_runs_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equity_closing_runs_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "equity_closing_runs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_asset_depreciation_lines: {
        Row: {
          accumulated_after: number
          created_at: string
          depreciation_amount: number
          depreciation_run_id: string
          fixed_asset_id: string
          id: string
        }
        Insert: {
          accumulated_after: number
          created_at?: string
          depreciation_amount: number
          depreciation_run_id: string
          fixed_asset_id: string
          id?: string
        }
        Update: {
          accumulated_after?: number
          created_at?: string
          depreciation_amount?: number
          depreciation_run_id?: string
          fixed_asset_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_asset_depreciation_lines_depreciation_run_id_fkey"
            columns: ["depreciation_run_id"]
            isOneToOne: false
            referencedRelation: "depreciation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_asset_depreciation_lines_fixed_asset_id_fkey"
            columns: ["fixed_asset_id"]
            isOneToOne: false
            referencedRelation: "fixed_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_assets: {
        Row: {
          accumulated_depreciation: number
          acquisition_cost: number
          acquisition_date: string
          asset_code: string
          asset_name: string
          created_at: string
          id: string
          journal_entry_id: string | null
          salvage_value: number
          status: string
          unit_id: string
          updated_at: string
          useful_life_months: number
        }
        Insert: {
          accumulated_depreciation?: number
          acquisition_cost: number
          acquisition_date: string
          asset_code: string
          asset_name: string
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          salvage_value?: number
          status?: string
          unit_id: string
          updated_at?: string
          useful_life_months: number
        }
        Update: {
          accumulated_depreciation?: number
          acquisition_cost?: number
          acquisition_date?: string
          asset_code?: string
          asset_name?: string
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          salvage_value?: number
          status?: string
          unit_id?: string
          updated_at?: string
          useful_life_months?: number
        }
        Relationships: []
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
      inventory_adjustment_lines: {
        Row: {
          created_at: string
          id: string
          inventory_adjustment_id: string
          item_id: string
          notes: string | null
          qty: number
          total_value: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_adjustment_id: string
          item_id: string
          notes?: string | null
          qty: number
          total_value?: number | null
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_adjustment_id?: string
          item_id?: string
          notes?: string | null
          qty?: number
          total_value?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustment_lines_inventory_adjustment_id_fkey"
            columns: ["inventory_adjustment_id"]
            isOneToOne: false
            referencedRelation: "inventory_adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustment_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustment_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_stock"
            referencedColumns: ["item_id"]
          },
        ]
      }
      inventory_adjustments: {
        Row: {
          adjustment_date: string
          adjustment_no: string
          adjustment_type: string
          approval_note: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          journal_entry_id: string | null
          posted_at: string | null
          posted_by: string | null
          reason: string
          requested_at: string | null
          requested_by: string | null
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          adjustment_date: string
          adjustment_no: string
          adjustment_type: string
          approval_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reason: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          adjustment_date?: string
          adjustment_no?: string
          adjustment_type?: string
          approval_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          journal_entry_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reason?: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "inventory_adjustments_unit_id_fkey"
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
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
      journal_correction_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          description: string | null
          id: string
          journal_correction_id: string
          original_journal_entry_line_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_correction_id: string
          original_journal_entry_line_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_correction_id?: string
          original_journal_entry_line_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_journal_correction_lines_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_cash_bank_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_equity_rollforward"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_header"
            columns: ["journal_correction_id"]
            isOneToOne: false
            referencedRelation: "journal_corrections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_original_line"
            columns: ["original_journal_entry_line_id"]
            isOneToOne: false
            referencedRelation: "journal_entry_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_journal_correction_lines_original_line"
            columns: ["original_journal_entry_line_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_line_id"]
          },
        ]
      }
      journal_corrections: {
        Row: {
          approval_note: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          correction_date: string
          correction_journal_entry_id: string | null
          correction_type: string
          created_at: string
          id: string
          original_journal_entry_id: string
          reason: string
          requested_at: string | null
          requested_by: string | null
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          approval_note?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          correction_date: string
          correction_journal_entry_id?: string | null
          correction_type: string
          created_at?: string
          id?: string
          original_journal_entry_id: string
          reason: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          approval_note?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          correction_date?: string
          correction_journal_entry_id?: string | null
          correction_type?: string
          created_at?: string
          id?: string
          original_journal_entry_id?: string
          reason?: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_journal_corrections_correction"
            columns: ["correction_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_journal_corrections_correction"
            columns: ["correction_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "fk_journal_corrections_original"
            columns: ["original_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_journal_corrections_original"
            columns: ["original_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          nomor: string | null
          reversal_of: string | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
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
          reversal_of?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
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
          reversal_of?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
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
            referencedRelation: "v_equity_rollforward"
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
      journal_repair_log: {
        Row: {
          correction_entry_id: string | null
          created_at: string | null
          id: string
          journal_entry_id: string | null
          selisih: number | null
          status: string | null
        }
        Insert: {
          correction_entry_id?: string | null
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          selisih?: number | null
          status?: string | null
        }
        Update: {
          correction_entry_id?: string | null
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          selisih?: number | null
          status?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
      profit_sharing_account_mapping: {
        Row: {
          account_id: string
          created_at: string | null
          debit_credit_side: string
          description: string | null
          id: string
          rule_id: string | null
          unit_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          debit_credit_side: string
          description?: string | null
          id?: string
          rule_id?: string | null
          unit_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          debit_credit_side?: string
          description?: string | null
          id?: string
          rule_id?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profit_sharing_account_mapping_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "profit_sharing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_sharing_lines: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          liability_account_id: string | null
          paid_amount: number | null
          remaining_amount: number | null
          rule_id: string
          run_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          liability_account_id?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          rule_id: string
          run_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          liability_account_id?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          rule_id?: string
          run_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profit_sharing_lines_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "profit_sharing_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profit_sharing_lines_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "profit_sharing_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_sharing_payments: {
        Row: {
          amount: number
          cash_transaction_id: string | null
          created_at: string | null
          id: string
          journal_entry_id: string | null
          line_id: string
          payment_method: string | null
        }
        Insert: {
          amount: number
          cash_transaction_id?: string | null
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          line_id: string
          payment_method?: string | null
        }
        Update: {
          amount?: number
          cash_transaction_id?: string | null
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          line_id?: string
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profit_sharing_payments_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "profit_sharing_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_sharing_rules: {
        Row: {
          account_id: string | null
          created_at: string | null
          distribution_type: string
          id: string
          is_active: boolean | null
          name: string
          percentage: number
          unit_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          distribution_type: string
          id?: string
          is_active?: boolean | null
          name: string
          percentage: number
          unit_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          distribution_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          percentage?: number
          unit_id?: string
        }
        Relationships: []
      }
      profit_sharing_runs: {
        Row: {
          created_at: string | null
          id: string
          net_profit: number
          period_month: number
          period_year: number
          source_equity_closing_id: string
          status: string | null
          unit_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          net_profit: number
          period_month: number
          period_year: number
          source_equity_closing_id: string
          status?: string | null
          unit_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          net_profit?: number
          period_month?: number
          period_year?: number
          source_equity_closing_id?: string
          status?: string | null
          unit_id?: string
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_code?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_role_permissions_permission"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
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
      unit_access_credentials: {
        Row: {
          access_status: string
          created_at: string
          email_virtual: string
          generated_at: string
          generated_by: string | null
          id: string
          last_password_reset_at: string | null
          login_code: string
          must_change_password: boolean
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          unit_id: string
          user_id: string
        }
        Insert: {
          access_status?: string
          created_at?: string
          email_virtual: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          last_password_reset_at?: string | null
          login_code: string
          must_change_password?: boolean
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          unit_id: string
          user_id: string
        }
        Update: {
          access_status?: string
          created_at?: string
          email_virtual?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          last_password_reset_at?: string | null
          login_code?: string
          must_change_password?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          unit_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_access_credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_access_credentials_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
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
      v_audit_timeline: {
        Row: {
          actor_id: string | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string | null
          id: string | null
          metadata: Json | null
          unit_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string | null
          id?: string | null
          metadata?: Json | null
          unit_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string | null
          id?: string | null
          metadata?: Json | null
          unit_id?: string | null
        }
        Relationships: []
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
      v_equity_rollforward: {
        Row: {
          account_id: string | null
          equity_balance: number | null
          kode: string | null
          nama: string | null
          tipe: Database["public"]["Enums"]["coa_tipe"] | null
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
          reversal_of: string | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
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
      v_income_statement_open: {
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
      v_income_statement_summary: {
        Row: {
          laba_bersih: number | null
          total_beban: number | null
          total_pendapatan: number | null
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
      approve_inventory_adjustment: {
        Args: { p_approval_note?: string; p_inventory_adjustment_id: string }
        Returns: string
      }
      approve_journal_correction: {
        Args: { p_approval_note?: string; p_journal_correction_id: string }
        Returns: string
      }
      approve_tenant_registration: {
        Args: { _registration_id: string }
        Returns: Json
      }
      assert_period_open: {
        Args: { p_transaction_date: string; p_unit_id: string }
        Returns: undefined
      }
      assert_user_has_permission: {
        Args: {
          p_permission_code: string
          p_unit_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      auto_journal_repair_engine: { Args: never; Returns: undefined }
      calculate_profit_sharing: {
        Args: { p_run_id: string }
        Returns: undefined
      }
      can_access_unit: {
        Args: { _unit_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      close_accounting_period: {
        Args: {
          p_closing_note?: string
          p_period_month: number
          p_period_year: number
          p_unit_id: string
        }
        Returns: string
      }
      create_business_unit_core: {
        Args: {
          _jenis_unit: string
          _kode_unit: string
          _nama_unit: string
          _template_id: string
          _tenant_id: string
        }
        Returns: string
      }
      create_business_unit_with_manager: {
        Args: {
          _generated_by?: string
          _jenis_unit: string
          _kode_unit: string
          _manager_user_id: string
          _nama_unit: string
          _template_id: string
          _tenant_id: string
        }
        Returns: {
          access_status: string
          credential_id: string
          email_virtual: string
          login_code: string
          role: Database["public"]["Enums"]["app_role"]
          unit_id: string
        }[]
      }
      generate_accounting_rules_for_unit: {
        Args: { p_unit_id: string }
        Returns: undefined
      }
      generate_equity_closing_run: {
        Args: { p_month: number; p_unit_id: string; p_year: number }
        Returns: string
      }
      generate_profit_sharing_journal: {
        Args: { p_run_id: string }
        Returns: undefined
      }
      generate_unit_login_code: {
        Args: { _tenant_id: string; _unit_name: string }
        Returns: string
      }
      generate_unit_virtual_email: {
        Args: { _tenant_id: string; _unit_name: string }
        Returns: string
      }
      get_user_login_context: {
        Args: { _user_id: string }
        Returns: {
          redirect_path: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          unit_id: string
        }[]
      }
      has_permission: {
        Args: {
          p_permission_code: string
          p_unit_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_period_closed: {
        Args: { p_transaction_date: string; p_unit_id: string }
        Returns: boolean
      }
      is_super_admin_platform: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_actor_id: string
          p_after_state?: Json
          p_before_state?: Json
          p_entity_id: string
          p_entity_type: string
          p_event_type: string
          p_metadata?: Json
          p_unit_id: string
        }
        Returns: undefined
      }
      pay_profit_sharing: {
        Args: { p_amount: number; p_line_id: string; p_method: string }
        Returns: undefined
      }
      post_account_reclassification_correction: {
        Args: { p_journal_correction_id: string }
        Returns: string
      }
      post_capital_contribution: {
        Args: { p_cash_transaction_id: string }
        Returns: string
      }
      post_cash_bank_transfer: {
        Args: { p_cash_transaction_id: string }
        Returns: string
      }
      post_customer_payment: { Args: { p_payment_id: string }; Returns: string }
      post_equity_closing: {
        Args: {
          p_period_month: number
          p_period_year: number
          p_unit_id: string
        }
        Returns: string
      }
      post_full_reversal_correction: {
        Args: { p_journal_correction_id: string }
        Returns: string
      }
      post_goods_delivery: {
        Args: { p_goods_delivery_id: string }
        Returns: string
      }
      post_goods_receipt: {
        Args: { p_goods_receipt_id: string }
        Returns: string
      }
      post_inventory_adjustment: {
        Args: { p_inventory_adjustment_id: string }
        Returns: string
      }
      post_monthly_depreciation: {
        Args: {
          p_period_month: number
          p_period_year: number
          p_unit_id: string
        }
        Returns: string
      }
      post_nominal_adjustment_correction: {
        Args: { p_journal_correction_id: string }
        Returns: string
      }
      post_operational_expense: {
        Args: { p_cash_transaction_id: string }
        Returns: string
      }
      post_profit_sharing: { Args: { p_run_id: string }; Returns: undefined }
      post_quick_cash_sale: {
        Args: {
          p_customer_id: string
          p_harga_jual: number
          p_harga_pokok: number
          p_item_id: string
          p_payment_method?: string
          p_qty: number
          p_tanggal?: string
          p_unit_id: string
        }
        Returns: Json
      }
      post_sales_invoice: {
        Args: { p_sales_invoice_id: string }
        Returns: string
      }
      post_supplier_payment: {
        Args: { p_supplier_payment_id: string }
        Returns: string
      }
      register_unit_access_credential: {
        Args: {
          _email_virtual: string
          _generated_by?: string
          _login_code: string
          _role: Database["public"]["Enums"]["app_role"]
          _tenant_id: string
          _unit_id: string
          _user_id: string
        }
        Returns: string
      }
      reject_inventory_adjustment: {
        Args: { p_inventory_adjustment_id: string; p_rejection_note: string }
        Returns: string
      }
      reject_journal_correction: {
        Args: { p_journal_correction_id: string; p_rejection_note: string }
        Returns: string
      }
      reject_tenant_registration: {
        Args: { _reason: string; _registration_id: string }
        Returns: undefined
      }
      reopen_accounting_period: {
        Args: {
          p_period_month: number
          p_period_year: number
          p_reopen_note?: string
          p_unit_id: string
        }
        Returns: string
      }
      request_inventory_adjustment_approval: {
        Args: { p_inventory_adjustment_id: string }
        Returns: string
      }
      request_journal_correction_approval: {
        Args: { p_journal_correction_id: string }
        Returns: string
      }
      run_core_profit_sharing_orchestrator: {
        Args: { p_equity_closing_id: string }
        Returns: undefined
      }
      run_year_end_equity_closing: {
        Args: { p_unit_id: string; p_year: number }
        Returns: string
      }
      unit_tenant_id: { Args: { _unit_id: string }; Returns: string }
      update_inventory_item_master: {
        Args: {
          p_harga_beli: number
          p_harga_jual: number
          p_item_id: string
          p_nama_barang: string
          p_satuan: string
        }
        Returns: undefined
      }
      validate_journal_correction_balance: {
        Args: { p_journal_correction_id: string }
        Returns: undefined
      }
      validate_no_inventory_account_in_journal_correction: {
        Args: { p_journal_correction_id: string }
        Returns: undefined
      }
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
        | "operator_unit"
        | "viewer_unit"
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
        "operator_unit",
        "viewer_unit",
      ],
      coa_tipe: ["aset", "kewajiban", "ekuitas", "pendapatan", "beban"],
      registration_status: ["pending", "approved", "rejected"],
      tenant_status: ["pending", "active", "suspended"],
      unit_status: ["aktif", "nonaktif"],
    },
  },
} as const
