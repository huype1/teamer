export interface Team {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamCreationRequest {
  name: string;
  description: string;
}

export interface TeamUpdateRequest {
  name?: string;
  description?: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
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