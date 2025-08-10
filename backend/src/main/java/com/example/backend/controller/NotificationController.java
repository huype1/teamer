package com.example.backend.controller;

import com.example.backend.dto.request.NotificationCreationRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.NotificationRecipientResponse;
import com.example.backend.entity.NotificationRecipient;
import com.example.backend.entity.Notification;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.NotificationMapper;
import com.example.backend.repository.NotificationRecipientRepository;
import com.example.backend.service.NotificationService;
import com.example.backend.utils.JwtUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {

    NotificationRecipientRepository notificationRecipientRepository;
    NotificationMapper notificationMapper;
    NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<NotificationRecipientResponse>> getNotifications() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching notifications for user: {}", userId);

        List<NotificationRecipient> recipients = notificationService.getNotificationsByUserId(userId);
        List<NotificationRecipientResponse> responses = recipients.stream()
                .map(notificationMapper::toRecipientResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<NotificationRecipientResponse>>builder()
                .message("Notifications fetched successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching unread count for user: {}", userId);

        Long unreadCount = notificationService.getUnreadCount(userId);

        return ApiResponse.<Long>builder()
                .message("Unread count fetched successfully")
                .result(unreadCount)
                .build();
    }

    @PutMapping("/mark-all-read")
    public ApiResponse<Void> markAllAsRead() {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Marking all notifications as read for user: {}", userId);

        notificationService.markAllAsRead(userId);

        return ApiResponse.<Void>builder()
                .message("All notifications marked as read")
                .build();
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable("id") UUID id) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Marking notification: {} as read for user: {}", id, userId);

        notificationService.markAsRead(id, userId);

        return ApiResponse.<Void>builder()
                .message("Notification marked as read")
                .build();
    }

    @PostMapping
    public ApiResponse<NotificationRecipientResponse> createNotification(@RequestBody @Valid NotificationCreationRequest request) {
        log.info("Creating notification for {} users", request.getUserIds().size());

        // Tạo notification và lấy recipient đầu tiên để trả về
        Notification notification = notificationService.createNotification(request);
        List<NotificationRecipient> recipients = notificationRecipientRepository.findByNotificationId(notification.getId());

        NotificationRecipientResponse response = recipients.isEmpty()
                ? null
                : notificationMapper.toRecipientResponse(recipients.get(0));

        return ApiResponse.<NotificationRecipientResponse>builder()
                .message("Notification created successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(@PathVariable("id") UUID id) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting notification recipient: {} for user: {}", id, userId);

        NotificationRecipient recipient = notificationRecipientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!recipient.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        notificationRecipientRepository.delete(recipient);

        return ApiResponse.<Void>builder()
                .message("Notification deleted successfully")
                .build();
    }
} 