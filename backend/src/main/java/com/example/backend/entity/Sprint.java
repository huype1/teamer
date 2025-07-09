package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sprints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "project_id")
    Project project;

    @Column(nullable = false, length = 100)
    String name = "backlog";

    @Column(columnDefinition = "TEXT")
    String goal;

    @Column(name = "start_date")
    OffsetDateTime startDate;

    @Column(name = "end_date")
    OffsetDateTime endDate;

    @Column(nullable = false, length = 20)    //"PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"
    String status = "PLANNING";

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "created_by")
    User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;
}

