package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentCreationRequest {
    
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String filePath;
    private UUID projectId;
    private UUID issueId;
    private UUID commentId;
    private UUID messageId;
}



