import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on the existing schema
export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          title: string
          description: string | null
          background_color: string | null
          is_starred: boolean | null
          owner_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title?: string
          description?: string | null
          background_color?: string | null
          is_starred?: boolean | null
          owner_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          background_color?: string | null
          is_starred?: boolean | null
          owner_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          title: string
          color: string | null
          board_id: string
          position: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title?: string
          color?: string | null
          board_id: string
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          color?: string | null
          board_id?: string
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          due_date: string | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          progress: number | null
          text_field: string | null
          tags: string | null
          board_id: string
          group_id: string
          position: number | null
          created_at: string | null
          updated_at: string | null
          assignee_id: string | null
          number_field: number | null
          files: any | null
          // Email integration fields
          sender_email: string | null
          sender_name: string | null
          sender_company: string | null
          gmail_message_id: string | null
          email_received_at: string | null
          // Custom fields for enhanced functionality
          custom_fields: any | null
          // New inquiry management fields
          inquiry_id: string | null
          parent_task_id: string | null
          inquiry_type: string | null
          client_company: string | null
          client_contact_name: string | null
          client_email: string | null
          product_category: string | null
          product_specs: string | null
          quantity: number | null
          unit_price: number | null
          markup_percentage: number | null
          vendor_company: string | null
          vendor_contact: string | null
          vendor_email: string | null
          vendor_quote_price: number | null
          final_client_price: number | null
          quote_deadline: string | null
          po_received: boolean | null
          quote_pdf_url: string | null
          proposal_pdf_url: string | null
          is_in_stock: boolean | null
          needs_approval: boolean | null
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          progress?: number | null
          text_field?: string | null
          tags?: string | null
          board_id: string
          group_id: string
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
          assignee_id?: string | null
          number_field?: number | null
          files?: any | null
          // Email integration fields
          sender_email?: string | null
          sender_name?: string | null
          sender_company?: string | null
          gmail_message_id?: string | null
          email_received_at?: string | null
          // Custom fields for enhanced functionality
          custom_fields?: any | null
          // New inquiry management fields
          inquiry_id?: string | null
          parent_task_id?: string | null
          inquiry_type?: string | null
          client_company?: string | null
          client_contact_name?: string | null
          client_email?: string | null
          product_category?: string | null
          product_specs?: string | null
          quantity?: number | null
          unit_price?: number | null
          markup_percentage?: number | null
          vendor_company?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_quote_price?: number | null
          final_client_price?: number | null
          quote_deadline?: string | null
          po_received?: boolean | null
          quote_pdf_url?: string | null
          proposal_pdf_url?: string | null
          is_in_stock?: boolean | null
          needs_approval?: boolean | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          progress?: number | null
          text_field?: string | null
          tags?: string | null
          board_id?: string
          group_id?: string
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
          assignee_id?: string | null
          number_field?: number | null
          files?: any | null
          // Email integration fields
          sender_email?: string | null
          sender_name?: string | null
          sender_company?: string | null
          gmail_message_id?: string | null
          email_received_at?: string | null
          // Custom fields for enhanced functionality
          custom_fields?: any | null
          // New inquiry management fields
          inquiry_id?: string | null
          parent_task_id?: string | null
          inquiry_type?: string | null
          client_company?: string | null
          client_contact_name?: string | null
          client_email?: string | null
          product_category?: string | null
          product_specs?: string | null
          quantity?: number | null
          unit_price?: number | null
          markup_percentage?: number | null
          vendor_company?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_quote_price?: number | null
          final_client_price?: number | null
          quote_deadline?: string | null
          po_received?: boolean | null
          quote_pdf_url?: string | null
          proposal_pdf_url?: string | null
          is_in_stock?: boolean | null
          needs_approval?: boolean | null
          approved_by?: string | null
          approved_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          username: string
          fullname: string | null
          avatar_url: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          username: string
          fullname?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string
          fullname?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vendors: {
        Row: {
          id: string
          company_name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          product_categories: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          product_categories?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          product_categories?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          assigned_sales_rep: string | null
          vendor_ids: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          assigned_sales_rep?: string | null
          vendor_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          assigned_sales_rep?: string | null
          vendor_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      email_templates: {
        Row: {
          id: string
          template_name: string
          subject_template: string
          body_template: string
          template_type: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          template_name: string
          subject_template: string
          body_template: string
          template_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          template_name?: string
          subject_template?: string
          body_template?: string
          template_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      activity_log: {
        Row: {
          id: string
          task_id: string
          action: string
          details: any | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          action: string
          details?: any | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          action?: string
          details?: any | null
          user_id?: string | null
          created_at?: string | null
        }
      }
      status_options: {
        Row: {
          id: string
          board_id: string
          label: string
          color: string
          position: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          board_id: string
          label: string
          color?: string
          position?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          board_id?: string
          label?: string
          color?: string
          position?: number | null
          created_at?: string | null
        }
      }
      priority_options: {
        Row: {
          id: string
          board_id: string
          label: string
          color: string
          position: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          board_id: string
          label: string
          color?: string
          position?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          board_id?: string
          label?: string
          color?: string
          position?: number | null
          created_at?: string | null
        }
      }
    }
  }
} 