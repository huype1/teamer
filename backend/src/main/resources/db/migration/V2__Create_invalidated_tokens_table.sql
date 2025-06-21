CREATE TABLE IF NOT EXISTS invalidated_tokens (
    id VARCHAR(255) PRIMARY KEY,
    token TEXT NOT NULL,
    expiry_time TIMESTAMP NOT NULL
);
