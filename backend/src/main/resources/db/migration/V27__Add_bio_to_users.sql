-- Add bio column to users table
ALTER TABLE users
ADD COLUMN bio TEXT;

-- Add index for better performance
CREATE INDEX idx_users_bio ON users(bio);

-- Add comment for documentation
COMMENT ON COLUMN users.bio IS 'User biography/self-introduction text';
