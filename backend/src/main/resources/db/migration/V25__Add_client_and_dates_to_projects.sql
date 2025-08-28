-- Add client and date fields to projects table
ALTER TABLE projects 
ADD COLUMN client_name VARCHAR(255),
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Add indexes for better performance
CREATE INDEX idx_projects_client_name ON projects(client_name);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_end_date ON projects(end_date);
CREATE INDEX idx_projects_date_range ON projects(start_date, end_date);

-- Add comments for documentation
COMMENT ON COLUMN projects.client_name IS 'Name of the client for this project';
COMMENT ON COLUMN projects.start_date IS 'Project start date';
COMMENT ON COLUMN projects.end_date IS 'Project end date';



