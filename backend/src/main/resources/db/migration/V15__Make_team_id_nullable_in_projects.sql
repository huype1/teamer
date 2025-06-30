-- Make team_id nullable in projects table
ALTER TABLE projects ALTER COLUMN team_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL values
-- First drop the existing foreign key constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_team_id_fkey;

-- Re-add the foreign key constraint that allows NULL values
ALTER TABLE projects ADD CONSTRAINT projects_team_id_fkey 
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE;

-- Update the unique constraint to handle NULL values properly
-- Drop the existing unique constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_team_id_key_key;

-- Re-add the unique constraint that allows multiple NULL values for team_id
-- but still enforces uniqueness for non-NULL team_id and key combinations
CREATE UNIQUE INDEX projects_team_id_key_unique 
    ON projects (team_id, key) 
    WHERE team_id IS NOT NULL; 