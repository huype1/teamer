package com.example.backend.service;

import com.example.backend.dto.request.AttachmentMeta;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.UserRepository;
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

    public String uploadAvatar(UUID userId, MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }

            // Validate file size (max 5MB for avatars)
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

    public void deleteAvatar(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Set default avatar
        user.setAvatarUrl("https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=");
        userRepository.save(user);
        
        log.info("Avatar deleted for user: {}", userId);
    }
} 