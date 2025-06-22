-- Update chats table structure to remove project_id column
-- This simplifies the one-to-one relationship with projects
-- This migration handles the transition from the original V7 structure

-- Step 1: Drop the foreign key constraint
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_project_id_fkey;

-- Step 2: Drop the index
DROP INDEX IF EXISTS idx_chats_project;

-- Step 3: Drop the project_id column
ALTER TABLE chats DROP COLUMN IF EXISTS project_id;

-- The chats table now contains:
-- - id (UUID PRIMARY KEY)
-- - name (TEXT)
-- - created_at (TIMESTAMP WITH TIME ZONE)
-- - updated_at (TIMESTAMP WITH TIME ZONE)
-- 
-- The relationship is managed entirely through the chat_id column in the projects table
-- This eliminates data inconsistency and simplifies the one-to-one relationship 