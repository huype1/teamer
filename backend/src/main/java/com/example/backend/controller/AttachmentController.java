package com.example.backend.controller;

import com.example.backend.entity.Attachment;
import com.example.backend.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import com.example.backend.dto.request.PresignedUrlRequest;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentController {
    private final AttachmentService attachmentService;

    @GetMapping("/issue/{issueId}")
    public List<Attachment> getByIssue(@PathVariable UUID issueId) {
        return attachmentService.getByIssueId(issueId);
    }

    @GetMapping("/comment/{commentId}")
    public List<Attachment> getByComment(@PathVariable UUID commentId) {
        return attachmentService.getByCommentId(commentId);
    }

    @GetMapping("/message/{messageId}")
    public List<Attachment> getByMessage(@PathVariable UUID messageId) {
        return attachmentService.getByMessageId(messageId);
    }

    @PostMapping("/presigned-url")
    public Map<String, String> getPresignedUrl(@RequestBody PresignedUrlRequest request) {
        return attachmentService.generatePresignedUrl(request);
    }

    @PostMapping("/download-url")
    public Map<String, String> getDownloadUrl(@RequestBody Map<String, String> request) {
        String filePath = request.get("filePath");
        String downloadUrl = attachmentService.generateDownloadUrl(filePath);
        
        Map<String, String> result = new HashMap<>();
        result.put("downloadUrl", downloadUrl);
        return result;
    }
} 