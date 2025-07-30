package com.example.backend.dto.response;

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
public class NotificationResponse {

    private UUID id;
    private UUID userId;
    private String title;
    private String content;
    private String link;
    private String type;
    private String entityType;
    private UUID entityId;
    private Boolean isRead;
    private Boolean isEmailSent;
    private String priority;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
} 