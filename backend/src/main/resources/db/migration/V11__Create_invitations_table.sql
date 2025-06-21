CREATE TABLE invitations
(
    id             UUID PRIMARY KEY,
    email          TEXT NOT NULL,
    project_id     UUID NOT NULL,
    expiration_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
    invited_by     UUID NOT NULL,
    status         TEXT NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_invitations_project ON invitations(project_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expiration ON invitations(expiration_date); 