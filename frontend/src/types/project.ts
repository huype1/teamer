export interface Project {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  key: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  teamId: string;
  chatId: string;
  creator: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
  members: ProjectMember[];
  memberCount: number;
}

export interface ProjectCreationRequest {
  name: string;
  description: string;
  key: string;
  teamId: string;
  avatarUrl: string;
  isPublic: boolean;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER' | 'PM';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ProjectResponse {
  code: number;
  message: string;
  result: Project;
}

export interface ProjectsResponse {
  code: number;
  message: string;
  result: Project[];
} 