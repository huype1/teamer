package com.example.backend.service;

import com.example.backend.dto.request.NotificationCreationRequest;
import com.example.backend.entity.Notification;
import com.example.backend.entity.User;
import com.example.backend.repository.NotificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {

    NotificationRepository notificationRepository;
    WebSocketService webSocketService;
    EmailService emailService;
    UserService userService;

    /**
     * Tạo notification và gửi real-time + email
     */
    public Notification createNotification(NotificationCreationRequest request) {
        log.info("Creating notification for user: {}", request.getUserId());

        // 1. Lưu vào database
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .content(request.getContent())
                .link(request.getLink())
                .type(request.getType())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .priority(request.getPriority())
                .build();

        notification = notificationRepository.save(notification);

        // 2. Gửi real-time qua WebSocket
        webSocketService.broadcastNotificationToUser(notification);

        // 3. Gửi email (async để không block)
        sendNotificationEmailAsync(notification);

        return notification;
    }

    /**
     * Tạo notification cho issue được assign
     */
    public void notifyIssueAssigned(UUID assigneeId, String issueTitle, UUID issueId, String projectName) {
        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userId(assigneeId)
                .title("Issue được giao")
                .content(String.format("Bạn được giao issue: %s trong dự án %s", issueTitle, projectName))
                .link(String.format("/projects/%s/issues/%s", issueId, issueId))
                .type("ISSUE")
                .entityType("ISSUE")
                .entityId(issueId)
                .priority("NORMAL")
                .build();

        createNotification(request);
    }

    /**
     * Tạo notification cho issue status thay đổi
     */
    public void notifyIssueStatusChanged(UUID assigneeId, String issueTitle, String oldStatus, String newStatus, UUID issueId) {
        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userId(assigneeId)
                .title("Trạng thái issue thay đổi")
                .content(String.format("Issue '%s' đã chuyển từ %s sang %s", issueTitle, oldStatus, newStatus))
                .link(String.format("/issues/%s", issueId))
                .type("ISSUE")
                .entityType("ISSUE")
                .entityId(issueId)
                .priority("NORMAL")
                .build();

        createNotification(request);
    }

    /**
     * Tạo notification cho comment mới
     */
    public void notifyNewComment(UUID issueAssigneeId, String commenterName, String issueTitle, UUID issueId) {
        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userId(issueAssigneeId)
                .title("Bình luận mới")
                .content(String.format("%s đã bình luận về issue: %s", commenterName, issueTitle))
                .link(String.format("/issues/%s", issueId))
                .type("COMMENT")
                .entityType("ISSUE")
                .entityId(issueId)
                .priority("LOW")
                .build();

        createNotification(request);
    }

    /**
     * Tạo notification cho chat message mới
     */
    public void notifyNewChatMessage(UUID recipientId, String senderName, String projectName, UUID chatId) {
        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userId(recipientId)
                .title("Tin nhắn mới")
                .content(String.format("%s đã gửi tin nhắn trong dự án %s", senderName, projectName))
                .link(String.format("/projects/%s/chat", chatId))
                .type("CHAT")
                .entityType("CHAT")
                .entityId(chatId)
                .priority("LOW")
                .build();

        createNotification(request);
    }

    /**
     * Lấy notifications của user
     */
    public List<Notification> getNotificationsByUserId(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Đếm unread notifications
     */
    public Long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Mark all notifications as read
     */
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    /**
     * Mark single notification as read
     */
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.markAsReadByIdAndUserId(notificationId, userId);
    }

    /**
     * Gửi email notification (async)
     */
    @Async
    public CompletableFuture<Void> sendNotificationEmailAsync(Notification notification) {
        try {
            User user = userService.getUserEntity(notification.getUserId());
            if (user != null && user.getEmail() != null) {
                emailService.sendNotificationEmail(user.getEmail(), notification);
                
                // Update trạng thái đã gửi email
                notification.setIsEmailSent(true);
                notificationRepository.save(notification);
                
                log.info("Notification email sent successfully to: {}", user.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send notification email: {}", e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }
} 