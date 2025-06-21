package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "invitations")
public class Invitation  {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String email;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    Project project;

    @Column(name = "expiration_date")
    LocalDate expirationDate = LocalDate.now().plusDays(7);

    @ManyToOne
    @JoinColumn(name = "invited_by", nullable = false)
    User invitedBy;

    String status; // PENDING, ACCEPTED, REJECTED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;
}
