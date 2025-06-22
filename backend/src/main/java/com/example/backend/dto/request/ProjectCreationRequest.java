package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreationRequest {
    
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name must be less than 100 characters")
    private String name;
    
    @NotBlank(message = "Project key is required")
    @Size(min = 2, max = 10, message = "Project key must be between 2 and 10 characters")
    private String key;
    
    private String description;
    
    private String avatarUrl;
    
    private Boolean isPublic = false;
    
    private UUID teamId;
} 