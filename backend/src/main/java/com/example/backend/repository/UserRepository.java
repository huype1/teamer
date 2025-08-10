package com.example.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);
    
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.teamMemberships tm " +
           "LEFT JOIN FETCH tm.team " +
           "WHERE u.email = :email")
    Optional<User> findByEmailWithTeamMemberships(@Param("email") String email);
    
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.projectMembers pm " +
           "LEFT JOIN FETCH pm.project " +
           "WHERE u.email = :email")
    Optional<User> findByEmailWithProjectMembers(@Param("email") String email);
    
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.teamMemberships tm " +
           "LEFT JOIN FETCH tm.team " +
           "WHERE u.id = :id")
    Optional<User> findByIdWithTeamMemberships(@Param("id") UUID id);
    
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.projectMembers pm " +
           "LEFT JOIN FETCH pm.project " +
           "WHERE u.id = :id")
    Optional<User> findByIdWithProjectMembers(@Param("id") UUID id);
    
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}
