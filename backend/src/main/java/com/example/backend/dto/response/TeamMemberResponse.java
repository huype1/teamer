package com.example.backend.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {
    private UUID teamId;
    private UUID userId;
    private String role;
    private OffsetDateTime joinedAt;
    private UserResponse user;
} 