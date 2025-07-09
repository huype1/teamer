export interface Sprint {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  goal?: string;
  status: "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SprintResponse {
  code: number;
  message: string;
  result: Sprint;
}

export interface SprintsResponse {
  code: number;
  message: string;
  result: Sprint[];
}

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  projectId: string;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
} 