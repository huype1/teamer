-- Add the new role column
ALTER TABLE invitations ADD COLUMN role TEXT NOT NULL DEFAULT 'MEMBER';

-- Update existing invitations to set appropriate roles based on project membership
-- This assumes existing invitations should default to MEMBER role
UPDATE invitations SET role = 'MEMBER' WHERE role IS NULL;

-- Drop the foreign key constraint first
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_invited_by_fkey;

-- Drop the invited_by column
ALTER TABLE invitations DROP COLUMN invited_by;

-- Create index on role for better query performance
CREATE INDEX idx_invitations_role ON invitations(role);

-- Update the existing index to include role for compound queries
CREATE INDEX idx_invitations_project_role ON invitations(project_id, role); 