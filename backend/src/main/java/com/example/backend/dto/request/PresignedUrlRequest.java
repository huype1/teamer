package com.example.backend.dto.request;

import lombok.Data;

@Data
public class PresignedUrlRequest {
    private String fileName;
    private String fileType;
} 