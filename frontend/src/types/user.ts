export interface ProjectMember {
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER' | 'PM' | 'VIEWER';
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
  bio?: string;
  provider: string;
  projectMembers: ProjectMember[];
  teamMembers: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequest {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  code: number;
  message: string;
  result: User;
} 