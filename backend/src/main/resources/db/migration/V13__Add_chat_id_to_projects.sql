-- Implement one-to-one relationship using only chat_id in projects table
-- This eliminates data inconsistency and simplifies the relationship

-- Step 1: Add chat_id column to projects table
ALTER TABLE projects ADD COLUMN chat_id UUID;

-- Step 2: Create the foreign key constraint
ALTER TABLE projects ADD CONSTRAINT fk_projects_chat 
    FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE;

-- Step 3: Create index for better performance
CREATE INDEX idx_projects_chat ON projects(chat_id);

-- Step 4: Update existing projects to link with their chats
-- This assumes each project should have one chat
UPDATE projects 
SET chat_id = (
    SELECT c.id 
    FROM chats c 
    WHERE c.project_id = projects.id 
    LIMIT 1
);

-- Step 5: Make chat_id NOT NULL after populating existing data
ALTER TABLE projects ALTER COLUMN chat_id SET NOT NULL;

-- Step 6: Remove the project_id column from chats table
-- First drop the foreign key constraint
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_project_id_fkey;

-- Drop the index
DROP INDEX IF EXISTS idx_chats_project;

-- Drop the column
ALTER TABLE chats DROP COLUMN project_id; 