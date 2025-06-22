package com.example.backend.dto.response;

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
public class ProjectMemberResponse {
    
    private UUID projectId;
    
    private UUID userId;
    
    private String role;
    
    private OffsetDateTime joinedAt;
    
    private UserResponse user;
} 