-- Essential Database Migration for Email Processing
-- Add only the critical fields needed for email processing to work

-- Add essential email integration fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS sender_email TEXT,
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_company TEXT,
ADD COLUMN IF NOT EXISTS gmail_message_id TEXT,
ADD COLUMN IF NOT EXISTS email_received_at TIMESTAMP WITH TIME ZONE;

-- Add custom_fields column for storing inquiry_id and other metadata
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_sender_email ON tasks(sender_email);
CREATE INDEX IF NOT EXISTS idx_tasks_gmail_message_id ON tasks(gmail_message_id);

-- Update existing tasks to have default custom_fields
UPDATE tasks 
SET custom_fields = '{}'::jsonb
WHERE custom_fields IS NULL;

-- Commit the changes
COMMIT;
