package com.example.backend.repository;

import com.example.backend.entity.Team;
import com.example.backend.entity.TeamMember;
import com.example.backend.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMemberId> {
    
    // Essential queries for team member operations
    List<TeamMember> findByTeamId(UUID teamId);
    

    Optional<TeamMember> findByTeamIdAndUserId(UUID teamId, UUID userId);
    
    boolean existsByTeamIdAndUserId(UUID teamId, UUID userId);
    
    long countByTeamId(UUID teamId);

    @Query("SELECT tm FROM TeamMember tm WHERE tm.teamId = :teamId AND tm.role = 'ADMIN'")
    List<TeamMember> findAdminsByTeamId(@Param("teamId") UUID teamId);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.userId = :userId AND tm.role = :role")
    List<TeamMember> findByUserIdAndRole(@Param("userId") UUID userId, @Param("role") String role);
    
    void deleteByTeamIdAndUserId(UUID teamId, UUID userId);
}
