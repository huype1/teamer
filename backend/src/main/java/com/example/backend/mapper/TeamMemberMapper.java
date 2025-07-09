package com.example.backend.mapper;

import com.example.backend.dto.response.TeamMemberResponse;
import org.mapstruct.Mapper;
import com.example.backend.entity.TeamMember;

@Mapper(componentModel = "spring")
public interface TeamMemberMapper {
    TeamMemberResponse toTeamMemberResponse(TeamMember teamMember);
} 