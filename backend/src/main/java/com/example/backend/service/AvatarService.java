package com.example.backend.service;

import com.example.backend.dto.request.AttachmentMeta;
import com.example.backend.entity.User;
import com.example.backend.entity.Team;
import com.example.backend.entity.Project;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.TeamRepository;
import com.example.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvatarService {

    private final AttachmentService attachmentService;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;

    public String uploadAvatar(UUID userId, MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }

            // Validate file size (max 15MB for avatars)
            if (file.getSize() > 15 * 1024 * 1024) {
                throw new AppException(ErrorCode.FILE_TOO_LARGE);
            }

            // Upload to S3 using AttachmentService
            AttachmentMeta attachmentMeta = attachmentService.uploadFileToS3(file);
            
            // Update user's avatar URL
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            
            // Generate the full S3 URL
            String avatarUrl = attachmentService.generateDownloadUrl(attachmentMeta.getFilePath());
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            
            log.info("Avatar uploaded successfully for user: {}, URL: {}", userId, avatarUrl);
            return avatarUrl;
            
        } catch (Exception e) {
            log.error("Error uploading avatar for user: {}", userId, e);
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    public String uploadTeamAvatar(UUID teamId, MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }

            // Validate file size (max 15MB for avatars)
            if (file.getSize() > 15 * 1024 * 1024) {
                throw new AppException(ErrorCode.FILE_TOO_LARGE);
            }

            // Upload to S3 using AttachmentService
            AttachmentMeta attachmentMeta = attachmentService.uploadFileToS3(file);
            
            // Update team's avatar URL
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND));
            
            // Generate the full S3 URL
            String avatarUrl = attachmentService.generateDownloadUrl(attachmentMeta.getFilePath());
            team.setAvatarUrl(avatarUrl);
            teamRepository.save(team);
            
            log.info("Avatar uploaded successfully for team: {}, URL: {}", teamId, avatarUrl);
            return avatarUrl;
            
        } catch (Exception e) {
            log.error("Error uploading avatar for team: {}", teamId, e);
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    public String uploadProjectAvatar(UUID projectId, MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }

            // Validate file size (max 15MB for avatars)
            if (file.getSize() > 15 * 1024 * 1024) {
                throw new AppException(ErrorCode.FILE_TOO_LARGE);
            }

            // Upload to S3 using AttachmentService
            AttachmentMeta attachmentMeta = attachmentService.uploadFileToS3(file);
            
            // Update project's avatar URL
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            
            // Generate the full S3 URL
            String avatarUrl = attachmentService.generateDownloadUrl(attachmentMeta.getFilePath());
            project.setAvatarUrl(avatarUrl);
            projectRepository.save(project);
            
            log.info("Avatar uploaded successfully for project: {}, URL: {}", projectId, avatarUrl);
            return avatarUrl;
            
        } catch (Exception e) {
            log.error("Error uploading avatar for project: {}", projectId, e);
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    public void deleteAvatar(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Set default avatar
        user.setAvatarUrl("https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=");
        userRepository.save(user);
        
        log.info("Avatar deleted for user: {}", userId);
    }

    public void deleteTeamAvatar(UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND));
        
        // Set default avatar
        team.setAvatarUrl("https://cdn2.iconfinder.com/data/icons/avatar1/166/Untitled-1-512.png");
        teamRepository.save(team);
        
        log.info("Avatar deleted for team: {}", teamId);
    }

    public void deleteProjectAvatar(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        
        // Set default avatar
        project.setAvatarUrl("https://images.icon-icons.com/2699/PNG/512/atlassian_jira_logo_icon_170511.png");
        projectRepository.save(project);
        
        log.info("Avatar deleted for project: {}", projectId);
    }
} 