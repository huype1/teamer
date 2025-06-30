package com.example.backend.dto.response.dashboard;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RecentActivityResponse {
    UUID activityId;
    String type;
    String description;
    LocalDateTime timestamp;
    UUID relatedEntityId;
    String relatedEntityType;
}
