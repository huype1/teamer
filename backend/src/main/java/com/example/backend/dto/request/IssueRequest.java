package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueRequest {

    private UUID projectId;
    private String title;
    private String description;
    private String priority;
    private String status;
    private String issueType;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Integer storyPoints;
    private UUID assigneeId;

}
