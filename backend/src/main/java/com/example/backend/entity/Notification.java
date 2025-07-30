package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
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

    @Column(name = "user_id", nullable = false)
    UUID userId;

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

    @Column(name = "is_read", nullable = false)
    Boolean isRead = false;

    @Column(name = "is_email_sent", nullable = false)
    Boolean isEmailSent = false;

    @Column(name = "priority", nullable = false)
    String priority = "NORMAL";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    User user;

    @PrePersist
    protected void onCreate() {
        if (isRead == null) {
            isRead = false;
        }
        if (isEmailSent == null) {
            isEmailSent = false;
        }
        if (priority == null) {
            priority = "NORMAL";
        }
    }
} 