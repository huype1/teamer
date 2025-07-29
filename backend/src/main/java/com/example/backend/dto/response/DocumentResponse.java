package com.example.backend.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
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
public class DocumentResponse {
    
    private UUID id;
    private String title;
    private JsonNode content;
    private UserResponse creator;
    private UUID projectId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}