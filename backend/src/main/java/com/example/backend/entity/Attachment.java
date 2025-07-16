package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne
    @JoinColumn(name = "issue_id")
    Issue issue;

    @ManyToOne
    @JoinColumn(name = "comment_id")
    Comment comment;

    @ManyToOne
    @JoinColumn(name = "message_id")
    Message message;

    @Column(name = "file_name", nullable = false)
    String fileName;

    @Column(name = "file_type", nullable = false)
    String fileType;

    @Column(name = "file_size", nullable = false)
    Long fileSize;

    @Column(name = "file_path", nullable = false)
    String filePath;

    @ManyToOne
    @JoinColumn(name = "uploader_id")
    User uploader;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    OffsetDateTime uploadedAt;
} 