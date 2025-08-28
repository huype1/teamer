package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreationRequest {

    @NotEmpty(message = "User IDs are required")
    private List<UUID> userIds; // Danh sách user nhận notification

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 1000, message = "Content must not exceed 1000 characters")
    private String content;

    private String link;

    @NotBlank(message = "Type is required")
    @Size(max = 50, message = "Type must not exceed 50 characters")
    private String type;

    @Size(max = 50, message = "Entity type must not exceed 50 characters")
    private String entityType;

    private UUID entityId;

    @Size(max = 20, message = "Priority must not exceed 20 characters")
    private String priority = "NORMAL";

    private UUID createdBy; // User tạo notification (optional, sẽ dùng JWT nếu null)

    // Constructor để backward compatibility với single user
    public NotificationCreationRequest(UUID userId, String title, String content, String link, String type, String entityType, UUID entityId, String priority) {
        this.userIds = List.of(userId);
        this.title = title;
        this.content = content;
        this.link = link;
        this.type = type;
        this.entityType = entityType;
        this.entityId = entityId;
        this.priority = priority;
    }
} 