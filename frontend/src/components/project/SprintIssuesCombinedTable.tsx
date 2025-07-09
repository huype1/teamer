import React, { useState, useEffect } from "react";
import { Bug, FileText, Layers, Target, Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { ProjectMember } from "@/types/project";
import type { Issue } from "@/types/issue";
import type { Sprint } from "@/types/sprint";
import sprintService from "@/service/sprintService";
import { toastError } from "@/utils/toast";

interface SprintIssuesCombinedTableProps {
  sprint: Sprint;
  projectMembers: ProjectMember[];
  canEditIssue: (issue: Issue) => boolean;
  canChangeStatus: (issue: Issue) => boolean;
  onStatusChange: (issueId: string, newStatus: string) => void;
  onPriorityChange: (issueId: string, newPriority: string) => void;
  onIssueTypeChange: (issueId: string, newIssueType: string) => void;
  onAssigneeChange: (issueId: string, assigneeId: string) => void;


  onStartSprint: (sprintId: string) => void;
  onEndSprint: (sprintId: string) => void;
  onCancelSprint: (sprintId: string) => void;
  activeSprintId?: string;
  sprintReloadKey?: number;
  canManageSprint?: boolean;
}

export const SprintIssuesCombinedTable: React.FC<SprintIssuesCombinedTableProps> = ({
  sprint,
  projectMembers,
  canEditIssue,
  canChangeStatus,
  onStatusChange,
  onPriorityChange,
  onIssueTypeChange,
  onAssigneeChange,
  onStartSprint,
  onEndSprint,
  onCancelSprint,
  activeSprintId,
  sprintReloadKey,
  canManageSprint,
}) => {
  console.log('SprintIssuesCombinedTable props', {
    canEditIssue,
    canChangeStatus,
    onStartSprint,
    onCancelSprint,
    activeSprintId,
    sprint,
    sprintReloadKey,
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchSprintIssues();
  }, [sprint.id, sprintReloadKey]);

  const mapIssue = (issue: Record<string, unknown>): Issue => {
    return {
      ...issue,
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
    } as Issue;
  };

  const fetchSprintIssues = async () => {
    try {
      setLoading(true);
      const response = await sprintService.getIssuesBySprint(sprint.id);
      const mappedIssues = (response.result || []).map(mapIssue);
      setIssues(mappedIssues);
    } catch (error) {
      toastError("Không thể tải issues của sprint!");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-800";
      case "P1":
        return "bg-orange-100 text-orange-800";
      case "P2":
        return "bg-yellow-100 text-yellow-800";
      case "P3":
        return "bg-green-100 text-green-800";
      case "P4":
        return "bg-blue-100 text-blue-800";
      case "P5":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "TO_DO":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "TO_DO":
        return "Cần làm";
      case "IN_PROGRESS":
        return "Đang làm";
      case "IN_REVIEW":
        return "Đang review";
      case "DONE":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  const getIssueTypeConfig = (issueType: string) => {
    switch (issueType) {
      case "EPIC":
        return {
          icon: Layers,
          color: "issue-type-epic",
          label: "Epic"
        };
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
      case "SUBTASK":
        return {
          icon: Zap,
          color: "issue-type-subtask",
          label: "Subtask"
        };
      default:
        return {
          icon: Target,
          color: "issue-type-task",
          label: "Task"
        };
    }
  };

  const handleSprintStatusChange = async (newStatus: string) => {
    if (newStatus === sprint.status) return;
    if (newStatus === "ACTIVE") await onStartSprint(sprint.id);
    else if (newStatus === "COMPLETED") await onEndSprint(sprint.id);
    else if (newStatus === "CANCELLED" && sprint.status !== "CANCELLED" && onCancelSprint) await onCancelSprint(sprint.id);
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  return (
    <Card className="mb-6 w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{sprint.name}</CardTitle>
            <Select value={sprint.status} onValueChange={handleSprintStatusChange} disabled={!canManageSprint}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING" disabled={sprint.status !== "PLANNING"}>Lập kế hoạch</SelectItem>
                <SelectItem value="ACTIVE" disabled={sprint.status !== "ACTIVE" && !!activeSprintId && activeSprintId !== sprint.id}>Đang thực hiện</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
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
          <div className="overflow-x-auto overflow-y-auto max-h-96 border rounded-lg">
            <table className="w-full min-w-full table-fixed">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b">
                  <th className="px-2 py-2 text-left text-xs font-semibold w-16">Key</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-48">Tên issue</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-20">Loại</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Trạng thái</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-16">Độ ưu tiên</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Người tạo</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-32">Người phụ trách</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-20">Ngày hết hạn</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-2 text-center text-muted-foreground">
                      Không có issue nào trong sprint này.
                    </td>
                  </tr>
                )}
                {issues.map((issue: Issue) => {
                  const typeConfig = getIssueTypeConfig(issue.issueType);
                  const TypeIcon = typeConfig.icon;
                  return (
                    <tr key={issue.id} className="border-b hover:bg-muted/50">
                      <td className="px-2 py-2 text-xs font-medium truncate">{issue.key}</td>
                      <td className="px-2 py-2">
                        <div className="max-w-full">
                          <Link 
                            to={`/issues/${issue.id}`}
                            className="font-medium hover:text-primary transition-colors block truncate text-xs"
                            title={issue.title}
                          >
                            {issue.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        {canEditIssue(issue) ? (
                          <Select 
                            value={issue.issueType} 
                            onValueChange={(value) => onIssueTypeChange(issue.id, value)}
                          >
                            <SelectTrigger className="w-16 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EPIC">Epic</SelectItem>
                              <SelectItem value="STORY">Story</SelectItem>
                              <SelectItem value="TASK">Task</SelectItem>
                              <SelectItem value="BUG">Bug</SelectItem>
                              <SelectItem value="SUBTASK">Subtask</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${typeConfig.color} flex items-center gap-1 w-fit text-xs px-1 py-0`}>
                            <TypeIcon className="h-2 w-2" />
                            {typeConfig.label}
                          </Badge>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {canChangeStatus(issue) ? (
                          <Select 
                            value={issue.status} 
                            onValueChange={(value) => onStatusChange(issue.id, value)}
                          >
                            <SelectTrigger className="w-20 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TO_DO">Cần làm</SelectItem>
                              <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                              <SelectItem value="IN_REVIEW">Đang review</SelectItem>
                              <SelectItem value="DONE">Đã hoàn thành</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${getStatusColor(issue.status)} text-xs px-1 py-0`}>
                            {getStatusLabel(issue.status)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {canEditIssue(issue) ? (
                          <Select 
                            value={issue.priority} 
                            onValueChange={(value) => onPriorityChange(issue.id, value)}
                          >
                            <SelectTrigger className="w-12 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="P0">P0</SelectItem>
                              <SelectItem value="P1">P1</SelectItem>
                              <SelectItem value="P2">P2</SelectItem>
                              <SelectItem value="P3">P3</SelectItem>
                              <SelectItem value="P4">P4</SelectItem>
                              <SelectItem value="P5">P5</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${getPriorityColor(issue.priority)} text-xs px-1 py-0`}>
                            {issue.priority}
                          </Badge>
                        )}
                      </td>
                      <td className="px-2 py-2 text-xs truncate">
                        {issue.reporter?.name || "N/A"}
                      </td>
                      <td className="px-2 py-2">
                        <Select 
                          value={issue.assignee?.id || "unassigned"} 
                          onValueChange={(value) => onAssigneeChange(issue.id, value)}
                          disabled={!canEditIssue(issue)}
                        >
                          <SelectTrigger className="w-28 h-6 text-xs">
                            <SelectValue placeholder="Chưa phân công" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Chưa phân công</SelectItem>
                            {projectMembers.map((member) => (
                              <SelectItem key={member.userId} value={member.userId}>
                                {member.user?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 