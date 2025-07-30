package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueResponse {

    private UUID id;
    private String key;
    private String title;
    private String description;
    private String priority;
    private String status;
    private String issueType;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Integer storyPoints;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Project info (avoiding full entity to prevent recursive joining)
    private UUID projectId;
    private String projectName;
    private String projectKey;

    // Sprint info
    private UUID sprintId;
    private String sprintName;

    // Parent issue info
    private UUID parentId;
    private String parentKey;
    private String parentTitle;

    // User info (avoiding full entity to prevent recursive joining)
    private UUID reporterId;
    private String reporterName;
    private String reporterEmail;
    
    private UUID assigneeId;
    private String assigneeName;
    private String assigneeEmail;

    // Subtasks info
    private List<IssueResponse> subtasks;

}
