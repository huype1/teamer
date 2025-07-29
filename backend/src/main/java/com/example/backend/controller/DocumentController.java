package com.example.backend.controller;

import com.example.backend.dto.request.DocumentCreationRequest;
import com.example.backend.dto.request.DocumentUpdateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.DocumentListResponse;
import com.example.backend.dto.response.DocumentResponse;
import com.example.backend.entity.Document;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.DocumentMapper;
import com.example.backend.service.DocumentService;
import com.example.backend.utils.JwtUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DocumentController {

    DocumentService documentService;
    DocumentMapper documentMapper;

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<DocumentListResponse>> getDocumentsByProject(
            @PathVariable("projectId") UUID projectId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching documents for project: {} by user: {}", projectId, userId);

        List<Document> documents = documentService.getDocumentsByProjectId(projectId, userId);
        List<DocumentListResponse> responses = documents.stream()
                .map(documentMapper::toListResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<DocumentListResponse>>builder()
                .message("Documents fetched successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/{documentId}")
    public ApiResponse<DocumentResponse> getDocumentById(
            @PathVariable("documentId") UUID documentId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Fetching document: {} by user: {}", documentId, userId);

        Document document = documentService.getDocumentById(documentId, userId);
        DocumentResponse response = documentMapper.toResponse(document);

        return ApiResponse.<DocumentResponse>builder()
                .message("Document fetched successfully")
                .result(response)
                .build();
    }

    @PostMapping
    public ApiResponse<DocumentResponse> createDocument(
            @RequestBody @Valid DocumentCreationRequest request
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Creating document for project: {} by user: {}", request.getProjectId(), userId);

        Document document = documentService.createDocument(request, userId);
        DocumentResponse response = documentMapper.toResponse(document);

        return ApiResponse.<DocumentResponse>builder()
                .message("Document created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{documentId}")
    public ApiResponse<DocumentResponse> updateDocument(
            @PathVariable("documentId") UUID documentId,
            @RequestBody @Valid DocumentUpdateRequest request
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Updating document: {} by user: {}", documentId, userId);

        Document document = documentService.updateDocument(documentId, request, userId);
        DocumentResponse response = documentMapper.toResponse(document);

        return ApiResponse.<DocumentResponse>builder()
                .message("Document updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{documentId}")
    public ApiResponse<Void> deleteDocument(
            @PathVariable("documentId") UUID documentId
    ) {
        UUID userId = JwtUtils.getSubjectFromJwt();
        log.info("Deleting document: {} by user: {}", documentId, userId);

        documentService.deleteDocument(documentId, userId);

        return ApiResponse.<Void>builder()
                .message("Document deleted successfully")
                .build();
    }
}
