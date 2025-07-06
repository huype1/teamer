package com.example.backend.controller;

import com.example.backend.dto.request.InvitationRequest;
import com.example.backend.dto.request.ProjectCreationRequest;
import com.example.backend.dto.request.ProjectUpdateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ProjectMemberResponse;
import com.example.backend.dto.response.ProjectResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProjectMapper;
import com.example.backend.service.InvitationService;
import com.example.backend.service.ProjectService;
import com.example.backend.service.TeamService;
import com.example.backend.service.UserService;
import com.example.backend.utils.JwtUtils;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProjectController {

    ProjectService projectService;
    UserService userService;
    ProjectMapper projectMapper;
    InvitationService invitationService;
    TeamService teamService;

    @GetMapping
    public ApiResponse<List<ProjectResponse>> getProjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "false") boolean includePublic
// Not neccessary because we are using JwtUtils to get userId
//            @RequestHeader("Authorization") String authorizationHeader
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching projects for user: {} with keyword: {}, includePublic: {}", userId, keyword, includePublic);

        List<ProjectResponse> projects = projectService.searchProjects(keyword, userId);

        if (includePublic) {
            List<Project> publicProjects = projectService.getPublicProjects();
            List<ProjectResponse> publicProjectResponses = projectMapper.toResponseList(publicProjects);
            projects.addAll(publicProjectResponses);
        }

        return ApiResponse.<List<ProjectResponse>>builder()
                .message("Projects fetched successfully")
                .result(projects)
                .build();
    }

    @GetMapping("/{projectId}")
    public ApiResponse<ProjectResponse> getProjectById(
            @PathVariable("projectId") UUID projectId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching project: {} for user: {}", projectId, userId);

        if (!projectService.isUserProjectMember(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        Project project = projectService.getProjectById(projectId);
        ProjectResponse response = projectMapper.toResponse(project);

        return ApiResponse.<ProjectResponse>builder()
                .message("Project fetched successfully")
                .result(response)
                .build();
    }

    @PostMapping
    public ApiResponse<ProjectResponse> createProject(
            @RequestBody @Valid ProjectCreationRequest request
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Creating project: {} for user: {}", request.getName(), userId);

        // If a teamId is provided, check if the user is an admin of that team
        if (request.getTeamId() != null) {
            if (!teamService.isUserTeamAdmin(request.getTeamId(), userId)) {
                throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
            }
        }

        User creator = userService.getUserEntity(userId);
        Project projectEntity = projectMapper.toEntity(request);
        Project createdProject = projectService.createProject(projectEntity, creator, request.getTeamId());
        ProjectResponse response = projectMapper.toResponse(createdProject);

        return ApiResponse.<ProjectResponse>builder()
                .message("Project created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{projectId}")
    public ApiResponse<ProjectResponse> updateProject(
            @PathVariable("projectId") UUID projectId,
            @RequestBody @Valid ProjectUpdateRequest request
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Updating project: {} by user: {}", projectId, userId);

        if (!projectService.isUserProjectManager(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        Project projectEntity = projectMapper.toEntity(request);
        Project updatedProject = projectService.updateProject(projectEntity, projectId);
        ProjectResponse response = projectMapper.toResponse(updatedProject);

        return ApiResponse.<ProjectResponse>builder()
                .message("Project updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{projectId}")
    public ApiResponse<Void> deleteProject(
            @PathVariable("projectId") UUID projectId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting project: {} by user: {}", projectId, userId);

        // Check if user is admin of this project
        if (!projectService.isUserProjectManager(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        projectService.deleteProject(projectId);

        return ApiResponse.<Void>builder()
                .message("Project deleted successfully")
                .build();
    }

    @PostMapping("/invite")
    public ApiResponse<String> inviteProject(
            @RequestBody @Valid InvitationRequest invitationRequest
    ) throws MessagingException {

        UUID userId = JwtUtils.getSubjectFromJwt();
        if (!projectService.isUserProjectManager(invitationRequest.getProjectId(), userId)
                || !projectService.isUserProjectManager(invitationRequest.getProjectId(), userId)) {
            log.error("User: {} is not authorized to send invitations for project: {}", userId, invitationRequest.getProjectId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        invitationService.sendInvitation(invitationRequest.getEmail(), invitationRequest.getProjectId(), invitationRequest.getRole());
        return ApiResponse.<String>builder()
                .message("Send invitation successfully")
                .result("Invitation sent to " + invitationRequest.getEmail())
                .build();
    }

    @GetMapping("/accept_invitation")
    public ApiResponse<Invitation> acceptInviteProject(
            @RequestParam UUID token
    ) {

        UUID userId = JwtUtils.getSubjectFromJwt();
        Invitation invitation = invitationService.acceptInvitation(token);
        projectService.addUserToProject(invitation.getProject().getId(), userId, invitation.getRole());

        return ApiResponse.<Invitation>builder()
                .message("Invitation accepted successfully")
                .result(invitation)
                .build();
    }

    @GetMapping("/{projectId}/chat")
    public ApiResponse<Chat> getChatByProjectId(
            @PathVariable("projectId") UUID projectId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching chat ID for project: {} by user: {}", projectId, userId);

        // Check if user has access to this project chat
        if (!projectService.isUserProjectMember(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        Chat chat = projectService.getChatByProjectId(projectId);

        return ApiResponse.<Chat>builder()
                .message("Chat ID fetched successfully")
                .result(chat)
                .build();
    }

    @GetMapping("/team/{teamId}")
    public ApiResponse<List<ProjectResponse>> getProjectsByTeam(
            @PathVariable("teamId") UUID teamId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching projects for team: {} by user: {}", teamId, userId);

        List<Project> projects = projectService.getProjectsByTeam(teamId);
        List<ProjectResponse> responses = projectMapper.toResponseList(projects);

        return ApiResponse.<List<ProjectResponse>>builder()
                .message("Team projects fetched successfully")
                .result(responses)
                .build();
    }
    //not using the apis below for now, but keeping them for future use

    @GetMapping("/{projectId}/members")
    public ApiResponse<List<ProjectMemberResponse>> getProjectMembers(
            @PathVariable("projectId") UUID projectId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching members for project: {} by user: {}", projectId, userId);

        // Check if user has access to this project
        if (!projectService.isUserProjectMember(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        List<com.example.backend.entity.ProjectMember> members = projectService.getProjectMembers(projectId);
        List<ProjectMemberResponse> responses = members.stream()
                .map(projectMapper::toMemberResponse)
                .toList();

        return ApiResponse.<List<ProjectMemberResponse>>builder()
                .message("Project members fetched successfully")
                .result(responses)
                .build();
    }

    @DeleteMapping("/{projectId}/members/{memberUserId}")
    public ApiResponse<Void> removeProjectMember(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("memberUserId") UUID memberUserId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Removing member from project: {} by user: {}", projectId, userId);

        // Check if user is admin of this project
        if (!projectService.isUserProjectManager(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        projectService.removeUserFromProject(projectId, memberUserId);

        return ApiResponse.<Void>builder()
                .message("Member removed from project successfully")
                .build();
    }

    @PutMapping("/{projectId}/members/{memberUserId}/role")
    public ApiResponse<Void> updateMemberRole(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("memberUserId") UUID memberUserId,
            @RequestParam String newRole
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Updating member role in project: {} by user: {}", projectId, userId);

        if (!projectService.isUserProjectManager(projectId, userId)) {
            throw new AppException(com.example.backend.exception.ErrorCode.UNAUTHORIZED);
        }

        projectService.updateUserRole(projectId, memberUserId, newRole);

        return ApiResponse.<Void>builder()
                .message("Member role updated successfully")
                .build();
    }
}
