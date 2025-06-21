package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "issues")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true)
    String key;

    @Column(nullable = false)
    String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    String description;

    @Column(nullable = false) // P0, P1, P2, P3, P4, P5
    String priority="P5";

    @Column(nullable = false) // TO_DO, IN_PROGRESS, IN_REVIEW , DONE
    String status="TO_DO";

    @Column(name = "issue_type", nullable = false) // SUBTASK, BUG, TASK, STORY, EPIC
    String issueType="TASK";

    @Column(name = "start_date")
    LocalDate startDate;

    @Column(name = "due_date")
    LocalDate dueDate;

    @Column(name="story_points")
    Integer storyPoints;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    User reporter;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    User assignee;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "project_id")
    Project project;

    //Handling parent-child relationship for subtasks and epics
    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Issue parent;

    @JsonIgnore
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Issue> subtasks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Comment> comments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;
}

