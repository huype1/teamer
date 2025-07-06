package com.example.backend.repository;

import com.example.backend.entity.Issue;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IssueRepository extends JpaRepository<Issue, UUID>{
    @Query("SELECT i FROM Issue i WHERE i.project.id = :projectId ORDER BY i.key DESC")
    List<Issue> findIssuesByProjectOrderByKeyDesc(@Param("projectId") UUID projectId);

    Optional<List<Issue>> findByProjectId(UUID projectId);

    @Query("SELECT i FROM Issue i LEFT JOIN FETCH i.assignee LEFT JOIN FETCH i.reporter WHERE i.project.id = :projectId")
    List<Issue> findByProjectIdWithAssigneeAndReporter(@Param("projectId") UUID projectId);

    List<Issue> findByAssigneeId(UUID userId);

    List<Issue> findByAssigneeIdAndDueDateIsNotNullOrderByDueDateAsc(UUID userId);

    List<Issue> findTop10ByOrderByCreatedAtDesc();
    
    List<Issue> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT MAX(CAST(SUBSTRING(i.key FROM POSITION('-' IN i.key) + 1) AS integer)) FROM Issue i WHERE i.project.id = :projectId AND i.key LIKE :projectKey || '-%'")
    Optional<Integer> findMaxIssueNumberByProject(@Param("projectId") UUID projectId, @Param("projectKey") String projectKey);
}
