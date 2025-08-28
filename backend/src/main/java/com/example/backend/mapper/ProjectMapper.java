package com.example.backend.mapper;

import com.example.backend.dto.request.ProjectCreationRequest;
import com.example.backend.dto.request.ProjectUpdateRequest;
import com.example.backend.dto.response.ProjectResponse;
import com.example.backend.dto.response.ProjectSimpleResponse;
import com.example.backend.dto.response.ProjectMemberResponse;
import com.example.backend.dto.response.UserMinimalResponse;
import com.example.backend.entity.Project;
import com.example.backend.entity.ProjectMember;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProjectMapper {

    private final UserMapper userMapper;

    public ProjectMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public Project toEntity(ProjectCreationRequest request) {
        return Project.builder()
                .name(request.getName())
                .key(request.getKey())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .isPublic(request.getIsPublic())
                .clientName(request.getClientName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
    }
    
    public Project toEntity(ProjectUpdateRequest request) {
        return Project.builder()
                .name(request.getName())
                .key(request.getKey())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .isPublic(request.getIsPublic())
                .clientName(request.getClientName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
    }
    
    // Simplified response without fetching members - for better performance
    public ProjectSimpleResponse toSimpleResponse(Project project) {
        return ProjectSimpleResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .avatarUrl(project.getAvatarUrl())
                .key(project.getKey())
                .clientName(project.getClientName())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .isPublic(project.getIsPublic())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
                .chatId(project.getChat() != null ? project.getChat().getId() : null)
                // Removed creator to improve performance like team API
                .memberCount(0) // Will be set separately if needed
                .build();
    }
    
    // Full response with members - use only when needed
    public ProjectResponse toResponse(Project project) {
        List<ProjectMemberResponse> memberResponses = null;
        if (project.getProjectMembers() != null) {
            memberResponses = project.getProjectMembers().stream()
                    .map(this::toMemberResponse)
                    .collect(Collectors.toList());
        }
        
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .avatarUrl(project.getAvatarUrl())
                .key(project.getKey())
                .clientName(project.getClientName())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .isPublic(project.getIsPublic())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
                .chatId(project.getChat() != null ? project.getChat().getId() : null)
                .creator(project.getCreator() != null ? userMapper.toUserResponse(project.getCreator()) : null)
                .members(memberResponses)
                .memberCount(memberResponses != null ? memberResponses.size() : 0)
                .build();
    }

    // Optimized response with minimal data fetching
    public ProjectResponse toResponseOptimized(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .avatarUrl(project.getAvatarUrl())
                .key(project.getKey())
                .clientName(project.getClientName())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .isPublic(project.getIsPublic())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
                .chatId(project.getChat() != null ? project.getChat().getId() : null)
                .creator(project.getCreator() != null ? userMapper.toUserResponse(project.getCreator()) : null)
                .members(null) // Don't fetch members for performance
                .memberCount(0) // Will be set separately if needed
                .build();
    }
    
    public ProjectMemberResponse toMemberResponse(ProjectMember member) {
        return ProjectMemberResponse.builder()
                .projectId(member.getProjectId())
                .userId(member.getUserId())
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
    
    public List<ProjectSimpleResponse> toSimpleResponseList(List<Project> projects) {
        return projects.stream()
                .map(this::toSimpleResponse) // Use simple response for list
                .collect(Collectors.toList());
    }
    
    public List<ProjectResponse> toResponseList(List<Project> projects) {
        return projects.stream()
                .map(this::toResponse) // Use full response for list
                .collect(Collectors.toList());
    }
    
    public List<ProjectResponse> toDetailedResponseList(List<Project> projects) {
        return projects.stream()
                .map(this::toResponse) // Use full response when needed
                .collect(Collectors.toList());
    }
} 