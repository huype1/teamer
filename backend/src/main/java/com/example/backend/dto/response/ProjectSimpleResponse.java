package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSimpleResponse {
    
    private UUID id;
    
    private String name;
    
    private String description;
    
    private String avatarUrl;
    
    private String key;
    
    private String clientName;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private Boolean isPublic;
    
    private OffsetDateTime createdAt;
    
    private OffsetDateTime updatedAt;
    
    private UUID teamId;
    
    private UUID chatId;
    
    // Removed creator to improve performance like team API
    
    private long memberCount;
}
