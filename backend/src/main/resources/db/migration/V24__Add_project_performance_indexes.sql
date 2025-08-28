-- Add performance indexes for project queries
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_project_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_project_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_project_name_key ON projects(name, key);
CREATE INDEX IF NOT EXISTS idx_project_created_at ON projects(created_at);

-- Composite index for user's projects
CREATE INDEX IF NOT EXISTS idx_project_user_access ON projects(creator_id, is_public) 
WHERE is_public = true;

-- Index for project search
CREATE INDEX IF NOT EXISTS idx_project_search ON projects(name, key) 
WHERE name IS NOT NULL AND key IS NOT NULL;
