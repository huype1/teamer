package com.example.backend.service;

import com.example.backend.dto.websocket.CommentMessage;
import com.example.backend.dto.websocket.NotificationMessage;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastCommentCreated(Comment comment) {
        CommentMessage message = CommentMessage.builder()
                .type("CREATE")
                .commentId(comment.getId())
                .issueId(comment.getIssue().getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .userEmail(comment.getUser().getEmail())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();

        messagingTemplate.convertAndSend("/topic/issue/" + comment.getIssue().getId() + "/comments", message);
        log.info("Broadcasted comment created: {}", comment.getId());
    }

    public void broadcastCommentUpdated(Comment comment) {
        CommentMessage message = CommentMessage.builder()
                .type("UPDATE")
                .commentId(comment.getId())
                .issueId(comment.getIssue().getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .userEmail(comment.getUser().getEmail())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();

        messagingTemplate.convertAndSend("/topic/issue/" + comment.getIssue().getId() + "/comments", message);
        log.info("Broadcasted comment updated: {}", comment.getId());
    }

    public void broadcastCommentDeleted(UUID commentId, UUID issueId) {
        CommentMessage message = CommentMessage.builder()
                .type("DELETE")
                .commentId(commentId)
                .issueId(issueId)
                .build();

        messagingTemplate.convertAndSend("/topic/issue/" + issueId + "/comments", message);
        log.info("Broadcasted comment deleted: {}", commentId);
    }

    // Notification broadcasting methods
    public void broadcastNotificationToUser(Notification notification) {
        NotificationMessage message = NotificationMessage.builder()
                .type("CREATE")
                .notificationId(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .link(notification.getLink())
                .notificationType(notification.getType())
                .priority(notification.getPriority())
                .createdAt(notification.getCreatedAt())
                .build();

        // Gửi đến user cụ thể
        messagingTemplate.convertAndSendToUser(
            notification.getUserId().toString(), 
            "/notifications", 
            message
        );
        
        log.info("Broadcasted notification to user: {}", notification.getUserId());
    }
} 