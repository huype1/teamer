package com.example.backend.service;

import com.example.backend.dto.request.NotificationCreationRequest;
import com.example.backend.entity.Notification;
import com.example.backend.entity.NotificationRecipient;
import com.example.backend.entity.User;
import com.example.backend.repository.NotificationRecipientRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.IssueRepository;
import com.example.backend.repository.ProjectMemberRepository;
import com.example.backend.utils.JwtUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {

    NotificationRepository notificationRepository;
    NotificationRecipientRepository notificationRecipientRepository;
    WebSocketService webSocketService;
    EmailService emailService;
    UserService userService;
    IssueRepository issueRepository;
    ProjectMemberRepository projectMemberRepository;

    /**
     * Tạo notification cho nhiều user và gửi real-time + email
     */
    @Transactional
    public Notification createNotification(NotificationCreationRequest request) {
        log.info("Creating notification for {} users", request.getUserIds().size());

        // 1. Tạo notification chính
        Notification unsavedNotification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .link(request.getLink())
                .type(request.getType())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .priority(request.getPriority())
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : JwtUtils.getSubjectFromJwt())
                .build();

        Notification notification = notificationRepository.save(unsavedNotification);

        // 2. Tạo NotificationRecipient cho từng user
        List<NotificationRecipient> recipients = request.getUserIds().stream()
                .map(userId -> NotificationRecipient.builder()
                        .notification(notification)
                        .user(User.builder().id(userId).build())
                        .isRead(false)
                        .isEmailSent(false)
                        .build())
                .collect(Collectors.toList());

        notificationRecipientRepository.saveAll(recipients);

        recipients.forEach(recipient -> {
            webSocketService.broadcastNotificationToUser(recipient);
        });

        // 4. Gửi email (async) cho từng user nếu không phải COMMENT hoặc CHAT
        if (!"COMMENT".equalsIgnoreCase(notification.getType()) && !"CHAT".equalsIgnoreCase(notification.getType())) {
            recipients.forEach(recipient -> {
                sendNotificationEmailAsync(recipient);
            });
        }

        return notification;
    }

    /** No state kept in service; controller should use returned Notification. */

    /**
     * Tạo notification cho issue được assign
     */
    public void notifyIssueAssigned(UUID assigneeId, String issueTitle, UUID issueId, String projectName) {
        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userIds(List.of(assigneeId))
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
                .userIds(List.of(assigneeId))
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
     * Tạo notification cho comment mới - thông báo cho assignee, reporter và các user đã comment
     */
    public void notifyNewComment(UUID issueId, String commenterName, String issueTitle, UUID currentUserId) {
        // Lấy danh sách user cần thông báo (assignee + reporter, bỏ người đang comment)
        List<UUID> recipients = getCommentNotificationRecipients(issueId, currentUserId);
        
        if (recipients.isEmpty()) {
            return;
        }

        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userIds(recipients)
                .title("Bình luận mới")
                .content(String.format("%s đã bình luận về issue: %s", commenterName, issueTitle))
                .link(String.format("/issues/%s", issueId))
                .type("COMMENT")
                .entityType("ISSUE")
                .entityId(issueId)
                .priority("LOW")
                .createdBy(currentUserId)
                .build();

        createNotification(request);
    }

    /**
     * Tạo notification cho chat message mới - thông báo cho tất cả member trong project
     */
    public void notifyNewChatMessage(UUID projectId, String senderName, String projectName, UUID currentUserId) {
        // Lấy danh sách member trong project (trừ người gửi)
        List<UUID> recipients = getProjectMemberIds(projectId, currentUserId);
        
        if (recipients.isEmpty()) {
            return;
        }

        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userIds(recipients)
                .title("Tin nhắn mới")
                .content(String.format("%s đã gửi tin nhắn trong dự án %s", senderName, projectName))
                .link(String.format("/projects/%s/chat", projectId))
                .type("CHAT")
                .entityType("CHAT")
                .entityId(projectId)
                .priority("LOW")
                .build();

        createNotification(request);
    }

    /**
     * Lấy danh sách user cần thông báo khi có comment mới
     */
    private List<UUID> getCommentNotificationRecipients(UUID issueId, UUID currentUserId) {
        try {
            // Lấy assignee và reporter từ Issue, thêm vào danh sách
            var optionalIssue = issueRepository.findById(issueId);
            if (optionalIssue.isEmpty()) return List.of();
            var issue = optionalIssue.get();
            java.util.Set<UUID> ids = new java.util.HashSet<>();
            if (issue.getAssignee() != null) ids.add(issue.getAssignee().getId());
            if (issue.getReporter() != null) ids.add(issue.getReporter().getId());
            ids.remove(currentUserId);
            return new java.util.ArrayList<>(ids);
        } catch (Exception e) {
            log.error("Error getting comment notification recipients: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Lấy danh sách member trong project (trừ người gửi)
     */
    private List<UUID> getProjectMemberIds(UUID projectId, UUID currentUserId) {
        try {
            var members = projectMemberRepository.findByProjectId(projectId);
            return members.stream()
                    .map(pm -> pm.getUserId())
                    .filter(id -> !id.equals(currentUserId))
                    .toList();
        } catch (Exception e) {
            log.error("Error getting project member IDs: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Thông báo khi sprint được cập nhật/bắt đầu/kết thúc/hủy cho tất cả thành viên project
     */
    public void notifySprintUpdated(UUID projectId, String sprintName, String action, UUID currentUserId) {
        List<UUID> recipients = getProjectMemberIds(projectId, currentUserId);
        if (recipients.isEmpty()) return;

        String title = switch (action) {
            case "UPDATED" -> "Sprint được cập nhật";
            case "STARTED" -> "Sprint đã bắt đầu";
            case "ENDED" -> "Sprint đã kết thúc";
            case "CANCELLED" -> "Sprint đã bị hủy";
            default -> "Cập nhật Sprint";
        };

        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userIds(recipients)
                .title(title)
                .content(String.format("Sprint '%s' của dự án đã %s", sprintName, action.toLowerCase()))
                .link(String.format("/projects/%s", projectId))
                .type("SPRINT")
                .entityType("SPRINT")
                .entityId(projectId)
                .priority("NORMAL")
                .build();

        createNotification(request);
    }

    /**
     * Lấy notifications của user
     */
    public List<NotificationRecipient> getNotificationsByUserId(UUID userId) {
        return notificationRecipientRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    /**
     * Đếm unread notifications
     */
    public Long getUnreadCount(UUID userId) {
        return notificationRecipientRepository.countUnreadByUserId(userId);
    }

    /**
     * Mark all notifications as read
     */
    public void markAllAsRead(UUID userId) {
        notificationRecipientRepository.markAllAsReadByUserId(userId);
    }

    /**
     * Mark single notification as read
     */
    public void markAsRead(UUID notificationRecipientId, UUID userId) {
        notificationRecipientRepository.markAsReadByIdAndUserId(notificationRecipientId, userId);
    }

    /**
     * Gửi email notification (async)
     */
    @Async
    public CompletableFuture<Void> sendNotificationEmailAsync(NotificationRecipient recipient) {
        try {
            User user = userService.getUserEntity(recipient.getUser().getId());
            if (user != null && user.getEmail() != null) {
                emailService.sendNotificationEmail(user.getEmail(), recipient);
                
                // Update trạng thái đã gửi email
                recipient.setIsEmailSent(true);
                notificationRecipientRepository.save(recipient);
                
                log.info("Notification email sent successfully to: {}", user.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send notification email: {}", e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }
} 