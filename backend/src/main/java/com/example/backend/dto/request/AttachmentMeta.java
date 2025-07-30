package com.example.backend.dto.request;

import lombok.Data;
import lombok.*;

@Data
@Getter
@Setter
@Builder
public class AttachmentMeta {
    String fileName;
    String fileType;
    Long fileSize;
    String filePath;
}

