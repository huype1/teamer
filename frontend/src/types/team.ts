export interface TeamMember {
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TeamUser {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TeamCreationRequest {
  name: string;
  description: string;
  avatarUrl?: string;
}

export interface TeamUpdateRequest {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export interface TeamMembersResponse {
  code: number;
  message: string;
  result: TeamMember[];
}

export interface TeamResponse {
  code: number;
  message: string;
  result: Team;
}

export interface TeamsResponse {
  code: number;
  message: string;
  result: Team[];
} 