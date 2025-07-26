package com.example.backend.service;

import com.example.backend.dto.websocket.CommentMessage;
import com.example.backend.entity.Comment;
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
} 