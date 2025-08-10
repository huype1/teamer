package com.example.backend.repository;

import com.example.backend.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    // Thêm index hints để tối ưu query
    @Query("SELECT a FROM Attachment a WHERE a.issue.id = :issueId ORDER BY a.uploadedAt DESC")
    List<Attachment> findByIssueId(@org.springframework.data.repository.query.Param("issueId") UUID issueId);
    
    @Query("SELECT a FROM Attachment a WHERE a.comment.id = :commentId ORDER BY a.uploadedAt DESC")
    List<Attachment> findByCommentId(@org.springframework.data.repository.query.Param("commentId") UUID commentId);
    
    @Query("SELECT a FROM Attachment a WHERE a.message.id = :messageId ORDER BY a.uploadedAt DESC")
    List<Attachment> findByMessageId(@org.springframework.data.repository.query.Param("messageId") UUID messageId);
} 