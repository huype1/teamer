package com.example.backend.controller;

import com.example.backend.dto.request.TeamCreationRequest;
import com.example.backend.dto.request.TeamUpdateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.dto.response.TeamMemberResponse;
import com.example.backend.entity.Team;
import com.example.backend.entity.TeamMember;
import com.example.backend.entity.User;
import com.example.backend.mapper.TeamMapper;
import com.example.backend.mapper.UserMapper;
import com.example.backend.service.TeamService;
import com.example.backend.service.UserService;
import com.example.backend.utils.JwtUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TeamController {
    final TeamService teamService;
    final TeamMapper teamMapper;
    final UserMapper userMapper;
    final UserService userService;

    @PostMapping
    public ApiResponse<TeamResponse> createTeam(@RequestBody @Valid TeamCreationRequest request) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        User creator = userService.getUserEntity(userId);
        Team team = teamService.createTeam(request, creator);
        return ApiResponse.<TeamResponse>builder()
                .message("Team created successfully")
                .result(teamMapper.toResponse(team))
                .build();
    }

    @PutMapping("/{teamId}")
    public ApiResponse<TeamResponse> updateTeam(@PathVariable UUID teamId, @RequestBody @Valid TeamUpdateRequest request) {
        Team updatedTeam = teamService.updateTeam(teamId, request);
        return ApiResponse.<TeamResponse>builder()
                .message("Team updated successfully")
                .result(teamMapper.toResponse(updatedTeam))
                .build();
    }

    @DeleteMapping("/{teamId}")
    public ApiResponse<Void> deleteTeam(@PathVariable UUID teamId) {
        teamService.deleteTeam(teamId);
        return ApiResponse.<Void>builder()
                .message("Team deleted successfully")
                .build();
    }

    @GetMapping("/{teamId}")
    public ApiResponse<TeamResponse> getTeamById(@PathVariable UUID teamId) {
        Team team = teamService.getTeamById(teamId);
        return ApiResponse.<TeamResponse>builder()
                .message("Team fetched successfully")
                .result(teamMapper.toResponse(team))
                .build();
    }

    @GetMapping
    public ApiResponse<List<TeamResponse>> getTeams(@RequestParam(required = false) String keywords) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        List<Team> teams = teamService.searchTeams(userId, keywords);
        return ApiResponse.<List<TeamResponse>>builder()
                .message("Teams fetched successfully")
                .result(teams.stream().map(teamMapper::toResponse).collect(Collectors.toList()))
                .build();
    }

    @PostMapping("/{teamId}/members")
    public ApiResponse<Void> addMemberToTeam(@PathVariable UUID teamId, @RequestParam UUID userId, @RequestParam String role) {
        teamService.addMemberToTeam(teamId, userId, role);
        return ApiResponse.<Void>builder()
                .message("Member added to team successfully")
                .build();
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ApiResponse<Void> removeMemberFromTeam(@PathVariable UUID teamId, @PathVariable UUID userId) {
        teamService.removeMemberFromTeam(teamId, userId);
        return ApiResponse.<Void>builder()
                .message("Member removed from team successfully")
                .build();
    }

    @PutMapping("/{teamId}/members")
    public ApiResponse<TeamResponse> updateMemberRole(@PathVariable UUID teamId, @RequestParam UUID userId, @RequestParam String role) {
        teamService.updateMemberRole(teamId, userId, role);
        return ApiResponse.<TeamResponse>builder()
                .message("Member role updated successfully")
                .result(teamMapper.toResponse(teamService.getTeamById(teamId)))
                .build();
    }

    @GetMapping("/{teamId}/members")
    public ApiResponse<List<TeamMemberResponse>> getTeamMembers(@PathVariable UUID teamId) {
        List<TeamMember> members = teamService.getTeamMembers(teamId);
        List<TeamMemberResponse> responses = members.stream()
                .map(member -> new TeamMemberResponse(
                        member.getTeamId(),
                        member.getUserId(),
                        member.getRole(),
                        member.getJoinedAt(),
                        userMapper.toUserResponse(member.getUser())
                ))
                .collect(Collectors.toList());
        return ApiResponse.<List<TeamMemberResponse>>builder()
                .message("Team members fetched successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/admin")
    public ApiResponse<List<TeamResponse>> getTeamsWhereUserIsAdmin() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        List<Team> teams = teamService.getTeamsWhereUserIsAdmin(userId);
        List<TeamResponse> responses = teams.stream().map(teamMapper::toResponse).collect(Collectors.toList());
        return ApiResponse.<List<TeamResponse>>builder()
                .message("Teams where user is admin fetched successfully")
                .result(responses)
                .build();
    }
}