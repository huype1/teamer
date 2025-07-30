package com.example.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {

    private String type; // CREATE, UPDATE, DELETE
    private UUID notificationId;
    private String title;
    private String content;
    private String link;
    private String notificationType; // ISSUE, COMMENT, CHAT, etc.
    private String priority;
    private OffsetDateTime createdAt;
} 