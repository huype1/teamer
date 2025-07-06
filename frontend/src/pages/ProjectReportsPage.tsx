import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProjectService from "@/service/projectService";
import issueService from "@/service/issueService";
import type { Project } from "@/types/project";
import type { Issue } from "@/types/issue";
import { toastError } from "@/utils/toast";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mapIssue = (issue: unknown): Issue => {
  const i = issue as Record<string, unknown>;
  return {
    ...i,
    issueType: (i.issueType as string) || "TASK",
    reporter: i.reporterId
      ? {
          id: i.reporterId as string,
          name: i.reporterName as string,
          email: i.reporterEmail as string,
        }
      : null,
    assignee: i.assigneeId
      ? {
          id: i.assigneeId as string,
          name: i.assigneeName as string,
          email: i.assigneeEmail as string,
        }
      : null,
  } as Issue;
};

const ProjectReportsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchIssues();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
      toastError("Không thể tải thông tin dự án!");
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await issueService.getIssuesByProjectId(projectId!);
      setIssues(response.result.map(mapIssue));
    } catch (error) {
      console.error("Error fetching issues:", error);
      toastError("Không thể tải danh sách issues!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      TO_DO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    
    issues.forEach(issue => {
      if (Object.prototype.hasOwnProperty.call(stats, issue.status)) {
        stats[issue.status as keyof typeof stats]++;
      }
    });
    
    return stats;
  };

  const getPriorityStats = () => {
    const stats = {
      P0: 0,
      P1: 0,
      P2: 0,
      P3: 0,
      P4: 0,
      P5: 0,
    };
    
    issues.forEach(issue => {
      if (Object.prototype.hasOwnProperty.call(stats, issue.priority)) {
        stats[issue.priority as keyof typeof stats]++;
      }
    });
    
    return stats;
  };

  const getIssueTypeStats = () => {
    const stats = {
      EPIC: 0,
      STORY: 0,
      TASK: 0,
      BUG: 0,
      SUBTASK: 0,
    };
    
    issues.forEach(issue => {
      if (Object.prototype.hasOwnProperty.call(stats, issue.issueType)) {
        stats[issue.issueType as keyof typeof stats]++;
      }
    });
    
    return stats;
  };

  const getCompletionRate = () => {
    if (issues.length === 0) return 0;
    const completedIssues = issues.filter(issue => issue.status === "DONE").length;
    return Math.round((completedIssues / issues.length) * 100);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Button asChild className="mt-4">
            <Link to="/projects">Quay lại danh sách dự án</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const priorityStats = getPriorityStats();
  const issueTypeStats = getIssueTypeStats();
  const completionRate = getCompletionRate();

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        title={`${project?.name || ""} - Báo cáo`}
        showBackButton
      />
      
      <ProjectNavigation projectId={projectId!} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues đã hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.DONE}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.IN_PROGRESS}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Cần làm</span>
              <Badge variant="secondary">{statusStats.TO_DO}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Đang làm</span>
              <Badge variant="secondary">{statusStats.IN_PROGRESS}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Đang review</span>
              <Badge variant="secondary">{statusStats.IN_REVIEW}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Đã hoàn thành</span>
              <Badge variant="secondary">{statusStats.DONE}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo loại issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Epic</span>
              <Badge variant="secondary">{issueTypeStats.EPIC}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Story</span>
              <Badge variant="secondary">{issueTypeStats.STORY}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Task</span>
              <Badge variant="secondary">{issueTypeStats.TASK}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Bug</span>
              <Badge variant="secondary">{issueTypeStats.BUG}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtask</span>
              <Badge variant="secondary">{issueTypeStats.SUBTASK}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo độ ưu tiên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{priorityStats.P0}</div>
              <div className="text-sm text-muted-foreground">P0</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{priorityStats.P1}</div>
              <div className="text-sm text-muted-foreground">P1</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{priorityStats.P2}</div>
              <div className="text-sm text-muted-foreground">P2</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{priorityStats.P3}</div>
              <div className="text-sm text-muted-foreground">P3</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{priorityStats.P4}</div>
              <div className="text-sm text-muted-foreground">P4</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{priorityStats.P5}</div>
              <div className="text-sm text-muted-foreground">P5</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReportsPage; 