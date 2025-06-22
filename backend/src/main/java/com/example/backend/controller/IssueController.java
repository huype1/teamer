package com.example.backend.controller;

import com.example.backend.dto.request.IssueRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.IssueResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.mapper.IssueMapper;
import com.example.backend.service.IssueService;
import com.example.backend.service.ProjectService;
import com.example.backend.utils.JwtUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class IssueController {

    IssueService issueService;
    ProjectService projectService;
    IssueMapper issueMapper;

    @GetMapping("/{issueId}")
    public ApiResponse<IssueResponse> getIssueById(@PathVariable UUID issueId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching issue: {} by user: {}", issueId, userId);

        Issue issue = issueService.getIssueById(issueId);
        
        // Check if user has access to this issue's project
        if (!projectService.isUserProjectMember(issue.getProject().getId(), userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        IssueResponse response = issueMapper.toResponse(issue);
        return ApiResponse.<IssueResponse>builder()
                .message("Issue fetched successfully")
                .result(response)
                .build();
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<IssueResponse>> getIssuesByProjectId(@PathVariable UUID projectId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching issues for project: {} by user: {}", projectId, userId);

        // Check if user has access to this project
        if (!projectService.isUserProjectMember(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        List<Issue> issues = issueService.getIssuesByProjectId(projectId);
        List<IssueResponse> responses = issueMapper.toResponseList(issues);

        return ApiResponse.<List<IssueResponse>>builder()
                .message("Issues fetched successfully")
                .result(responses)
                .build();
    }

    @PostMapping
    public ApiResponse<IssueResponse> createIssue(@RequestBody @Valid IssueRequest issueRequest) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Creating issue for project: {} by user: {}", issueRequest.getProjectId(), userId);

        // Check if user has access to this project
        if (!projectService.isUserProjectMember(issueRequest.getProjectId(), userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        Issue createdIssue = issueService.createIssue(issueRequest, issueRequest.getProjectId(), userId);
        IssueResponse response = issueMapper.toResponse(createdIssue);

        return ApiResponse.<IssueResponse>builder()
                .message("Issue created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{issueId}")
    public ApiResponse<IssueResponse> updateIssue(
            @PathVariable UUID issueId,
            @RequestBody @Valid IssueRequest issueRequest
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Updating issue: {} by user: {}", issueId, userId);

        Issue updatedIssue = issueService.updateIssue(issueId, issueRequest, userId);
        IssueResponse response = issueMapper.toResponse(updatedIssue);

        return ApiResponse.<IssueResponse>builder()
                .message("Issue updated successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{issueId}/status")
    public ApiResponse<IssueResponse> updateIssueStatus(
            @PathVariable UUID issueId,
            @RequestParam String status
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Updating issue status: {} to {} by user: {}", issueId, status, userId);

        Issue updatedIssue = issueService.updateIssueStatus(issueId, status, userId);
        IssueResponse response = issueMapper.toResponse(updatedIssue);

        return ApiResponse.<IssueResponse>builder()
                .message("Issue status updated successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{issueId}/assignee")
    public ApiResponse<IssueResponse> setAssignee(
            @PathVariable UUID issueId,
            @RequestParam UUID assigneeId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Setting assignee for issue: {} to user: {} by user: {}", issueId, assigneeId, userId);

        Issue updatedIssue = issueService.setAssignee(issueId, assigneeId, userId);
        IssueResponse response = issueMapper.toResponse(updatedIssue);

        return ApiResponse.<IssueResponse>builder()
                .message("Issue assignee updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{issueId}")
    public ApiResponse<Void> deleteIssue(@PathVariable UUID issueId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting issue: {} by user: {}", issueId, userId);

        issueService.deleteIssue(issueId, userId);

        return ApiResponse.<Void>builder()
                .message("Issue deleted successfully")
                .build();
    }

    @GetMapping("/project/{projectId}/status/{status}")
    public ApiResponse<List<IssueResponse>> getIssuesByProjectAndStatus(
            @PathVariable UUID projectId,
            @PathVariable String status
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching issues for project: {} with status: {} by user: {}", projectId, status, userId);

        // Check if user has access to this project
        if (!projectService.isUserProjectMember(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        List<Issue> issues = issueService.getIssuesByProjectId(projectId);
        List<Issue> filteredIssues = issues.stream()
                .filter(issue -> status.equalsIgnoreCase(issue.getStatus()))
                .toList();
        
        List<IssueResponse> responses = issueMapper.toResponseList(filteredIssues);

        return ApiResponse.<List<IssueResponse>>builder()
                .message("Issues fetched successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/project/{projectId}/assignee/{assigneeId}")
    public ApiResponse<List<IssueResponse>> getIssuesByProjectAndAssignee(
            @PathVariable UUID projectId,
            @PathVariable UUID assigneeId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching issues for project: {} assigned to user: {} by user: {}", projectId, assigneeId, userId);

        // Check if user has access to this project
        if (!projectService.isUserProjectMember(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        List<Issue> issues = issueService.getIssuesByProjectId(projectId);
        List<Issue> filteredIssues = issues.stream()
                .filter(issue -> issue.getAssignee() != null && assigneeId.equals(issue.getAssignee().getId()))
                .toList();
        
        List<IssueResponse> responses = issueMapper.toResponseList(filteredIssues);

        return ApiResponse.<List<IssueResponse>>builder()
                .message("Issues fetched successfully")
                .result(responses)
                .build();
    }
}