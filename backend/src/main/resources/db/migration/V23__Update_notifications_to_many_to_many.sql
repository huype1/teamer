-- Migration để chuyển đổi notification từ one-to-many sang many-to-many

-- 1. Tạo bảng notification_recipients
CREATE TABLE notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(notification_id, user_id)
);

-- 2. Thêm cột mới vào bảng notifications (không thêm lại created_at/updated_at vì đã tồn tại từ V22)
ALTER TABLE notifications 
ADD COLUMN created_by UUID REFERENCES users(id);

-- 3. Migrate dữ liệu từ cấu trúc cũ sang mới
INSERT INTO notification_recipients (notification_id, user_id, is_read, is_email_sent, created_at, updated_at)
SELECT id, user_id, is_read, is_email_sent, created_at, updated_at
FROM notifications
WHERE user_id IS NOT NULL;

-- 4. Xóa các cột cũ không cần thiết
ALTER TABLE notifications 
DROP COLUMN user_id,
DROP COLUMN is_read,
DROP COLUMN is_email_sent;

-- 5. Tạo indexes cho performance
CREATE INDEX idx_notification_recipients_user_id ON notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_user_read ON notification_recipients(user_id, is_read);
CREATE INDEX idx_notification_recipients_notification_id ON notification_recipients(notification_id);
CREATE INDEX idx_notification_recipients_created_at ON notification_recipients(created_at);

-- 6. Trigger để tự động update updated_at cho notification_recipients
CREATE TRIGGER update_notification_recipients_updated_at 
    BEFORE UPDATE ON notification_recipients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Bỏ qua trigger cho notifications vì đã được tạo ở V22