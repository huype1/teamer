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
public class NotificationRecipientResponse {

    private UUID id; // NotificationRecipient ID
    private UUID notificationId;
    private String title;
    private String content;
    private String link;
    private String type;
    private String entityType;
    private UUID entityId;
    private String priority;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Thông tin recipient
    private Boolean isRead;
    private Boolean isEmailSent;
} 