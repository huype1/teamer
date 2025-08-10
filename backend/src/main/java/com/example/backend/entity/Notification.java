package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "link")
    String link;

    @Column(name = "type", nullable = false)
    String type;

    @Column(name = "entity_type")
    String entityType;

    @Column(name = "entity_id")
    UUID entityId;

    @Column(name = "priority", nullable = false)
    String priority = "NORMAL";

    @Column(name = "created_by")
    UUID createdBy; // User tạo notification

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;

    // Many-to-Many relationship với User thông qua NotificationRecipient
    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    List<NotificationRecipient> recipients = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (priority == null) {
            priority = "NORMAL";
        }
    }
} 