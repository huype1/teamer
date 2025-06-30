export interface DashboardSummaryResponse {
  totalProjects: number;
  myProjects: number;
  totalIssues: number;
  myAssignedIssues: number;
  issuesByStatus: { [key: string]: number };
  issuesByPriority: { [key: string]: number };
  upcomingDeadlines: UpcomingDeadlineDto[];
}

export interface UpcomingDeadlineDto {
  issueId: string;
  title: string;
  dueDate: string;
}

export interface RecentActivityResponse {
  activityId: string;
  type: string;
  description: string;
  timestamp: string;
  relatedEntityId: string;
  relatedEntityType: string;
}
