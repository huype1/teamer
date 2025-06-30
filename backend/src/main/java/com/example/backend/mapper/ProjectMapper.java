package com.example.backend.mapper;

import com.example.backend.dto.request.ProjectCreationRequest;
import com.example.backend.dto.request.ProjectUpdateRequest;
import com.example.backend.dto.response.ProjectMemberResponse;
import com.example.backend.dto.response.ProjectResponse;
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

                .build();
    }
    
    public Project toEntity(ProjectUpdateRequest request) {
        return Project.builder()
                .name(request.getName())
                .key(request.getKey())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .isPublic(request.getIsPublic())
                .build();
    }
    
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
                .isPublic(project.getIsPublic())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
                .chatId(project.getChat() != null ? project.getChat().getId() : null)
                .creator(project.getCreator() != null ? userMapper.toUserResponse(project.getCreator()) : null)
                .members(memberResponses)
                .build();
    }
    
    public ProjectMemberResponse toMemberResponse(ProjectMember member) {
        return ProjectMemberResponse.builder()
                .projectId(member.getProjectId())
                .userId(member.getUserId())
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .user(member.getUser() != null ? userMapper.toUserResponse(member.getUser()) : null)
                .build();
    }
    
    public List<ProjectResponse> toResponseList(List<Project> projects) {
        return projects.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
} 