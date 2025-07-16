package com.example.backend.service;


import com.example.backend.entity.Comment;
import com.example.backend.entity.Issue;
import com.example.backend.entity.User;
import com.example.backend.entity.Attachment;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.IssueRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.AttachmentRepository;
import com.example.backend.dto.request.AttachmentMeta;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService {
    CommentRepository commentRepository;
    IssueRepository issueRepository;
    UserRepository userRepository;
    AttachmentRepository attachmentRepository;

    public Comment createComment(UUID issueId, UUID userId, String content, List<AttachmentMeta> attachments) {
      Optional<Issue> issue = issueRepository.findById(issueId);
      Optional<User> user = userRepository.findById(userId);

      if (issue.isEmpty() || user.isEmpty()) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      Comment comment = new Comment();
      comment.setIssue(issue.get());
      comment.setUser(user.get());
      comment.setContent(content);
      comment.setCreatedAt(OffsetDateTime.now());
      comment.setUpdatedAt(OffsetDateTime.now());

      try {
          Comment savedComment = commentRepository.save(comment);
          // Lưu attachments nếu có
          if (attachments != null) {
              for (AttachmentMeta meta : attachments) {
                  Attachment att = Attachment.builder()
                          .comment(savedComment)
                          .fileName(meta.getFileName())
                          .fileType(meta.getFileType())
                          .fileSize(meta.getFileSize())
                          .filePath(meta.getFilePath())
                          .uploader(user.get())
                          .build();
                  attachmentRepository.save(att);
              }
          }
          return savedComment;
      } catch (Exception e) {
          log.error("Error creating comment: {}", e.getMessage());
          throw new AppException(ErrorCode.CREATION_FAILED);
      }
    }

    public void deleteComment(UUID commentId, UUID userId) {
      Optional<Comment> comment = commentRepository.findById(commentId);
      Optional<User> user = userRepository.findById(userId);

      if (comment.isEmpty() || user.isEmpty()) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      // Only allow comment author to delete their own comment
      if (!comment.get().getUser().getId().equals(userId)) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      commentRepository.deleteById(commentId);
    }

    public Comment updateComment(UUID id, Comment comment) {
      Comment existingComment = commentRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

      existingComment.setContent(comment.getContent());
      return commentRepository.save(existingComment);
    }

    public List<Comment> getCommentsByIssueId(UUID issueId) {
      return commentRepository.findByIssueId(issueId);
    }
}
