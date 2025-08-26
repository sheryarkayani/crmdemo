-- Database Migration Script for CRM Automation
-- Add missing fields to tasks table

-- Add created_by field for task ownership tracking
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add email integration fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS sender_email TEXT,
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_company TEXT,
ADD COLUMN IF NOT EXISTS gmail_message_id TEXT,
ADD COLUMN IF NOT EXISTS email_received_at TIMESTAMP WITH TIME ZONE;

-- Add inquiry management fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS inquiry_id TEXT,
ADD COLUMN IF NOT EXISTS parent_task_id TEXT,
ADD COLUMN IF NOT EXISTS inquiry_type TEXT,
ADD COLUMN IF NOT EXISTS client_company TEXT,
ADD COLUMN IF NOT EXISTS client_contact_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS product_category TEXT,
ADD COLUMN IF NOT EXISTS product_specs TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS markup_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS vendor_company TEXT,
ADD COLUMN IF NOT EXISTS vendor_contact TEXT,
ADD COLUMN IF NOT EXISTS vendor_email TEXT,
ADD COLUMN IF NOT EXISTS vendor_quote_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS final_client_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS quote_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS po_received BOOLEAN,
ADD COLUMN IF NOT EXISTS quote_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS proposal_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN,
ADD COLUMN IF NOT EXISTS needs_approval BOOLEAN,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add custom_fields column if it doesn't exist
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS custom_fields JSONB;

-- Add new fields for enhanced product/service tracking
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS email_subject TEXT,
ADD COLUMN IF NOT EXISTS email_body TEXT,
ADD COLUMN IF NOT EXISTS email_body_html TEXT,
ADD COLUMN IF NOT EXISTS requested_product TEXT,
ADD COLUMN IF NOT EXISTS requested_service TEXT,
ADD COLUMN IF NOT EXISTS product_sku TEXT,
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS stock_availability TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
ADD COLUMN IF NOT EXISTS technical_requirements TEXT,
ADD COLUMN IF NOT EXISTS client_budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS urgency_level TEXT CHECK (urgency_level IN ('Low', 'Medium', 'High', 'Critical')),
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_sender_email ON tasks(sender_email);
CREATE INDEX IF NOT EXISTS idx_tasks_inquiry_id ON tasks(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_tasks_gmail_message_id ON tasks(gmail_message_id);
CREATE INDEX IF NOT EXISTS idx_tasks_custom_fields ON tasks USING GIN(custom_fields);
CREATE INDEX IF NOT EXISTS idx_tasks_requested_product ON tasks(requested_product);
CREATE INDEX IF NOT EXISTS idx_tasks_requested_service ON tasks(requested_service);
CREATE INDEX IF NOT EXISTS idx_tasks_product_sku ON tasks(product_sku);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_source ON tasks(lead_source);
CREATE INDEX IF NOT EXISTS idx_tasks_qualification_score ON tasks(qualification_score);

-- Update existing tasks to have default values
UPDATE tasks 
SET 
  created_by = assignee_id,
  sender_email = NULL,
  sender_name = NULL,
  sender_company = NULL,
  gmail_message_id = NULL,
  email_received_at = NULL,
  inquiry_id = NULL,
  custom_fields = '{}'::jsonb,
  requested_product = NULL,
  requested_service = NULL,
  product_sku = NULL,
  service_type = NULL,
  stock_availability = NULL,
  estimated_delivery = NULL,
  technical_requirements = NULL,
  client_budget = NULL,
  urgency_level = 'Medium',
  lead_source = 'Email',
  qualification_score = 50
WHERE sender_email IS NULL;

-- Commit the changes
COMMIT;
