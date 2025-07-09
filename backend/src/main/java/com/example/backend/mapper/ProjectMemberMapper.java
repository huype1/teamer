package com.example.backend.mapper;

import com.example.backend.dto.response.ProjectMemberResponse;
import org.mapstruct.Mapper;
import com.example.backend.entity.ProjectMember;

@Mapper(componentModel = "spring")
public interface ProjectMemberMapper {
    ProjectMemberResponse toProjectMemberResponse(ProjectMember projectMember);
} 