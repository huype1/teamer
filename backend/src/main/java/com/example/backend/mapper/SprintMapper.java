package com.example.backend.mapper;

import com.example.backend.dto.response.SprintResponse;
import com.example.backend.entity.Sprint;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SprintMapper {

    public SprintResponse toResponse(Sprint sprint) {
        if (sprint == null) {
            return null;
        }

        return SprintResponse.builder()
                .id(sprint.getId())
                .projectId(sprint.getProject() != null ? sprint.getProject().getId() : null)
                .projectName(sprint.getProject() != null ? sprint.getProject().getName() : null)
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .createdById(sprint.getCreatedBy() != null ? sprint.getCreatedBy().getId() : null)
                .createdByName(sprint.getCreatedBy() != null ? sprint.getCreatedBy().getName() : null)
                .createdAt(sprint.getCreatedAt())
                .updatedAt(sprint.getUpdatedAt())
                .build();
    }

    public List<SprintResponse> toResponseList(List<Sprint> sprints) {
        if (sprints == null) {
            return List.of();
        }
        return sprints.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
} 