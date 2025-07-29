package com.example.backend.service;

import com.example.backend.dto.request.DocumentCreationRequest;
import com.example.backend.dto.request.DocumentUpdateRequest;
import com.example.backend.entity.Document;
import com.example.backend.entity.Project;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.DocumentRepository;
import com.example.backend.repository.ProjectRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentService {
    
    DocumentRepository documentRepository;
    ProjectRepository projectRepository;
    UserService userService;
    ProjectService projectService;

    public List<Document> getDocumentsByProjectId(UUID projectId, UUID userId) throws AppException {
        log.info("Fetching documents for project: {} by user: {}", projectId, userId);
        
        // Check if user has access to the project
        if (!projectService.isUserProjectMember(projectId, userId)) {
            log.error("User {} does not have access to project {}", userId, projectId);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return documentRepository.findByProjectId(projectId);
    }

    public Document getDocumentById(UUID documentId, UUID userId) throws AppException {
        log.info("Fetching document: {} by user: {}", documentId, userId);
        
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> {
                    log.error("Document not found for id: {}", documentId);
                    return new AppException(ErrorCode.DOCUMENT_NOT_FOUND);
                });
        
        // Check if user has access to the project
        if (!projectService.isUserProjectMember(document.getProject().getId(), userId)) {
            log.error("User {} does not have access to document {}", userId, documentId);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return document;
    }

    public Document createDocument(DocumentCreationRequest request, UUID userId) throws AppException {
        log.info("Creating document for project: {} by user: {}", request.getProjectId(), userId);
        
        User user = userService.getUserEntity(userId);
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        
        Project project = projectService.getProjectById(request.getProjectId());
        
        // Check if user has access to the project
        if (!projectService.isUserProjectMember(request.getProjectId(), userId)) {
            log.error("User {} does not have access to project {}", userId, request.getProjectId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        Document document = Document.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .creator(user)
                .project(project)
                .build();
        
        return documentRepository.save(document);
    }

    public Document updateDocument(UUID documentId, DocumentUpdateRequest request, UUID userId) throws AppException {
        log.info("Updating document: {} by user: {}", documentId, userId);
        
        Document document = getDocumentById(documentId, userId);
        
        // Check if user is the creator or has admin access
        if (!document.getCreator().getId().equals(userId) && 
            !projectService.isUserProjectManager(document.getProject().getId(), userId)) {
            log.error("User {} does not have permission to update document {}", userId, documentId);
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            document.setTitle(request.getTitle());
        }
        
        if (request.getContent() != null) {
            document.setContent(request.getContent());
        }
        
        return documentRepository.save(document);
    }

    public void deleteDocument(UUID documentId, UUID userId) throws AppException {
        log.info("Deleting document: {} by user: {}", documentId, userId);
        
        Document document = getDocumentById(documentId, userId);
        
        // Check if user is the creator or has admin access
        if (!document.getCreator().getId().equals(userId) && 
            !projectService.isUserProjectManager(document.getProject().getId(), userId)) {
            log.error("User {} does not have permission to delete document {}", userId, documentId);
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        documentRepository.delete(document);
    }

    public boolean isUserDocumentCreator(UUID documentId, UUID userId) {
        try {
            Document document = documentRepository.findById(documentId).orElse(null);
            return document != null && document.getCreator().getId().equals(userId);
        } catch (Exception e) {
            log.error("Error checking document creator: ", e);
            return false;
        }
    }
}