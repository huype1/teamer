package com.example.backend.mapper;

import com.example.backend.dto.request.TeamCreationRequest;
import com.example.backend.dto.request.TeamUpdateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.entity.Team;
import com.example.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class TeamMapper {
    public Team toEntity(TeamCreationRequest request, User creator) {
        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setAvatarUrl(request.getAvatarUrl());
        team.setCreatedBy(creator);
        return team;
    }

    public void updateEntity(Team team, TeamUpdateRequest request) {
        if (request.getName() != null) team.setName(request.getName());
        if (request.getDescription() != null) team.setDescription(request.getDescription());
        if (request.getAvatarUrl() != null) team.setAvatarUrl(request.getAvatarUrl());
    }

    public TeamResponse toResponse(Team team) {
        return new TeamResponse(
            team.getId(),
            team.getName(),
            team.getDescription(),
            team.getAvatarUrl(),
            team.getCreatedBy() != null ? team.getCreatedBy().getId() : null,
            team.getCreatedAt(),
            team.getUpdatedAt()
        );
    }
} 