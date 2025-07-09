package com.example.backend.repository;

import com.example.backend.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {
    List<Sprint> findByProjectId(UUID projectId);
    Sprint findByProjectIdAndName(UUID projectId, String name);
    List<Sprint> findByProjectIdAndStatus(UUID projectId, String status);
} 