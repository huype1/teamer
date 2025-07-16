CREATE TABLE attachments (
    id UUID PRIMARY KEY,
    issue_id UUID REFERENCES issues(id),
    comment_id UUID REFERENCES comments(id),
    message_id UUID REFERENCES messages(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    uploader_id UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 