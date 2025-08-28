package com.example.backend.entity;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "users")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true)
    String email;

    @Column(nullable = true)
    String password;

    @Column(nullable = false)
    String name;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    String bio;

    @Column(nullable = false)
    String provider;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "assignee", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    List<Issue> assignedIssues = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "reporter", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    List<Issue> reportedIssues = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    List<Project> createdProjects = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    List<Comment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    List<Team> createdTeams = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    List<TeamMember> teamMemberships = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    List<ProjectMember> projectMembers = new ArrayList<>();
}
