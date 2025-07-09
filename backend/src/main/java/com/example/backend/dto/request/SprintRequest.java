package com.example.backend.dto.request;

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
public class SprintRequest {
    private String name;
    private String goal;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private UUID projectId;
} 