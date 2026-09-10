export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          display_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: number;
          name: string;
          slug: string;
          owner_id: string | null;
          business_type: string | null;
          country: string;
          address: string | null;
          contact_number: string | null;
          email: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          owner_id?: string | null;
          business_type?: string | null;
          country?: string;
          address?: string | null;
          contact_number?: string | null;
          email?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          owner_id?: string | null;
          business_type?: string | null;
          country?: string;
          address?: string | null;
          contact_number?: string | null;
          email?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: number;
          organization_id: number;
          user_id: string;
          role: string;
          status: string;
          joined_at: string;
        };
        Insert: {
          organization_id: number;
          user_id: string;
          role?: string;
          status?: string;
          joined_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          user_id?: string;
          role?: string;
          status?: string;
          joined_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: number;
          organization_id: number;
          plan: string;
          status: string;
          employee_limit: number;
          business_limit: number;
          current_employee_count: number;
          trial_ends_at: string | null;
          billing_email: string | null;
          subscription_start: string;
          subscription_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: number;
          plan?: string;
          status?: string;
          employee_limit?: number;
          business_limit?: number;
          current_employee_count?: number;
          trial_ends_at?: string | null;
          billing_email?: string | null;
          subscription_start?: string;
          subscription_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          plan?: string;
          status?: string;
          employee_limit?: number;
          business_limit?: number;
          current_employee_count?: number;
          trial_ends_at?: string | null;
          billing_email?: string | null;
          subscription_start?: string;
          subscription_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          label: string;
          description: string | null;
          category: string;
          is_core: number;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          label: string;
          description?: string | null;
          category?: string;
          is_core?: number;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          description?: string | null;
          category?: string;
          is_core?: number;
          icon?: string | null;
          created_at?: string;
        };
      };
      organization_modules: {
        Row: {
          id: number;
          organization_id: number;
          module_id: string;
          enabled: number;
          enabled_at: string | null;
          updated_at: string;
        };
        Insert: {
          organization_id: number;
          module_id: string;
          enabled?: number;
          enabled_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          module_id?: string;
          enabled?: number;
          enabled_at?: string | null;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: number;
          organization_id: number;
          name: string;
          code: string;
          description: string | null;
          address: string | null;
          contact_information: string | null;
          status: string;
          business_type: string | null;
          payroll_frequency: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: number;
          name: string;
          code: string;
          description?: string | null;
          address?: string | null;
          contact_information?: string | null;
          status?: string;
          business_type?: string | null;
          payroll_frequency?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          name?: string;
          code?: string;
          description?: string | null;
          address?: string | null;
          contact_information?: string | null;
          status?: string;
          business_type?: string | null;
          payroll_frequency?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: number;
          organization_id: number;
          business_id: number;
          employee_id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          suffix: string | null;
          date_of_birth: string | null;
          contact_number: string | null;
          email: string | null;
          address: string | null;
          position: string | null;
          department: string | null;
          employment_status: string;
          employment_type: string;
          date_hired: string | null;
          status: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: number;
          business_id: number;
          employee_id: string;
          first_name: string;
          middle_name?: string | null;
          last_name: string;
          suffix?: string | null;
          date_of_birth?: string | null;
          contact_number?: string | null;
          email?: string | null;
          address?: string | null;
          position?: string | null;
          department?: string | null;
          employment_status?: string;
          employment_type?: string;
          date_hired?: string | null;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          business_id?: number;
          employee_id?: string;
          first_name?: string;
          middle_name?: string | null;
          last_name?: string;
          suffix?: string | null;
          date_of_birth?: string | null;
          contact_number?: string | null;
          email?: string | null;
          address?: string | null;
          position?: string | null;
          department?: string | null;
          employment_status?: string;
          employment_type?: string;
          date_hired?: string | null;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employee_salary: {
        Row: {
          id: number;
          organization_id: number;
          employee_id: number;
          salary_type: string;
          basic_rate: number;
          payroll_frequency: string;
          effective_date: string | null;
          created_at: string;
        };
        Insert: {
          organization_id: number;
          employee_id: number;
          salary_type?: string;
          basic_rate?: number;
          payroll_frequency?: string;
          effective_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          employee_id?: number;
          salary_type?: string;
          basic_rate?: number;
          payroll_frequency?: string;
          effective_date?: string | null;
          created_at?: string;
        };
      };
      earning_types: {
        Row: {
          id: number;
          organization_id: number | null;
          name: string;
          description: string | null;
          calculation_type: string;
          is_taxable: number;
          status: string;
        };
        Insert: {
          organization_id?: number | null;
          name: string;
          description?: string | null;
          calculation_type?: string;
          is_taxable?: number;
          status?: string;
        };
        Update: {
          id?: number;
          organization_id?: number | null;
          name?: string;
          description?: string | null;
          calculation_type?: string;
          is_taxable?: number;
          status?: string;
        };
      };
      employee_earnings: {
        Row: {
          id: number;
          organization_id: number;
          employee_id: number;
          earning_type_id: number;
          amount: number;
          calculation_type: string;
          frequency: string;
          effective_date: string | null;
          one_time: number;
          status: string;
          created_at: string;
        };
        Insert: {
          organization_id: number;
          employee_id: number;
          earning_type_id: number;
          amount?: number;
          calculation_type?: string;
          frequency?: string;
          effective_date?: string | null;
          one_time?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          employee_id?: number;
          earning_type_id?: number;
          amount?: number;
          calculation_type?: string;
          frequency?: string;
          effective_date?: string | null;
          one_time?: number;
          status?: string;
          created_at?: string;
        };
      };
      deduction_types: {
        Row: {
          id: number;
          organization_id: number | null;
          name: string;
          description: string | null;
          calculation_type: string;
          status: string;
        };
        Insert: {
          organization_id?: number | null;
          name: string;
          description?: string | null;
          calculation_type?: string;
          status?: string;
        };
        Update: {
          id?: number;
          organization_id?: number | null;
          name?: string;
          description?: string | null;
          calculation_type?: string;
          status?: string;
        };
      };
      employee_deductions: {
        Row: {
          id: number;
          organization_id: number;
          employee_id: number;
          deduction_type_id: number;
          amount: number;
          calculation_type: string;
          frequency: string;
          effective_date: string | null;
          end_date: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          organization_id: number;
          employee_id: number;
          deduction_type_id: number;
          amount?: number;
          calculation_type?: string;
          frequency?: string;
          effective_date?: string | null;
          end_date?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number;
          employee_id?: number;
          deduction_type_id?: number;
          amount?: number;
          calculation_type?: string;
          frequency?: string;
          effective_date?: string | null;
          end_date?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      payroll: {
        Row: {
          id: number;
          organization_id: number;
          business_id: number;
          payroll_period_start: string;
          payroll_period_end: string;
          pay_date: string;
          payroll_frequency: string;
          status: string;
          total_gross: number;
          total_deductions: number;
          total_net: number;
          employee_count: number;
          notes: string | null;
          created_by: string | null;
          finalized_by: string | null;
          created_at: string;
          finalized_at: string | null;
        };
        Insert: {
          organization_id: number;
          business_id: number;
          payroll_period_start: string;
          payroll_period_end: string;
          pay_date: string;
          payroll_frequency?: string;
          status?: string;
          total_gross?: number;
          total_deductions?: number;
          total_net?: number;
          employee_count?: number;
          notes?: string | null;
          created_by?: string | null;
          finalized_by?: string | null;
          created_at?: string;
          finalized_at?: string | null;
        };
        Update: {
          id?: number;
          organization_id?: number;
          business_id?: number;
          payroll_period_start?: string;
          payroll_period_end?: string;
          pay_date?: string;
          payroll_frequency?: string;
          status?: string;
          total_gross?: number;
          total_deductions?: number;
          total_net?: number;
          employee_count?: number;
          notes?: string | null;
          created_by?: string | null;
          finalized_by?: string | null;
          created_at?: string;
          finalized_at?: string | null;
        };
      };
      payroll_items: {
        Row: {
          id: number;
          organization_id: number;
          payroll_id: number;
          employee_id: number;
          basic_pay: number;
          overtime: number;
          allowances: number;
          bonuses: number;
          commissions: number;
          other_earnings: number;
          gross_pay: number;
          total_deductions: number;
          net_pay: number;
        };
        Insert: {
          organization_id: number;
          payroll_id: number;
          employee_id: number;
          basic_pay?: number;
          overtime?: number;
          allowances?: number;
          bonuses?: number;
          commissions?: number;
          other_earnings?: number;
          gross_pay?: number;
          total_deductions?: number;
          net_pay?: number;
        };
        Update: {
          id?: number;
          organization_id?: number;
          payroll_id?: number;
          employee_id?: number;
          basic_pay?: number;
          overtime?: number;
          allowances?: number;
          bonuses?: number;
          commissions?: number;
          other_earnings?: number;
          gross_pay?: number;
          total_deductions?: number;
          net_pay?: number;
        };
      };
      payroll_item_earnings: {
        Row: {
          id: number;
          payroll_item_id: number;
          earning_type_id: number | null;
          name: string;
          amount: number;
        };
        Insert: {
          payroll_item_id: number;
          earning_type_id?: number | null;
          name: string;
          amount?: number;
        };
        Update: {
          id?: number;
          payroll_item_id?: number;
          earning_type_id?: number | null;
          name?: string;
          amount?: number;
        };
      };
      payroll_item_deductions: {
        Row: {
          id: number;
          payroll_item_id: number;
          deduction_type_id: number | null;
          name: string;
          amount: number;
        };
        Insert: {
          payroll_item_id: number;
          deduction_type_id?: number | null;
          name: string;
          amount?: number;
        };
        Update: {
          id?: number;
          payroll_item_id?: number;
          deduction_type_id?: number | null;
          name?: string;
          amount?: number;
        };
      };
      payslips: {
        Row: {
          id: number;
          payroll_item_id: number;
          organization_id: number;
          employee_id: number;
          payroll_id: number;
          pdf_storage_path: string | null;
          generated_at: string;
          generated_by: string | null;
        };
        Insert: {
          payroll_item_id: number;
          organization_id: number;
          employee_id: number;
          payroll_id: number;
          pdf_storage_path?: string | null;
          generated_at?: string;
          generated_by?: string | null;
        };
        Update: {
          id?: number;
          payroll_item_id?: number;
          organization_id?: number;
          employee_id?: number;
          payroll_id?: number;
          pdf_storage_path?: string | null;
          generated_at?: string;
          generated_by?: string | null;
        };
      };
      onboarding_steps: {
        Row: {
          id: number;
          organization_id: number;
          step: string;
          completed: number;
          completed_at: string | null;
        };
        Insert: {
          organization_id: number;
          step: string;
          completed?: number;
          completed_at?: string | null;
        };
        Update: {
          id?: number;
          organization_id?: number;
          step?: string;
          completed?: number;
          completed_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: number;
          organization_id: number | null;
          user_id: string | null;
          action: string;
          entity: string | null;
          entity_id: number | null;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          organization_id?: number | null;
          user_id?: string | null;
          action: string;
          entity?: string | null;
          entity_id?: number | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: number | null;
          user_id?: string | null;
          action?: string;
          entity?: string | null;
          entity_id?: number | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          key: string;
          value: string | null;
        };
        Insert: {
          key: string;
          value?: string | null;
        };
        Update: {
          key?: string;
          value?: string | null;
        };
      };
    };
  };
}

