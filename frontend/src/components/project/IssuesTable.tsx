import React from "react";
import { Edit, Trash2, Bug, FileText, Layers, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { ProjectMember } from "@/types/project";
import type { Issue } from "@/types/issue";

interface IssuesTableProps {
  issues: Issue[];
  projectMembers: ProjectMember[];
  onStatusChange: (issueId: string, newStatus: string) => void;
  onPriorityChange: (issueId: string, newPriority: string) => void;
  onIssueTypeChange: (issueId: string, newIssueType: string) => void;
  onAssigneeChange: (issueId: string, assigneeId: string) => void;
  canEditIssue: (issue: Issue) => boolean;
  canChangeStatus: (issue: Issue) => boolean;
  onDeleteIssue: (issueId: string) => void;
  onOpenCreateIssue?: () => void;
  canCreateIssue?: boolean;
}

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  projectMembers,
  onStatusChange,
  onPriorityChange,
  onIssueTypeChange,
  onAssigneeChange,
  canEditIssue,
  canChangeStatus,
  onDeleteIssue,
  onOpenCreateIssue,
  canCreateIssue,
}) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách issue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-semibold">Key</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Tên issue</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Loại</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Độ ưu tiên</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Người tạo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Người phụ trách</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Ngày hết hạn</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-2 text-center text-muted-foreground">Không có issue</td>
                </tr>
              )}
              {issues.map((issue: Issue) => {
                const typeConfig = getIssueTypeConfig(issue.issueType);
                const TypeIcon = typeConfig.icon;
                return (
                  <tr key={issue.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2 text-sm font-medium">{issue.key}</td>
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">
                          <Link 
                            to={`/issues/${issue.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {issue.title}
                          </Link>
                        </div>
                        {issue.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {issue.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {canEditIssue(issue) ? (
                        <Select 
                          value={issue.issueType} 
                          onValueChange={(value) => onIssueTypeChange(issue.id, value)}
                        >
                          <SelectTrigger className="w-32">
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
                        <Badge className={`${typeConfig.color} flex items-center gap-1 w-fit`}>
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig.label}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {canChangeStatus(issue) ? (
                        <Select 
                          value={issue.status} 
                          onValueChange={(value) => onStatusChange(issue.id, value)}
                        >
                          <SelectTrigger className="w-32">
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
                        <Badge className={getStatusColor(issue.status)}>
                          {getStatusLabel(issue.status)}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {canEditIssue(issue) ? (
                        <Select 
                          value={issue.priority} 
                          onValueChange={(value) => onPriorityChange(issue.id, value)}
                        >
                          <SelectTrigger className="w-24">
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
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {issue.reporter?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <Select 
                        value={issue.assignee?.id || "unassigned"} 
                        onValueChange={(value) => onAssigneeChange(issue.id, value)}
                        disabled={!canEditIssue(issue)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Chưa phân công" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Chưa phân công</SelectItem>
                          {projectMembers.map((member) => (
                            <SelectItem key={member.user.id} value={member.user.id}>
                              {member.user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {canEditIssue(issue) && (
                          <Button variant="destructive" size="icon" onClick={() => onDeleteIssue(issue.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {canCreateIssue && onOpenCreateIssue && (
                <tr>
                  <td colSpan={9} className="p-2 text-center">
                    <Button variant="outline" onClick={onOpenCreateIssue}>
                      + Tạo Issue mới
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}; 