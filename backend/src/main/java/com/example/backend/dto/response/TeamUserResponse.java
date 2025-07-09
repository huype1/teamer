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
public class TeamUserResponse {
    private UUID userId;
    private String name;
    private String email;
    private String avatarUrl;
    private String role;
    private OffsetDateTime joinedAt;
} 