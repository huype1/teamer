package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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

    void sendEmailWithToken (String email, String link) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String subject = "Invitation to join the project";
        String content = String.format(
                "<p>Click the link below to join the project:</p><a href=\"%s\">Join Project</a>",
                link);
        helper.setSubject(subject);
        helper.setText(content, true);
        helper.setTo(email);

        try {
            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", email, e.getMessage());
            throw new MailSendException("Failed to send email", e);
        }
    }
}