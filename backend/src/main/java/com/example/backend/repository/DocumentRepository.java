package com.example.backend.repository;

import com.example.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    
    @Query("SELECT d FROM Document d WHERE d.project.id = :projectId ORDER BY d.updatedAt DESC")
    List<Document> findByProjectId(@Param("projectId") UUID projectId);
    
    @Query("SELECT d FROM Document d WHERE d.project.id = :projectId AND d.id = :documentId")
    Optional<Document> findByProjectIdAndDocumentId(@Param("projectId") UUID projectId, @Param("documentId") UUID documentId);
    
    @Query("SELECT d FROM Document d WHERE d.project.id = :projectId AND d.creator.id = :userId ORDER BY d.updatedAt DESC")
    List<Document> findByProjectIdAndCreatorId(@Param("projectId") UUID projectId, @Param("userId") UUID userId);
    
    boolean existsByProjectIdAndId(UUID projectId, UUID documentId);
}
