import { UserRole } from './auth';

export type FieldType = 'text' | 'status' | 'person' | 'date' | 'number' | 'priority' | 'files';

export type StatusOption = {
  id: string;
  label: string;
  color: string;
  position?: number;
  board_id: string;
  created_at?: string | null;
};

export type PriorityOption = {
  id: string;
  label: string;
  color: string;
  position?: number;
  board_id: string;
  created_at?: string | null;
};

export type FieldDefinition = {
  id: string;
  name: string;
  type: FieldType;
  options?: StatusOption[] | PriorityOption[];
  required?: boolean;
};

// Updated to match database schema
export interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  assignee_id?: string | null;
  created_by?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  progress?: number | null;
  text_field?: string | null;
  tags?: string | null;
  board_id: string;
  group_id: string;
  position?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  number_field?: number | null;
  files?: any | null;
  
  // New inquiry management fields
  inquiry_id?: string | null;
  parent_task_id?: string | null;
  inquiry_type?: 'inquiry' | 'rfq_subitem' | 'purchase' | 'invoice' | null;
  client_company?: string | null;
  client_contact_name?: string | null;
  client_email?: string | null;
  product_category?: string | null;
  product_specs?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  markup_percentage?: number | null;
  vendor_company?: string | null;
  vendor_contact?: string | null;
  vendor_email?: string | null;
  vendor_quote_price?: number | null;
  final_client_price?: number | null;
  quote_deadline?: string | null;
  po_received?: boolean | null;
  quote_pdf_url?: string | null;
  proposal_pdf_url?: string | null;
  is_in_stock?: boolean | null;
  needs_approval?: boolean | null;
  approved_by?: string | null;
  approved_at?: string | null;
  
  // Email integration fields
  sender_email?: string | null;
  sender_name?: string | null;
  sender_company?: string | null;
  gmail_message_id?: string | null;
  email_received_at?: string | null;
  email_subject?: string | null;
  email_body?: string | null;
  email_body_html?: string | null;
  
  // Enhanced product/service tracking fields
  requested_product?: string | null;
  requested_service?: string | null;
  product_sku?: string | null;
  service_type?: string | null;
  stock_availability?: string | null;
  estimated_delivery?: string | null;
  technical_requirements?: string | null;
  client_budget?: number | null;
  urgency_level?: 'Low' | 'Medium' | 'High' | 'Critical' | null;
  lead_source?: string | null;
  qualification_score?: number | null;
  
  // Custom fields for future extensibility
  custom_fields?: any | null;
}

// New interfaces for supporting tables
export interface Vendor {
  id: string;
  company_name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  product_categories?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  assigned_sales_rep?: string | null;
  vendor_ids?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EmailTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  template_type?: 'acknowledgment' | 'rfq_request' | 'proposal_sent' | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  action: string;
  details?: any | null;
  user_id?: string | null;
  created_at?: string | null;
}

// Action button configuration
export interface ActionButton {
  label: string;
  action: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'red';
  visible?: boolean;
}

// Updated to match database schema
export type GroupData = {
  id: string;
  title: string;
  color?: string | null;
  board_id: string;
  position?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  tasks?: TaskData[];
};

// Updated to match database schema
export type Board = {
  id: string;
  title: string;
  description?: string | null;
  background_color?: string | null;
  is_starred?: boolean | null;
  owner_id: string;
  owner_role?: UserRole; // Added for RBAC
  icon?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  groups?: GroupData[];
  status_options?: StatusOption[];
  priority_options?: PriorityOption[];
};

export type User = {
  id: string;
  email: string;
  username: string;
  fullname?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ViewType = 'table' | 'kanban' | 'dashboard';