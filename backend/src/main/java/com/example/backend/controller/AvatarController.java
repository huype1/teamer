package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.service.AvatarService;
import com.example.backend.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/avatars")
@RequiredArgsConstructor
@Slf4j
public class AvatarController {

    private final AvatarService avatarService;

    @PostMapping("/upload")
    public ApiResponse<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Uploading avatar for user: {}", userId);
        
        String avatarUrl = avatarService.uploadAvatar(userId, file);
        
        return ApiResponse.<String>builder()
                .message("Avatar uploaded successfully")
                .result(avatarUrl)
                .build();
    }

    @PostMapping("/team/{teamId}/upload")
    public ApiResponse<String> uploadTeamAvatar(
            @PathVariable UUID teamId,
            @RequestParam("file") MultipartFile file) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Uploading avatar for team: {} by user: {}", teamId, userId);
        
        String avatarUrl = avatarService.uploadTeamAvatar(teamId, file);
        
        return ApiResponse.<String>builder()
                .message("Team avatar uploaded successfully")
                .result(avatarUrl)
                .build();
    }

    @PostMapping("/project/{projectId}/upload")
    public ApiResponse<String> uploadProjectAvatar(
            @PathVariable UUID projectId,
            @RequestParam("file") MultipartFile file) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Uploading avatar for project: {} by user: {}", projectId, userId);
        
        String avatarUrl = avatarService.uploadProjectAvatar(projectId, file);
        
        return ApiResponse.<String>builder()
                .message("Project avatar uploaded successfully")
                .result(avatarUrl)
                .build();
    }

    @DeleteMapping("/delete")
    public ApiResponse<Void> deleteAvatar() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting avatar for user: {}", userId);
        
        avatarService.deleteAvatar(userId);
        
        return ApiResponse.<Void>builder()
                .message("Avatar deleted successfully")
                .build();
    }

    @DeleteMapping("/team/{teamId}/delete")
    public ApiResponse<Void> deleteTeamAvatar(@PathVariable UUID teamId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting avatar for team: {} by user: {}", teamId, userId);
        
        avatarService.deleteTeamAvatar(teamId);
        
        return ApiResponse.<Void>builder()
                .message("Team avatar deleted successfully")
                .build();
    }

    @DeleteMapping("/project/{projectId}/delete")
    public ApiResponse<Void> deleteProjectAvatar(@PathVariable UUID projectId) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting avatar for project: {} by user: {}", projectId, userId);
        
        avatarService.deleteProjectAvatar(projectId);
        
        return ApiResponse.<Void>builder()
                .message("Project avatar deleted successfully")
                .build();
    }
} 