CREATE TABLE documents
(
    id         UUID PRIMARY KEY,
    project_id UUID REFERENCES projects (id),
    title VARCHAR(255) NOT NULL,
    content JSONB,
    creator_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_creator ON documents(creator_id);