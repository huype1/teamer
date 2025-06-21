CREATE TABLE projects
(
    id          UUID PRIMARY KEY,
    team_id     UUID NOT NULL,
    name        VARCHAR(100) NOT NULL,
    key         VARCHAR(10) NOT NULL,
    description TEXT,
    avatar_url  TEXT,
    is_public   BOOLEAN DEFAULT FALSE,
    creator_id  UUID NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(team_id, key)
);

CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_projects_creator ON projects(creator_id);
CREATE INDEX idx_projects_key ON projects(key);
CREATE INDEX idx_projects_public ON projects(is_public); 