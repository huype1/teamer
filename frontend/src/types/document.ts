import type { User } from "./user";

export interface Document {
  id: string;
  title: string;
  content?: string; // JSON string of Quill content
  creator: User;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListItem {
  id: string;
  title: string;
  creator: User;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCreationRequest {
  title: string;
  content?: string;
  projectId: string;
}

export interface DocumentUpdateRequest {
  title?: string;
  content?: string;
}

export interface DocumentResponse {
  message: string;
  result: Document;
}

export interface DocumentListResponse {
  message: string;
  result: DocumentListItem[];
}