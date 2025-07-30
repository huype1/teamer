package com.example.backend.service;

import com.example.backend.dto.websocket.ChatMessage;
import com.example.backend.dto.websocket.CommentMessage;
import com.example.backend.dto.websocket.NotificationMessage;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Message;
import com.example.backend.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
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

    // Chat message broadcasting methods
    public void broadcastChatMessageCreated(Message message) {
        log.info("Broadcasting chat message created for messageId: {}, chatId: {}", message.getId(), message.getChat().getId());
        
        // Get attachments for this message
        List<ChatMessage.AttachmentInfo> attachments = message.getAttachments() != null ? 
                message.getAttachments().stream()
                        .map(att -> ChatMessage.AttachmentInfo.builder()
                                .id(att.getId())
                                .fileName(att.getFileName())
                                .fileType(att.getFileType())
                                .fileSize(att.getFileSize())
                                .filePath(att.getFilePath())
                                .build())
                        .toList() : 
                List.of();
        
        ChatMessage chatMessage = ChatMessage.builder()
                .type("CREATE")
                .messageId(message.getId())
                .chatId(message.getChat().getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .senderEmail(message.getSender().getEmail())
                .senderAvatarUrl(message.getSender().getAvatarUrl())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .attachments(attachments)
                .build();

        String topic = "/topic/chat/" + message.getChat().getId() + "/messages";
        log.info("Sending chat message to topic: {}", topic);
        messagingTemplate.convertAndSend(topic, chatMessage);
        log.info("Broadcasted chat message created: {}", message.getId());
    }

    public void broadcastChatMessageUpdated(Message message) {
        // Get attachments for this message
        List<ChatMessage.AttachmentInfo> attachments = message.getAttachments() != null ? 
                message.getAttachments().stream()
                        .map(att -> ChatMessage.AttachmentInfo.builder()
                                .id(att.getId())
                                .fileName(att.getFileName())
                                .fileType(att.getFileType())
                                .fileSize(att.getFileSize())
                                .filePath(att.getFilePath())
                                .build())
                        .toList() : 
                List.of();
        
        ChatMessage chatMessage = ChatMessage.builder()
                .type("UPDATE")
                .messageId(message.getId())
                .chatId(message.getChat().getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .senderEmail(message.getSender().getEmail())
                .senderAvatarUrl(message.getSender().getAvatarUrl())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .attachments(attachments)
                .build();

        messagingTemplate.convertAndSend("/topic/chat/" + message.getChat().getId() + "/messages", chatMessage);
        log.info("Broadcasted chat message updated: {}", message.getId());
    }

    public void broadcastChatMessageDeleted(UUID messageId, UUID chatId) {
        ChatMessage chatMessage = ChatMessage.builder()
                .type("DELETE")
                .messageId(messageId)
                .chatId(chatId)
                .build();

        messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/messages", chatMessage);
        log.info("Broadcasted chat message deleted: {}", messageId);
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