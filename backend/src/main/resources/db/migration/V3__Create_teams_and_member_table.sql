CREATE TABLE teams
(
    id          UUID PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url  TEXT,
    created_by  UUID NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE team_members
(
    team_id   UUID NOT NULL,
    user_id   UUID NOT NULL,
    role      VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role); 

CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_name ON teams(name); 