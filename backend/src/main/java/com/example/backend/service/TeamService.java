package com.example.backend.service;

import com.example.backend.dto.response.ProjectResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProjectMapper;
import com.example.backend.mapper.TeamMapper;
import com.example.backend.repository.ProjectMemberRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.TeamRepository;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TeamService {
    TeamRepository teamRepository;
    ChatService chatService;
    TeamMemberRepository teamMemberRepository;
    TeamMapper teamMapper;

    public Team createTeam(com.example.backend.dto.request.TeamCreationRequest request, User creator) {
        Team team = teamMapper.toEntity(request, creator);
        Team savedTeam = teamRepository.save(team);
        
        // Automatically add creator as ADMIN member
        TeamMember creatorMember = TeamMember.builder()
                .teamId(savedTeam.getId())
                .userId(creator.getId())
                .role("ADMIN")
                .build();
        teamMemberRepository.save(creatorMember);
        
        return savedTeam;
    }

    public Team updateTeam(UUID teamId, com.example.backend.dto.request.TeamUpdateRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        teamMapper.updateEntity(team, request);
        return teamRepository.save(team);
    }

    public void deleteTeam(UUID teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        teamRepository.deleteById(teamId);
    }

    public Team getTeamById(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
    }

    public Team findById(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND));
    }

    public List<Team> searchTeams(UUID userId, String keywords) {
        if (keywords == null || keywords.trim().isEmpty()) {
            return teamRepository.findAllTeamsByUserId(userId);
        }
        return teamRepository.findByNameContainingIgnoreCase(keywords.trim(), userId);
    }

    public TeamMember addMemberToTeam(UUID teamId, UUID userId, String role) {
        Team team = getTeamById(teamId);
        
        // Check if member already exists
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new AppException(ErrorCode.ALREADY_EXISTS);
        }
        
        TeamMember member = TeamMember.builder()
                .teamId(teamId)
                .userId(userId)
                .role(role)
                .build();
        
        return teamMemberRepository.save(member);
    }

    public void removeMemberFromTeam(UUID teamId, UUID userId) {
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        
        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
    }
}
