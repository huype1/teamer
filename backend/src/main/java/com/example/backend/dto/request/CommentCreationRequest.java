package com.example.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CommentCreationRequest {
    UUID issueId;
    UUID userId;
    String content;
    List<AttachmentMeta> attachments;
}

