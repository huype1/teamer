CREATE TABLE comments
(
    id        UUID PRIMARY KEY,
    content   TEXT NOT NULL,
    issue_id  UUID NOT NULL,
    user_id   UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_issue ON comments(issue_id);
CREATE INDEX idx_comments_user ON comments(user_id); 