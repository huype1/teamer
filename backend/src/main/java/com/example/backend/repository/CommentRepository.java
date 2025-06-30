package com.example.backend.repository;

import com.example.backend.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
  List<Comment> findByIssueId(UUID issueId);
  List<Comment> findTop10ByOrderByCreatedAtDesc();
  List<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
