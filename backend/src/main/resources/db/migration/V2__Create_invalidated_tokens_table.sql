CREATE TABLE IF NOT EXISTS invalidated_tokens (
    id VARCHAR(255) PRIMARY KEY,
    expiry_time TIMESTAMP NOT NULL
);
