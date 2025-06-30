# Vietnamese Email Translations

## Email Content Translations

### Header Section
- **Title**: "🎉 Bạn được mời!" (You're Invited!)
- **Subtitle**: "Tham gia dự án mới và bắt đầu cộng tác" (Join a new project and start collaborating)

### Main Content
- **Welcome**: "Chào mừng bạn đến với nhóm!" (Welcome to the team!)
- **Invitation Message**: "Bạn đã được mời tham gia dự án [project] với vai trò [role]. Đây là cơ hội tuyệt vời để cộng tác với các thành viên trong nhóm và đóng góp vào sự thành công của dự án."
- **Action Prompt**: "Nhấp vào nút bên dưới để chấp nhận lời mời và bắt đầu làm việc trên dự án ngay lập tức."
- **Button Text**: "Chấp nhận lời mời" (Accept Invitation)
- **Fallback Link**: "Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết này vào trình duyệt:"

### Footer Section
- **Expiration Notice**: "Lời mời này sẽ hết hạn sau 7 ngày vì lý do bảo mật." (This invitation will expire in 7 days for security reasons.)
- **Safety Notice**: "Nếu bạn không mong đợi lời mời này, bạn có thể bỏ qua email này một cách an toàn." (If you didn't expect this invitation, you can safely ignore this email.)
- **Support**: "Cần hỗ trợ? Liên hệ với chúng tôi tại support@teamer.com" (Need help? Contact us at support@teamer.com)

### Role Translations
| English Role | Vietnamese Translation |
|--------------|----------------------|
| admin        | Quản trị viên        |
| manager      | Quản lý              |
| member       | Thành viên           |
| viewer       | Người xem            |

### Other Elements
- **Project Avatar Alt Text**: "Ảnh đại diện dự án" (Project Avatar)
- **No Description**: "Không có mô tả" (No description available)
- **Email Subject**: "Bạn được mời tham gia dự án: [project name]" (You're invited to join project: [project name])

## Technical Implementation

The translations are implemented using:
1. **Direct String Replacement**: Most text is directly replaced in the HTML template
2. **Role Translation Method**: A dedicated method `getRoleInVietnamese()` handles role translations
3. **Fallback Handling**: Default values are provided for missing descriptions
4. **UTF-8 Encoding**: Proper encoding ensures Vietnamese characters display correctly

## Usage Notes

- All Vietnamese text uses proper Vietnamese grammar and terminology
- The translations are culturally appropriate for Vietnamese users
- The email maintains professional tone while being friendly and welcoming
- Role translations are case-insensitive and handle unknown roles gracefully 