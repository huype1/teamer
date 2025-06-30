package com.example.backend.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamCreationRequest {
    @NotBlank
    private String name;
    private String description;
    private String avatarUrl;
} 