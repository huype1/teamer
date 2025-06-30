package com.example.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

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
}
