import React, { useState, useEffect } from "react";
import { Calendar, FileText, Target, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { ProjectMember } from "@/types/project";
import type { Issue } from "@/types/issue";
import type { Sprint } from "@/types/sprint";
import sprintService from "@/service/sprintService";
import { toastError } from "@/utils/toast";
import { IssuesTable } from "./IssuesTable";

interface SprintIssuesCombinedTableProps {
  sprint: Sprint;
  projectMembers: ProjectMember[];
  sprints: Sprint[];
  canEditIssue: (issue: Issue) => boolean;
  canChangeStatus: (issue: Issue) => boolean;
  onStatusChange: (issueId: string, newStatus: string) => void;
  onPriorityChange: (issueId: string, newPriority: string) => void;
  onIssueTypeChange: (issueId: string, newIssueType: string) => void;
  onAssigneeChange: (issueId: string, assigneeId: string) => void;
  onSprintChange: (issueId: string, sprintId: string) => void;
  onStartSprint: (sprintId: string) => void;
  onEndSprint: (sprintId: string) => void;
  onCancelSprint: (sprintId: string) => void;
  activeSprintId?: string;
  sprintReloadKey?: number;
  canManageSprint?: boolean;
  onOpenCreateIssue?: () => void;
  canCreateIssue?: boolean;
  onEditIssue?: (issue: Issue) => void;
  onDeleteIssue?: (issue: Issue) => void;
}

export const SprintIssuesCombinedTable: React.FC<SprintIssuesCombinedTableProps> = ({
  sprint,
  projectMembers,
  sprints,
  canEditIssue,
  canChangeStatus,
  onStatusChange,
  onPriorityChange,
  onIssueTypeChange,
  onAssigneeChange,
  onSprintChange,
  onStartSprint,
  onEndSprint,
  onCancelSprint,
  activeSprintId,
  sprintReloadKey,
  canManageSprint,
  onOpenCreateIssue,
  canCreateIssue,
  onEditIssue,
  onDeleteIssue,
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchSprintIssues();
  }, [sprint.id, sprintReloadKey]);

  const mapIssue = (issue: any): Issue => {
    return {
      ...issue,
      sprintId: issue.sprintId ? String(issue.sprintId) : undefined,
      reporter: issue.reporterId ? {
        id: String(issue.reporterId),
        name: String(issue.reporterName),
        email: String(issue.reporterEmail),
      } : undefined,
      assignee: issue.assigneeId ? {
        id: String(issue.assigneeId),
        name: String(issue.assigneeName),
        email: String(issue.assigneeEmail),
      } : undefined,
    };
  };

  const fetchSprintIssues = async () => {
    try {
      setLoading(true);
      const response = await sprintService.getIssuesBySprint(sprint.id);
      const mappedIssues = (response.result || []).map(mapIssue);
      setIssues(mappedIssues);
    } catch {
      toastError("Không thể tải issues của sprint!");
    } finally {
      setLoading(false);
    }
  };

  const handleSprintStatusChange = async (newStatus: string) => {
    if (newStatus === sprint.status) return;
    
    try {
      if (sprint.status === "PLANNING") {
        if (newStatus === "ACTIVE") {
          await onStartSprint(sprint.id);
        } else if (newStatus === "CANCELLED") {
          await onCancelSprint(sprint.id);
        }
      } else if (sprint.status === "ACTIVE") {
        if (newStatus === "COMPLETED") {
          await onEndSprint(sprint.id);
        }
        else if (newStatus === "CANCELLED") {
          await onCancelSprint(sprint.id);
        }
      } else if (sprint.status === "CANCELLED") {
        if (newStatus === "PLANNING") {
          await onStartSprint(sprint.id);
        }
      }
    } catch (error) {
      console.error("Error changing sprint status:", error);
    }
  };

  const getSprintStatusLabel = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "Lập kế hoạch";
      case "ACTIVE":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getIssueTypeConfig = (issueType: string) => {
    switch (issueType) {
      case "STORY":
        return {
          icon: FileText,
          color: "issue-type-story",
          label: "Story"
        };
      case "TASK":
        return {
          icon: Target,
          color: "issue-type-task",
          label: "Task"
        };
      case "BUG":
        return {
          icon: Bug,
          color: "issue-type-bug",
          label: "Bug"
        };
      default:
        return {
          icon: Target,
          color: "issue-type-task",
          label: "Task"
        };
    }
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{sprint.name}</CardTitle>
            <Select value={sprint.status} onValueChange={handleSprintStatusChange} disabled={!canManageSprint}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={getSprintStatusLabel(sprint.status)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING" disabled={sprint.status !== "PLANNING" && sprint.status !== "CANCELLED"}>
                  Lập kế hoạch
                </SelectItem>
                <SelectItem value="ACTIVE" disabled={sprint.status !== "PLANNING"}>
                  Đang thực hiện
                </SelectItem>
                <SelectItem value="COMPLETED" disabled={sprint.status !== "ACTIVE"}>
                  Hoàn thành
                </SelectItem>
                <SelectItem value="CANCELLED" disabled={sprint.status !== "PLANNING"}>
                  Đã hủy
                </SelectItem>
              </SelectContent>
            </Select>
            {sprint.goal && (
              <span className="text-sm text-muted-foreground">- {sprint.goal}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sprint.startDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(sprint.startDate).toLocaleDateString()}
              </span>
            )}
            {sprint.endDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(sprint.endDate).toLocaleDateString()}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Thu gọn" : "Mở rộng"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <IssuesTable
            issues={issues}
            projectMembers={projectMembers}
            sprints={sprints}
            canEditIssue={canEditIssue}
            canChangeStatus={canChangeStatus}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onIssueTypeChange={onIssueTypeChange}
            onAssigneeChange={onAssigneeChange}
            onSprintChange={onSprintChange}
            onOpenCreateIssue={onOpenCreateIssue}
            canCreateIssue={canCreateIssue}
            onEditIssue={onEditIssue}
            onDeleteIssue={onDeleteIssue}
            title=""
            emptyMessage="Không có issue nào trong sprint này."
            containerClassName="border-0 shadow-none"
          />
        </CardContent>
      )}
    </Card>
  );
}; 