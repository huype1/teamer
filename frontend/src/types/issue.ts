export interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "P0" | "P1" | "P2" | "P3" | "P4" | "P5";
  issueType: "EPIC" | "STORY" | "TASK" | "BUG" | "SUBTASK";
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  startDate?: string;
  dueDate?: string;
  storyPoints?: number;
  sprintId?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export interface CreateIssueRequest {
  title: string;
  description?: string;
  priority: string;
  issueType: string;
  projectId: string;
  assigneeId?: string;
  sprintId?: string;
  parentId?: string;
  startDate?: string;
  dueDate?: string;
  storyPoints?: number;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  priority?: string;
  issueType?: string;
  assigneeId?: string;
  sprintId?: string;
  parentId?: string;
  startDate?: string;
  dueDate?: string;
  storyPoints?: number;
} 