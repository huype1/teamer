package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_members")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TeamMemberId.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TeamMember {
    @Id
    @Column(name = "team_id")
    UUID teamId;
    
    @Id
    @Column(name = "user_id")
    UUID userId;

    @Column(name = "role", nullable = false)
    String role; // ADMIN, MEMBER

    @CreationTimestamp
    @Column(name = "joined_at")
    OffsetDateTime joinedAt;
    
    @ManyToOne
    @JoinColumn(name = "team_id", insertable = false, updatable = false)
    Team team;
    
    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    User user;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
class TeamMemberId implements Serializable {
    UUID teamId;
    UUID userId;
} 