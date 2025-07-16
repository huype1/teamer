package com.example.backend.repository;

import com.example.backend.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByIssueId(UUID issueId);
    List<Attachment> findByCommentId(UUID commentId);
    List<Attachment> findByMessageId(UUID messageId);
} 