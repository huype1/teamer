package com.example.backend.dto.request;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class MessageCreationRequest {
    private UUID chatId;
    private String content;
    private List<AttachmentMeta> attachments;
}
