package com.example.backend.dto.websocket;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessage {
    String type;
    UUID messageId;
    UUID chatId;
    String content;
    UUID senderId;
    String senderName;
    String senderEmail;
    String senderAvatarUrl;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
    List<AttachmentInfo> attachments;
    
    @Builder
    @Getter
    @FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
    public static class AttachmentInfo {
        UUID id;
        String fileName;
        String fileType;
        Long fileSize;
        String filePath;
    }
} 