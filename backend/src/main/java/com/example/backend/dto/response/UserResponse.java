package com.example.backend.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    UUID id;
    String email;
    String name;
    String avatarUrl;
    String provider;

    List<ProjectMemberResponse> projectMembers;

    List<TeamMemberResponse> teamMembers;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}
