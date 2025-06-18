package com.example.backend.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

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
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}

