export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  code: number;
  message: string;
  result: User;
}

export interface UsersResponse {
  code: number;
  message: string;
  result: User[];
} 