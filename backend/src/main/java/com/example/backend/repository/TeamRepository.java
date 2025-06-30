package com.example.backend.repository;

import com.example.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    Team findByName(String name);

    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.userId = :userId")
    List<Team> findTeamsByUserId(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT t FROM Team t LEFT JOIN t.members tm " +
            "WHERE (tm.userId = :userId OR t.createdBy.id = :userId) " +
            "AND (t.name LIKE %:keywords%) ")
    List<Team> findByNameContainingIgnoreCase(@Param("keywords") String keywords, @Param("userId") UUID userId);

    @Query("SELECT DISTINCT t FROM Team t LEFT JOIN t.members tm " +
            "WHERE (tm.userId = :userId OR t.createdBy.id = :userId)")
    List<Team> findAllTeamsByUserId(@Param("userId") UUID userId);

}
