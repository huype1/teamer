import issueService from "@/service/issueService";
import type { Issue } from "@/types/issue";
import { toastSuccess, toastError } from "@/utils/toast";

/**
 * Helper function to handle assignee changes for issues
 * Uses the same pattern as ProjectIssuesTablePage for consistency
 */
export const handleAssigneeChange = async (
  issueId: string, 
  assigneeId: string,
  onSuccess?: () => void
) => {
  try {
    if (assigneeId === "unassigned") {
      await issueService.unassignIssue(issueId);
    } else {
      await issueService.setAssignee(issueId, assigneeId);
    }
    toastSuccess("Cập nhật người phụ trách thành công!");
    onSuccess?.();
  } catch (error) {
    console.error("Error updating assignee:", error);
    toastError("Cập nhật người phụ trách thất bại!");
  }
};

/**
 * Helper function to handle status changes for issues
 */
export const handleStatusChange = async (
  issueId: string,
  newStatus: string,
  onSuccess?: () => void
) => {
  try {
    await issueService.updateIssueStatus(issueId, newStatus);
    toastSuccess("Cập nhật trạng thái thành công!");
    onSuccess?.();
  } catch (error) {
    console.error("Error updating status:", error);
    toastError("Cập nhật trạng thái thất bại!");
  }
};

/**
 * Helper function to handle priority changes for issues
 */
export const handlePriorityChange = async (
  issueId: string,
  newPriority: string,
  onSuccess?: () => void
) => {
  try {
    await issueService.updateIssue(issueId, { priority: newPriority });
    toastSuccess("Cập nhật độ ưu tiên thành công!");
    onSuccess?.();
  } catch (error) {
    console.error("Error updating priority:", error);
    toastError("Cập nhật độ ưu tiên thất bại!");
  }
};

/**
 * Helper function to handle issue type changes
 */
export const handleIssueTypeChange = async (
  issueId: string,
  newIssueType: string,
  onSuccess?: () => void
) => {
  try {
    await issueService.updateIssue(issueId, { issueType: newIssueType });
    toastSuccess("Cập nhật loại issue thành công!");
    onSuccess?.();
  } catch (error) {
    console.error("Error updating issue type:", error);
    toastError("Cập nhật loại issue thất bại!");
  }
};

/**
 * Helper function to handle sprint changes for issues
 */
export const handleSprintChange = async (
  issueId: string,
  sprintId: string,
  onSuccess?: () => void
) => {
  try {
    if (sprintId === "backlog") {
      await issueService.updateIssue(issueId, { sprintId: null as unknown as string });
    } else {
      await issueService.updateIssue(issueId, { sprintId });
    }
    toastSuccess("Cập nhật sprint thành công!");
    onSuccess?.();
  } catch (error) {
    console.error("Error updating sprint:", error);
    toastError("Cập nhật sprint thất bại!");
  }
};

/**
 * Maps raw API issue data to frontend Issue type
 * Filters out EPIC and SUBTASK types for backlog display
 */
export const mapIssue = (issue: Record<string, unknown>): Issue | null => {
  // Filter out EPIC and SUBTASK for backlog display
  if (issue.issueType === "EPIC" || issue.issueType === "SUBTASK") {
    return null;
  }
  
  return {
    ...(issue as unknown as Issue),
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

/**
 * Maps raw API issue data to frontend Issue type (includes all types)
 * Used for detailed views where we need all issue types
 */
export const mapIssueAllTypes = (issue: Record<string, unknown>): Issue => {
  return {
    ...(issue as unknown as Issue),
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
