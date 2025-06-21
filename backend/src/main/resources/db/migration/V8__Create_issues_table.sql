CREATE TABLE issues
(
    id           UUID PRIMARY KEY,
    key          TEXT NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    priority     TEXT NOT NULL DEFAULT 'P5',
    status       TEXT NOT NULL DEFAULT 'TODO',
    issue_type   TEXT NOT NULL DEFAULT 'TASK',
    start_date   DATE,
    due_date     DATE,
    story_points INTEGER,
    reporter_id  UUID NOT NULL,
    assignee_id  UUID,
    project_id   UUID NOT NULL,
    parent_id    UUID,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES issues (id) ON DELETE CASCADE,
    UNIQUE(project_id, key)
);

CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_reporter ON issues(reporter_id);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);
CREATE INDEX idx_issues_parent ON issues(parent_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_type ON issues(issue_type);
CREATE INDEX idx_issues_project_status ON issues(project_id, status);
CREATE INDEX idx_issues_project_assignee ON issues(project_id, assignee_id);
CREATE INDEX idx_issues_project_type ON issues(project_id, issue_type); 