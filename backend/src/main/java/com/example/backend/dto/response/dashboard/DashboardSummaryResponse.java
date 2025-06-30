package com.example.backend.dto.response.dashboard;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardSummaryResponse {
    long totalProjects;
    long myProjects;
    long totalIssues;
    long myAssignedIssues;
    Map<String, Long> issuesByStatus;
    Map<String, Long> issuesByPriority;
    List<UpcomingDeadlineDto> upcomingDeadlines;

    @Data
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UpcomingDeadlineDto {
        UUID issueId;
        String title;
        LocalDate dueDate;
    }
}
