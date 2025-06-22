package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    
    private UUID id;
    
    private String name;
    
    private String description;
    
    private String avatarUrl;
    
    private String key;
    
    private Boolean isPublic;
    
    private OffsetDateTime createdAt;
    
    private OffsetDateTime updatedAt;
    
    private UUID teamId;
    
    private UUID chatId;
    
    private UserResponse creator;
    
    private List<ProjectMemberResponse> members;
    
    private long memberCount;
} 