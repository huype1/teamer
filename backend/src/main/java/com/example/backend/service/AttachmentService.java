package com.example.backend.service;

import com.example.backend.entity.Attachment;
import com.example.backend.repository.AttachmentRepository;
import com.example.backend.dto.request.PresignedUrlRequest;
import com.example.backend.dto.request.AttachmentMeta;
import com.example.backend.dto.request.AttachmentCreationRequest;
import com.example.backend.entity.User;
import com.example.backend.entity.Project;
import com.example.backend.entity.Issue;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Message;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.IssueRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.core.sync.RequestBody;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.UUID;
import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final MessageRepository messageRepository;

    @Value("${aws.s3.bucket}")
    private String bucketName;
    @Value("${aws.s3.region}")
    private String region;
    @Value("${aws.s3.access-key}")
    private String accessKey;
    @Value("${aws.s3.secret-key}")
    private String secretKey;
    @Value("${aws.s3.prefix:}")
    private String prefix;

    // Singleton S3Presigner để tái sử dụng
    private S3Presigner s3Presigner;
    private S3Client s3Client;

    @PostConstruct
    public void init() {
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(awsCreds);
        
        // Khởi tạo S3Presigner một lần duy nhất
        this.s3Presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build();
        
        // Khởi tạo S3Client một lần duy nhất
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build();
    }

    public Attachment save(Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    public List<Attachment> getByIssueId(UUID issueId) {
        return attachmentRepository.findByIssueId(issueId);
    }

    public List<Attachment> getByCommentId(UUID commentId) {
        return attachmentRepository.findByCommentId(commentId);
    }

    public List<Attachment> getByMessageId(UUID messageId) {
        return attachmentRepository.findByMessageId(messageId);
    }

    public List<Attachment> getByProjectId(UUID projectId) {
        return attachmentRepository.findByProjectId(projectId);
    }

    public Map<String, String> generatePresignedUrl(PresignedUrlRequest request) {
        // Sử dụng singleton S3Presigner đã khởi tạo
        String key = (prefix != null ? prefix : "") + System.currentTimeMillis() + "_" + request.getFileName();

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(request.getFileType())
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();

        String url = s3Presigner.presignPutObject(presignRequest).url().toString();

        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        result.put("filePath", key);
        return result;
    }

    public String generateDownloadUrl(String filePath) {
        // Sử dụng singleton S3Presigner đã khởi tạo
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(filePath)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(60)) // 1 hour for downloads
                .getObjectRequest(objectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    public Attachment createAttachment(AttachmentMeta meta, User uploader, UUID issueId, UUID commentId, UUID messageId) {
        Attachment attachment = Attachment.builder()
                .fileName(meta.getFileName())
                .fileType(meta.getFileType())
                .fileSize(meta.getFileSize())
                .filePath(meta.getFilePath())
                .uploader(uploader)
                .build();

        // Set the appropriate relationship based on what's provided
        if (issueId != null) {
            // Note: You'll need to inject IssueRepository and fetch the issue
            // For now, we'll handle this in the service layer
        }
        if (commentId != null) {
            // Note: You'll need to inject CommentRepository and fetch the comment
            // For now, we'll handle this in the service layer
        }
        if (messageId != null) {
            // Note: You'll need to inject MessageRepository and fetch the message
            // For now, we'll handle this in the service layer
        }

        return attachmentRepository.save(attachment);
    }

    public void deleteAttachment(UUID attachmentId) {
        attachmentRepository.deleteById(attachmentId);
    }

    public Attachment createAttachmentFromRequest(AttachmentCreationRequest request) {
        Attachment attachment = Attachment.builder()
                .fileName(request.getFileName())
                .fileType(request.getFileType())
                .fileSize(request.getFileSize())
                .filePath(request.getFilePath())
                .build();

        // Set project if provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            attachment.setProject(project);
        }

        // Set issue if provided
        if (request.getIssueId() != null) {
            Issue issue = issueRepository.findById(request.getIssueId())
                    .orElseThrow(() -> new RuntimeException("Issue not found"));
            attachment.setIssue(issue);
        }

        // Set comment if provided
        if (request.getCommentId() != null) {
            Comment comment = commentRepository.findById(request.getCommentId())
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
            attachment.setComment(comment);
        }

        // Set message if provided
        if (request.getMessageId() != null) {
            Message message = messageRepository.findById(request.getMessageId())
                    .orElseThrow(() -> new RuntimeException("Message not found"));
            attachment.setMessage(message);
        }

        return attachmentRepository.save(attachment);
    }

    public AttachmentMeta uploadFileToS3(MultipartFile file) {
        try {
            // Sử dụng singleton S3Client đã khởi tạo
            String key = (prefix != null ? prefix : "") + "avatars/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return AttachmentMeta.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .filePath(key)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }
} 