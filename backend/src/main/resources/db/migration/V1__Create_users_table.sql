CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users
(
    id         UUID PRIMARY KEY,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT,
    name       TEXT        NOT NULL,
    avatar_url TEXT,
    provider TEXT NOT NULL DEFAULT 'EMAIL_PASSWORD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_provider ON users(provider);
