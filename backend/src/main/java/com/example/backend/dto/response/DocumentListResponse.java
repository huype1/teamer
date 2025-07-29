package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.example.backend.dto.response.UserResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentListResponse {
    
    private UUID id;
    private String title;
    private UserResponse creator;
    private UUID projectId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}