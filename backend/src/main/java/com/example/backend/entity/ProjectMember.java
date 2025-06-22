package com.example.backend.entity;

import lombok.*;

import jakarta.persistence.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_members")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ProjectMemberId.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectMember {
    @Id
    @Column(name = "project_id")
    UUID projectId;
    
    @Id
    @Column(name = "user_id")
    UUID userId;

    @Column(name = "role")
    String role; // ADMIN, PM, MEMBER, VIEWER

    @Column(name = "joined_at")
    OffsetDateTime joinedAt;
    
    @ManyToOne
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    Project project;
    
    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    User user;
}

