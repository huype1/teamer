package com.example.backend.repository;

import com.example.backend.entity.ProjectMember;
import com.example.backend.entity.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
    
    // Essential queries for project member operations
    List<ProjectMember> findByProjectId(UUID projectId);
    
    List<ProjectMember> findByUserId(UUID userId);
    
    Optional<ProjectMember> findByProjectIdAndUserId(UUID projectId, UUID userId);
    
    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);
    
    long countByProjectId(UUID projectId);
    
    List<ProjectMember> findByProjectIdAndRole(UUID projectId, String role);
    
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.projectId = :projectId AND pm.role = 'ADMIN'")
    List<ProjectMember> findAdminsByProjectId(@Param("projectId") UUID projectId);
    
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.userId = :userId AND pm.role = :role")
    List<ProjectMember> findByUserIdAndRole(@Param("userId") UUID userId, @Param("role") String role);
}
