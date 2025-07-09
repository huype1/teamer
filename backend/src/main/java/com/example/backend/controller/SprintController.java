package com.example.backend.controller;

import com.example.backend.dto.request.SprintRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.SprintResponse;
import com.example.backend.dto.response.IssueResponse;
import com.example.backend.entity.Sprint;
import com.example.backend.entity.Project;
import com.example.backend.entity.ProjectMember;
import com.example.backend.repository.SprintRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.ProjectMemberRepository;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.utils.JwtUtils;
import com.example.backend.mapper.SprintMapper;
import com.example.backend.mapper.IssueMapper;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import com.example.backend.repository.IssueRepository;
import com.example.backend.entity.Issue;
import com.example.backend.service.ProjectService;

@RestController
@RequestMapping("/sprints")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SprintController {
    SprintRepository sprintRepository;
    ProjectRepository projectRepository;
    ProjectMemberRepository projectMemberRepository;
    UserService userService;
    IssueRepository issueRepository;
    SprintMapper sprintMapper;
    IssueMapper issueMapper;
    ProjectService projectService;

    private void checkProjectManagerOrAdmin(UUID projectId, UUID userId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
        if (!("ADMIN".equals(member.getRole()) || "PM".equals(member.getRole()))) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<SprintResponse>> getSprintsByProject(@PathVariable UUID projectId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching sprints for project: {} by user: {}", projectId, userId);
        
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        List<SprintResponse> responses = sprintMapper.toResponseList(sprints);
        
        return ApiResponse.<List<SprintResponse>>builder()
                .result(responses)
                .message("Sprints fetched successfully")
                .build();
    }

    @PostMapping
    public ApiResponse<SprintResponse> createSprint(@RequestBody SprintRequest request) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Creating sprint for project: {} by user: {}", request.getProjectId(), userId);
        
        // Validate project exists
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        
        checkProjectManagerOrAdmin(request.getProjectId(), userId);
        
        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .project(project)
                .status("PLANNING")
                .build();
        
        Sprint saved = sprintRepository.save(sprint);
        SprintResponse response = sprintMapper.toResponse(saved);
        
        return ApiResponse.<SprintResponse>builder()
                .result(response)
                .message("Sprint created successfully")
                .build();
    }

    @PutMapping("/{sprintId}")
    public ApiResponse<SprintResponse> updateSprint(@PathVariable UUID sprintId, @RequestBody Sprint sprint) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Updating sprint: {} by user: {}", sprintId, userId);
        
        Sprint existing = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        checkProjectManagerOrAdmin(existing.getProject().getId(), userId);
        
        existing.setName(sprint.getName());
        existing.setGoal(sprint.getGoal());
        existing.setStartDate(sprint.getStartDate());
        existing.setEndDate(sprint.getEndDate());
        Sprint saved = sprintRepository.save(existing);
        SprintResponse response = sprintMapper.toResponse(saved);
        
        return ApiResponse.<SprintResponse>builder()
                .result(response)
                .message("Sprint updated successfully")
                .build();
    }

    @DeleteMapping("/{sprintId}")
    public ApiResponse<Void> deleteSprint(@PathVariable UUID sprintId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting sprint: {} by user: {}", sprintId, userId);
        
        Sprint existing = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        checkProjectManagerOrAdmin(existing.getProject().getId(), userId);
        
        sprintRepository.deleteById(sprintId);
        
        return ApiResponse.<Void>builder()
                .message("Sprint deleted successfully")
                .build();
    }

    @PostMapping("/{sprintId}/start")
    public ApiResponse<SprintResponse> startSprint(@PathVariable UUID sprintId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (!projectService.isUserProjectManager(sprint.getProject().getId(), userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        List<Sprint> activeSprints = sprintRepository.findByProjectIdAndStatus(sprint.getProject().getId(), "ACTIVE");
        if (!activeSprints.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        sprint.setStatus("ACTIVE");
        sprint.setStartDate(java.time.OffsetDateTime.now());
        Sprint saved = sprintRepository.save(sprint);
        SprintResponse response = sprintMapper.toResponse(saved);
        return ApiResponse.<SprintResponse>builder()
                .result(response)
                .message("Sprint started successfully")
                .build();
    }

    @PostMapping("/{sprintId}/end")
    public ApiResponse<SprintResponse> endSprint(@PathVariable UUID sprintId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (!projectService.isUserProjectManager(sprint.getProject().getId(), userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        sprint.setStatus("COMPLETED");
        sprint.setEndDate(java.time.OffsetDateTime.now());
        Sprint saved = sprintRepository.save(sprint);
        SprintResponse response = sprintMapper.toResponse(saved);
        return ApiResponse.<SprintResponse>builder()
                .result(response)
                .message("Sprint ended successfully")
                .build();
    }

    @PostMapping("/{sprintId}/cancel")
    public ApiResponse<SprintResponse> cancelSprint(@PathVariable UUID sprintId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (!projectService.isUserProjectManager(sprint.getProject().getId(), userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        sprint.setStatus("CANCELLED");
        Sprint saved = sprintRepository.save(sprint);
        SprintResponse response = sprintMapper.toResponse(saved);
        return ApiResponse.<SprintResponse>builder()
                .result(response)
                .message("Sprint cancelled successfully")
                .build();
    }

    @GetMapping("/{sprintId}/issues")
    public ApiResponse<List<IssueResponse>> getIssuesBySprint(@PathVariable UUID sprintId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching issues for sprint: {} by user: {}", sprintId, userId);
        
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        
        List<Issue> issues = issueRepository.findBySprintId(sprintId);
        List<IssueResponse> responses = issueMapper.toResponseList(issues);
        
        return ApiResponse.<List<IssueResponse>>builder()
                .result(responses)
                .message("Sprint issues fetched successfully")
                .build();
    }

    @GetMapping("/project/{projectId}/issues/backlog")
    public ApiResponse<List<IssueResponse>> getBacklogIssues(@PathVariable UUID projectId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching backlog issues for project: {} by user: {}", projectId, userId);
        
        List<Issue> issues = issueRepository.findBySprintIsNullAndProjectId(projectId);
        List<IssueResponse> responses = issueMapper.toResponseList(issues);
        
        return ApiResponse.<List<IssueResponse>>builder()
                .result(responses)
                .message("Backlog issues fetched successfully")
                .build();
    }

    @GetMapping("/project/{projectId}/issues/active")
    public ApiResponse<List<IssueResponse>> getActiveSprintIssues(@PathVariable UUID projectId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching active sprint issues for project: {} by user: {}", projectId, userId);
        
        List<Issue> issues = issueRepository.findActiveSprintIssues(projectId);
        List<IssueResponse> responses = issueMapper.toResponseList(issues);
        
        return ApiResponse.<List<IssueResponse>>builder()
                .result(responses)
                .message("Active sprint issues fetched successfully")
                .build();
    }

    @GetMapping("/project/{projectId}/issues/upcoming")
    public ApiResponse<List<IssueResponse>> getUpcomingSprintIssues(@PathVariable UUID projectId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching upcoming sprint issues for project: {} by user: {}", projectId, userId);
        
        List<Issue> issues = issueRepository.findUpcomingSprintIssues(projectId);
        List<IssueResponse> responses = issueMapper.toResponseList(issues);
        
        return ApiResponse.<List<IssueResponse>>builder()
                .result(responses)
                .message("Upcoming sprint issues fetched successfully")
                .build();
    }
} 