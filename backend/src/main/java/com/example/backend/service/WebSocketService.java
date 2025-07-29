package com.example.backend.service;

import com.example.backend.dto.websocket.ChatMessage;
import com.example.backend.dto.websocket.CommentMessage;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Message;
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

    // Comment broadcasting methods
    public void broadcastCommentCreated(Comment comment) {
        CommentMessage message = CommentMessage.builder()
                .type("CREATE")
                .commentId(comment.getId())
                .issueId(comment.getIssue().getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .userEmail(comment.getUser().getEmail())
                .userAvatarUrl(comment.getUser().getAvatarUrl())
                .createdAt(comment.getCreatedAt() != null ? comment.getCreatedAt() : null)
                .updatedAt(comment.getUpdatedAt() != null ? comment.getUpdatedAt() : null)
                .build();

        String topic = "/topic/issue/" + comment.getIssue().getId() + "/comments";
        messagingTemplate.convertAndSend(topic, message);
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
    }

    public void broadcastCommentDeleted(UUID commentId, UUID issueId) {
        CommentMessage message = CommentMessage.builder()
                .type("DELETE")
                .commentId(commentId)
                .issueId(issueId)
                .build();

        messagingTemplate.convertAndSend("/topic/issue/" + issueId + "/comments", message);
    }

    // Chat broadcasting methods
    public void broadcastChatMessageCreated(Message message) {
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
                .build();

        String topic = "/topic/chat/" + message.getChat().getId() + "/messages";
        messagingTemplate.convertAndSend(topic, chatMessage);
    }

    public void broadcastChatMessageUpdated(Message message) {
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
                .build();

        String topic = "/topic/chat/" + message.getChat().getId() + "/messages";
        messagingTemplate.convertAndSend(topic, chatMessage);
    }

    public void broadcastChatMessageDeleted(UUID messageId, UUID chatId) {
        ChatMessage chatMessage = ChatMessage.builder()
                .type("DELETE")
                .messageId(messageId)
                .chatId(chatId)
                .build();

        String topic = "/topic/chat/" + chatId + "/messages";
        messagingTemplate.convertAndSend(topic, chatMessage);
    }
} 