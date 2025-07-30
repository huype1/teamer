package com.example.backend.mapper;

import com.example.backend.dto.response.IssueResponse;
import com.example.backend.entity.Issue;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class IssueMapper {

    public IssueResponse toResponse(Issue issue) {
        if (issue == null) {
            return null;
        }

        return IssueResponse.builder()
                .id(issue.getId())
                .key(issue.getKey())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .issueType(issue.getIssueType())
                .startDate(issue.getStartDate())
                .dueDate(issue.getDueDate())
                .storyPoints(issue.getStoryPoints())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .projectId(issue.getProject() != null ? issue.getProject().getId() : null)
                .projectName(issue.getProject() != null ? issue.getProject().getName() : null)
                .projectKey(issue.getProject() != null ? issue.getProject().getKey() : null)
                .sprintId(issue.getSprint() != null ? issue.getSprint().getId() : null)
                .sprintName(issue.getSprint() != null ? issue.getSprint().getName() : null)
                .parentId(issue.getParent() != null ? issue.getParent().getId() : null)
                .parentKey(issue.getParent() != null ? issue.getParent().getKey() : null)
                .parentTitle(issue.getParent() != null ? issue.getParent().getTitle() : null)
                .reporterId(issue.getReporter() != null ? issue.getReporter().getId() : null)
                .reporterName(issue.getReporter() != null ? issue.getReporter().getName() : null)
                .reporterEmail(issue.getReporter() != null ? issue.getReporter().getEmail() : null)
                .assigneeId(issue.getAssignee() != null ? issue.getAssignee().getId() : null)
                .assigneeName(issue.getAssignee() != null ? issue.getAssignee().getName() : null)
                .assigneeEmail(issue.getAssignee() != null ? issue.getAssignee().getEmail() : null)
                .subtasks(issue.getSubtasks() != null ? toResponseList(issue.getSubtasks()) : null)
                .build();
    }

    public List<IssueResponse> toResponseList(List<Issue> issues) {
        if (issues == null) {
            return List.of();
        }
        return issues.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
} 