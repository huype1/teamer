package com.example.backend.repository;

import com.example.backend.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {
    List<Sprint> findByProjectId(UUID projectId);
    Sprint findByProjectIdAndName(UUID projectId, String name);
    List<Sprint> findByProjectIdAndStatus(UUID projectId, String status);
    
    // Sorted by status priority: ACTIVE -> PLANNING -> COMPLETED -> CANCELLED
    @Query("SELECT s FROM Sprint s WHERE s.project.id = :projectId ORDER BY " +
           "CASE s.status " +
           "WHEN 'ACTIVE' THEN 0 " +
           "WHEN 'PLANNING' THEN 1 " +
           "WHEN 'COMPLETED' THEN 2 " +
           "WHEN 'CANCELLED' THEN 3 " +
           "ELSE 4 END, " +
           "s.createdAt DESC")
    List<Sprint> findByProjectIdOrderByStatusPriority(@Param("projectId") UUID projectId);
} 