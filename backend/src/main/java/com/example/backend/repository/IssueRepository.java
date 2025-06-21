package com.example.backend.repository;

import com.example.backend.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface IssueRepository extends JpaRepository<Issue, UUID>{
    @Query("SELECT i FROM Issue i WHERE i.project.id = :projectId ORDER BY i.key DESC")
    List<Issue> findIssuesByProjectOrderByKeyDesc(@Param("projectId") UUID projectId);
}
