export interface ProjectMember {
  projectId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  projectMembers: ProjectMember[];
  teamMembers: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequest {
  email: string;
  name: string;
  password?: string;
  avatarUrl?: string;
}

export interface UserResponse {
  code: number;
  message: string;
  result: User;
} 