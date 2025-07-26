import React from "react";
import { Bug, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { ProjectMember } from "@/types/project";
import type { Issue } from "@/types/issue";
import type { Sprint } from "@/types/sprint";

interface IssuesTableProps {
  issues: Issue[];
  allIssues?: Issue[];
  projectMembers: ProjectMember[];
  sprints?: Sprint[];
  onStatusChange: (issueId: string, newStatus: string) => void;
  onPriorityChange: (issueId: string, newPriority: string) => void;
  onIssueTypeChange: (issueId: string, newIssueType: string) => void;
  onAssigneeChange: (issueId: string, assigneeId: string) => void;
  onSprintChange?: (issueId: string, sprintId: string) => void;
  canEditIssue: (issue: Issue) => boolean;
  canChangeStatus: (issue: Issue) => boolean;
  onOpenCreateIssue?: () => void;
  canCreateIssue?: boolean;
  onEditIssue?: (issue: Issue) => void;
  onDeleteIssue?: (issue: Issue) => void;
  title?: string;
  emptyMessage?: string;
  containerClassName?: string;
}

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  allIssues,
  projectMembers,
  sprints,
  onStatusChange,
  onPriorityChange,
  onIssueTypeChange,
  onAssigneeChange,
  onSprintChange,
  canEditIssue = () => false,
  canChangeStatus,
  onOpenCreateIssue,
  canCreateIssue,
  onEditIssue,
  onDeleteIssue,
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

  // Helper to get Epic title
  const getEpicTitle = (issue: Issue) => {
    if (!issue.parentId || !allIssues) return null;
    const parent = allIssues.find(i => i.id === issue.parentId && i.issueType === "EPIC");
    return parent ? parent.title : null;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
        <table className="w-full" style={{ minWidth: '1300px' }}>
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b">
                  <th className="px-2 py-2 text-left text-xs font-semibold w-16">Key</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-48">Tên issue</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Loại</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Epic</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Trạng thái</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-20">Độ ưu tiên</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Người tạo</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-32">Người phụ trách</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Sprint</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-24">Ngày bắt đầu</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-20">Ngày hết hạn</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-16">SP</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 && (
                  <tr>
                    <td colSpan={13} className="p-2 text-center text-muted-foreground">Không có issue</td>
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
                              <SelectItem value="STORY">Story</SelectItem>
                              <SelectItem value="TASK">Task</SelectItem>
                              <SelectItem value="BUG">Bug</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${typeConfig.color} flex items-center gap-1 w-fit text-xs px-1 py-0`}>
                            <TypeIcon className="h-2 w-2" />
                            {typeConfig.label}
                          </Badge>
                        )}
                      </td>
                      <td className="px-2 py-2 text-xs truncate">
                        {getEpicTitle(issue) || "-"}
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
                            <SelectTrigger className="w-20 h-6 text-xs">
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
                            <SelectValue placeholder="Chưa giao" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Chưa giao</SelectItem>
                            {projectMembers?.map((member) => (
                              <SelectItem key={member.userId} value={member.userId}>
                                {member.user?.name || 'Unknown User'}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        {canEditIssue(issue) && sprints && onSprintChange ? (
                          <Select
                            value={issue.sprintId || "backlog"}
                            onValueChange={v => onSprintChange(issue.id, v)}
                          >
                            <SelectTrigger className="w-20 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="backlog">Backlog</SelectItem>
                              {sprints.map(sprint => (
                                <SelectItem key={sprint.id} value={sprint.id}>
                                  {sprint.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs truncate">
                            {sprints && issue.sprintId
                              ? (sprints.find(s => s.id === issue.sprintId)?.name || issue.sprintId)
                              : "Backlog"}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {issue.startDate ? new Date(issue.startDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {issue.storyPoints || "-"}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          {onEditIssue && (
                            <Button size="icon" variant="outline" onClick={() => onEditIssue(issue)} title="Chỉnh sửa issue" className="h-6 w-6">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 0 0 .707-.293l9.414-9.414a2 2 0 0 0 0-2.828l-3.172-3.172a2 2 0 0 0-2.828 0l-9.414 9.414A1 1 0 0 0 4 20z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </Button>
                          )}
                          {onDeleteIssue && (
                            <Button size="icon" variant="destructive" onClick={() => onDeleteIssue(issue)} title="Xóa issue" className="h-6 w-6">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {canCreateIssue && onOpenCreateIssue && (
                  <tr>
                    <td colSpan={12} className="p-2 text-center">
                      <Button variant="outline" onClick={onOpenCreateIssue} size="sm">
                        + Tạo Issue mới
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
  );
};
