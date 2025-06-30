package com.example.backend.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamUpdateRequest {
    private String name;
    private String description;
    private String avatarUrl;
} 