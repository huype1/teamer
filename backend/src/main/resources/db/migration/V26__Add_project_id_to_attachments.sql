-- Add project_id to attachments table
ALTER TABLE attachments 
ADD COLUMN project_id UUID;

-- Add foreign key constraint
ALTER TABLE attachments 
ADD CONSTRAINT fk_attachments_project 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_attachments_project_id ON attachments(project_id);

-- Add comment for documentation
COMMENT ON COLUMN attachments.project_id IS 'Reference to the project this attachment belongs to';

-- Update existing attachments to set project_id based on their related entities
-- This is a safe operation that won't break existing data
UPDATE attachments 
SET project_id = (
    SELECT i.project_id 
    FROM issues i 
    WHERE i.id = attachments.issue_id
)
WHERE attachments.issue_id IS NOT NULL 
AND attachments.project_id IS NULL;

-- For comment attachments, get project_id through the issue
UPDATE attachments 
SET project_id = (
    SELECT i.project_id 
    FROM comments c 
    JOIN issues i ON c.issue_id = i.id 
    WHERE c.id = attachments.comment_id
)
WHERE attachments.comment_id IS NOT NULL 
AND attachments.project_id IS NULL;

-- For message attachments, get project_id through the chat and project
UPDATE attachments 
SET project_id = (
    SELECT p.id 
    FROM messages m 
    JOIN chats c ON m.chat_id = c.id 
    JOIN projects p ON c.id = p.chat_id 
    WHERE m.id = attachments.message_id
)
WHERE attachments.message_id IS NOT NULL 
AND attachments.project_id IS NULL;



