package com.example.backend.service;

import com.example.backend.entity.Project;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    JavaMailSender javaMailSender;

    void sendEmailWithToken(String email, String link, Project project, String role) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String subject = String.format("Bạn được mời tham gia dự án: %s", project.getName());
        String content = createEmailTemplate(link, project, role);
        
        helper.setSubject(subject);
        helper.setText(content, true);
        helper.setTo(email);

        try {
            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully to {} for project: {}", email, project.getName());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", email, e.getMessage());
            throw new MailSendException("Failed to send email", e);
        }
    }

    private String createEmailTemplate(String link, Project project, String role) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lời mời tham gia dự án</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f8fafc;
                    }
                    
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    
                    .header h1 {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    
                    .header p {
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    
                    .project-info {
                        padding: 30px;
                        background-color: #f8fafc;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    .project-card {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .project-avatar {
                        width: 60px;
                        height: 60px;
                        border-radius: 8px;
                        object-fit: cover;
                        border: 2px solid #e2e8f0;
                    }
                    
                    .project-details h3 {
                        font-size: 20px;
                        font-weight: 600;
                        color: #1a202c;
                        margin-bottom: 4px;
                    }
                    
                    .project-details p {
                        color: #4a5568;
                        font-size: 14px;
                        margin-bottom: 4px;
                    }
                    
                    .project-key {
                        background-color: #edf2f7;
                        color: #2d3748;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 500;
                        display: inline-block;
                    }
                    
                    .role-badge {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .content {
                        padding: 40px 30px;
                    }
                    
                    .content h2 {
                        font-size: 24px;
                        font-weight: 600;
                        color: #1a202c;
                        margin-bottom: 16px;
                    }
                    
                    .content p {
                        font-size: 16px;
                        color: #4a5568;
                        margin-bottom: 24px;
                        line-height: 1.7;
                    }
                    
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        padding: 16px 32px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        text-align: center;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
                    }
                    
                    .cta-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px -1px rgba(102, 126, 234, 0.5);
                    }
                    
                    .footer {
                        padding: 30px;
                        background-color: #f8fafc;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    }
                    
                    .footer p {
                        color: #718096;
                        font-size: 14px;
                        margin-bottom: 8px;
                    }
                    
                    .footer a {
                        color: #667eea;
                        text-decoration: none;
                    }
                    
                    .footer a:hover {
                        text-decoration: underline;
                    }
                    
                    @media (max-width: 600px) {
                        .container {
                            margin: 0;
                            border-radius: 0;
                        }
                        
                        .header, .content, .footer {
                            padding: 20px;
                        }
                        
                        .project-info {
                            padding: 20px;
                        }
                        
                        .project-card {
                            flex-direction: column;
                            text-align: center;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Bạn được mời!</h1>
                        <p>Tham gia dự án mới và bắt đầu cộng tác</p>
                    </div>
                    
                    <div class="project-info">
                        <div class="project-card">
                            <img src="%s" alt="Ảnh đại diện dự án" class="project-avatar" onerror="this.src='https://images.icon-icons.com/2699/PNG/512/atlassian_jira_logo_icon_170511.png'">
                            <div class="project-details">
                                <h3>%s</h3>
                                <p>%s</p>
                                <span class="project-key">%s</span>
                                <div style="margin-top: 8px;">
                                    <span class="role-badge">%s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content">
                        <h2>Chào mừng bạn đến với nhóm!</h2>
                        <p>Bạn đã được mời tham gia dự án <strong>%s</strong> với vai trò <strong>%s</strong>. Đây là cơ hội tuyệt vời để cộng tác với các thành viên trong nhóm và đóng góp vào sự thành công của dự án.</p>
                        <p>Nhấp vào nút bên dưới để chấp nhận lời mời và bắt đầu làm việc trên dự án ngay lập tức.</p>
                        
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="%s" class="cta-button">Chấp nhận lời mời</a>
                        </div>
                        
                        <p style="margin-top: 24px; font-size: 14px; color: #718096;">
                            Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết này vào trình duyệt:<br>
                            <a href="%s" style="color: #667eea; word-break: break-all;">%s</a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>Lời mời này sẽ hết hạn sau 7 ngày vì lý do bảo mật.</p>
                        <p>Nếu bạn không mong đợi lời mời này, bạn có thể bỏ qua email này một cách an toàn.</p>
                        <p>Cần hỗ trợ? Liên hệ với chúng tôi tại <a href="mailto:support@teamer.com">support@teamer.com</a></p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                project.getAvatarUrl(),
                project.getName(),
                project.getDescription() != null ? project.getDescription() : "Không có mô tả",
                project.getKey(),
                getRoleInVietnamese(role),
                project.getName(),
                getRoleInVietnamese(role),
                link,
                link,
                link
            );
    }

    private String getRoleInVietnamese(String role) {
        return switch (role.toLowerCase()) {
            case "ADMIN" -> "Quản trị viên";
            case "PM" -> "Quản lý Dự án";
            case "MEMBER" -> "Thành viên";
            case "VIEWER" -> "Người xem";
            default -> role;
        };
    }
} 