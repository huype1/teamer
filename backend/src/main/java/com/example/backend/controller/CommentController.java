package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.request.CommentCreationRequest;
import com.example.backend.service.CommentService;
import com.example.backend.service.UserService;
import com.example.backend.utils.JwtUtils;
import com.example.backend.entity.Comment;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommentController {

    CommentService commentService;

    @PostMapping
    public ApiResponse<Comment> createComment(@RequestBody CommentCreationRequest commentRequest) {
        log.info("Creating comment for issue with ID: {}", commentRequest.getIssueId());
        return ApiResponse.<Comment>builder()
                .message("Comment created successfully")
                .result(commentService.createComment(commentRequest.getIssueId(), commentRequest.getUserId(), commentRequest.getContent()))
                .build();
    }

    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable UUID commentId) {
        log.info("Deleting comment with ID: {}", commentId);
        UUID userId = JwtUtils.getSubjectFromJwt();
        commentService.deleteComment(commentId, userId);
        return ApiResponse.<Void>builder()
                .message("Comment deleted successfully")
                .build();
    }

    @GetMapping("/{issueId}")
    public ApiResponse<List<Comment>> getCommentsByIssueId(@PathVariable UUID issueId) {
        log.info("Getting comments for issue with ID: {}", issueId);
        return ApiResponse.<List<Comment>>builder()
                .message("Comments fetched successfully")
                .result(commentService.getCommentsByIssueId(issueId))
                .build();
    }
}
