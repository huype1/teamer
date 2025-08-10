package com.example.backend.service;

import com.example.backend.entity.Notification;
import com.example.backend.entity.Project;
import com.example.backend.entity.NotificationRecipient;
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
        return String.format(
            """
            <html>
            <body>
                <h2>Bạn được mời tham gia: %s</h2>
                <p>Vai trò của bạn: <strong>%s</strong></p>
                <p>Nhấp vào liên kết sau để chấp nhận lời mời:</p>
                <a href=\"%s\">Chấp nhận lời mời</a>
                
                <p>Lời mời này sẽ hết hạn sau 7 ngày vì lý do bảo mật.</p>
                <p>Nếu bạn không mong đợi lời mời này, bạn có thể bỏ qua email này một cách an toàn.</p>
            </body>
            </html>
            """,
            project.getName(),
            role,
            link
        );
    }

    public void sendNotificationEmail(String email, NotificationRecipient recipient) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String subject = recipient.getNotification().getTitle();
        String content = createNotificationEmailTemplate(recipient);
        
        helper.setSubject(subject);
        helper.setText(content, true);
        helper.setTo(email);

        try {
            javaMailSender.send(mimeMessage);
            log.info("Notification email sent successfully to {}: {}", email, recipient.getNotification().getTitle());
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", email, e.getMessage());
            throw new MailSendException("Failed to send notification email", e);
        }
    }

    private String createNotificationEmailTemplate(NotificationRecipient recipient) {
        return String.format(
            """
            <html>
            <body>
                <h2>%s</h2>
                <p>%s</p>
                <p><a href="%s">Xem chi tiết</a></p>
                <p>Đây là email tự động từ Teamer. Gửi vào %s.</p>
            </body>
            </html>
            """,
            recipient.getNotification().getTitle(),
            recipient.getNotification().getContent(),
            recipient.getNotification().getLink(),
            recipient.getNotification().getCreatedAt().toString()
        );
    }


} 