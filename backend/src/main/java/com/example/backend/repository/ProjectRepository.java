package com.example.backend.repository;

import com.example.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    // Simplified query for better performance
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN FETCH p.creator " +
            "LEFT JOIN p.projectMembers pm " +
            "LEFT JOIN p.team t " +
            "LEFT JOIN t.projects tp " +
            "LEFT JOIN tp.projectMembers tpm " +
            "WHERE (pm.userId = :userId OR p.creator.id = :userId) " +
            "OR (p.isPublic = true AND p.team IS NOT NULL AND tpm.userId = :userId) " +
            "AND (p.name LIKE %:keywords% OR p.key LIKE %:keywords%)")
    List<Project> findByNameOrKeyContainingIgnoreCase(@Param("keywords") String keywords, @Param("userId") UUID userId);

    // Simplified query for better performance
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN FETCH p.creator " +
            "LEFT JOIN p.projectMembers pm " +
            "WHERE pm.userId = :userId OR p.creator.id = :userId")
    List<Project> findAllProjectsByUserId(@Param("userId") UUID userId);

    // Fast query for simple project list (no creator fetch)
    @Query("SELECT p FROM Project p " +
            "LEFT JOIN p.projectMembers pm " +
            "WHERE pm.userId = :userId OR p.creator.id = :userId")
    List<Project> findAllProjectsByUserIdSimple(@Param("userId") UUID userId);

    boolean existsByKey(String key);

    List<Project> findByIsPublicTrue();

    List<Project> findByTeamId(UUID teamId);

    List<Project> findByCreatorId(UUID creatorId);

    @Query("SELECT p FROM Project p WHERE p.key = :key")
    List<Project> findByKey(@Param("key") String key);

    List<Project> findByTeamIdAndIsPublicTrue(UUID teamId);

    @Query("SELECT p FROM Project p WHERE p.chat.id = :chatId")
    Optional<Project> findByChatId(@Param("chatId") UUID chatId);
}
