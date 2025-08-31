package com.example.backend.service;

import com.example.backend.dto.response.IssueResponse;
import com.example.backend.entity.Issue;
import com.example.backend.repository.IssueRepository;
import com.example.backend.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SearchService {

    IssueRepository issueRepository;

    public List<IssueResponse> searchIssues(String keyword) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Searching issues for user: {}, keyword: {}", userId, keyword);

        List<Issue> issues = issueRepository.findByUserAccess(userId, keyword);
        
        return issues.stream()
                .map(this::mapIssueToResponse)
                .collect(Collectors.toList());
    }

    private IssueResponse mapIssueToResponse(Issue issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .key(issue.getKey())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .issueType(issue.getIssueType())
                .projectId(issue.getProject().getId())
                .projectName(issue.getProject().getName())
                .assigneeId(issue.getAssignee() != null ? issue.getAssignee().getId() : null)
                .assigneeName(issue.getAssignee() != null ? issue.getAssignee().getName() : null)
                .reporterId(issue.getReporter().getId())
                .reporterName(issue.getReporter().getName())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
