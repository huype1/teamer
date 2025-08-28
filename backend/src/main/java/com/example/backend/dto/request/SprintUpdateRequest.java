package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintUpdateRequest {
    
    private String name;
    private String goal;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
}
