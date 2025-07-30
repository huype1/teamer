package com.example.backend.service;

import com.example.backend.entity.Attachment;
import com.example.backend.repository.AttachmentRepository;
import com.example.backend.dto.request.PresignedUrlRequest;
import com.example.backend.dto.request.AttachmentMeta;
import com.example.backend.entity.User;
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
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;

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

    public Map<String, String> generatePresignedUrl(PresignedUrlRequest request) {
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
        S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build();

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

        String url = presigner.presignPutObject(presignRequest).url().toString();

        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        result.put("filePath", key);
        return result;
    }

    public String generateDownloadUrl(String filePath) {
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
        S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build();

        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(filePath)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(60)) // 1 hour for downloads
                .getObjectRequest(objectRequest)
                .build();

        return presigner.presignGetObject(presignRequest).url().toString();
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
} 