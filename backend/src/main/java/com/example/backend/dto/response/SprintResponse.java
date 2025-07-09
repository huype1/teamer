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
public class SprintResponse {
    private UUID id;
    private UUID projectId;
    private String projectName;
    private String name;
    private String goal;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private String status;
    private UUID createdById;
    private String createdByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
} 