ALTER TABLE attachments 
DROP CONSTRAINT IF EXISTS attachments_issue_id_fkey,
DROP CONSTRAINT IF EXISTS attachments_comment_id_fkey,
DROP CONSTRAINT IF EXISTS attachments_message_id_fkey,
DROP CONSTRAINT IF EXISTS attachments_uploader_id_fkey;

ALTER TABLE attachments 
ADD CONSTRAINT attachments_issue_id_fkey 
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
ADD CONSTRAINT attachments_comment_id_fkey 
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
ADD CONSTRAINT attachments_message_id_fkey 
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
ADD CONSTRAINT attachments_uploader_id_fkey 
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_creator_id_fkey,
DROP CONSTRAINT IF EXISTS documents_project_id_fkey;

ALTER TABLE documents 
ADD CONSTRAINT documents_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT documents_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE sprints 
DROP CONSTRAINT IF EXISTS sprints_project_id_fkey,
DROP CONSTRAINT IF EXISTS sprints_created_by_fkey;

ALTER TABLE sprints 
ADD CONSTRAINT sprints_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
ADD CONSTRAINT sprints_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_created_by_fkey;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE teams 
DROP CONSTRAINT IF EXISTS teams_created_by_fkey;

ALTER TABLE teams 
ADD CONSTRAINT teams_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_creator_id_fkey;

ALTER TABLE projects ALTER COLUMN creator_id DROP NOT NULL;

ALTER TABLE projects 
ADD CONSTRAINT projects_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;

