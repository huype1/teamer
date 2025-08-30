import axios from "axios";
import { config } from "@/config/env";
import addReqToken from "@/utils/addReqToken";

const baseUrl = `${config.getApiBaseUrl()}/comments`;

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface AttachmentMeta {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
}

export interface CommentCreationRequest {
  issueId: string;
  userId: string;
  content: string;
  attachments?: AttachmentMeta[];
}

// Get comments by issue ID
export const getCommentsByIssueId = async (issueId: string) => {
  const res = await axios.get(`${baseUrl}/${issueId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Create new comment
export const createComment = async (commentData: CommentCreationRequest) => {
  const res = await axios.post(baseUrl, commentData, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Delete comment
export const deleteComment = async (commentId: string) => {
  const res = await axios.delete(`${baseUrl}/${commentId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export default {
  getCommentsByIssueId,
  createComment,
  deleteComment,
}; 