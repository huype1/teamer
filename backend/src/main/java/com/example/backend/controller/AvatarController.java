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

    @DeleteMapping("/delete")
    public ApiResponse<Void> deleteAvatar() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting avatar for user: {}", userId);
        
        avatarService.deleteAvatar(userId);
        
        return ApiResponse.<Void>builder()
                .message("Avatar deleted successfully")
                .build();
    }
} 