package com.example.backend.repository;

import com.example.backend.entity.Team;
import com.example.backend.entity.TeamMember;
import com.example.backend.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
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

    @Query("SELECT tm FROM TeamMember tm " +
           "LEFT JOIN FETCH tm.team " +
           "WHERE tm.userId = :userId")
    List<TeamMember> findByUserIdWithTeam(@Param("userId") UUID userId);
    
    // Tối ưu query chỉ select những field cần thiết
    @Query("SELECT tm.teamId, tm.userId, tm.role, tm.joinedAt FROM TeamMember tm " +
           "WHERE tm.userId = :userId")
    List<Object[]> findMinimalByUserId(@Param("userId") UUID userId);
    
    // Query để lấy team members với thông tin user đầy đủ
    @Query("SELECT tm FROM TeamMember tm " +
           "LEFT JOIN FETCH tm.user " +
           "WHERE tm.teamId = :teamId")
    List<TeamMember> findByTeamIdWithUser(@Param("teamId") UUID teamId);
}
