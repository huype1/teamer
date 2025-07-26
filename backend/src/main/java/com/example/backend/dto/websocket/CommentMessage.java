package com.example.backend.dto.websocket;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentMessage {
     String type;
     UUID commentId;
     UUID issueId;
     String content;
     UUID userId;
     String userName;
     String userEmail;
     String userAvatarUrl;
     OffsetDateTime createdAt;
     OffsetDateTime updatedAt;
} 