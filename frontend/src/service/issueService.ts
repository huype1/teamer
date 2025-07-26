import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { Issue, CreateIssueRequest, UpdateIssueRequest } from "@/types/issue";

const baseUrl = "http://localhost:8080/api/issues";

// Get all issues by project ID
export const getIssuesByProjectId = async (projectId: string) => {
  const res = await axios.get(`${baseUrl}/project/${projectId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Get issue by ID
export const getIssueById = async (issueId: string) => {
  const res = await axios.get(`${baseUrl}/${issueId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Create new issue
export const createIssue = async (body: CreateIssueRequest): Promise<{ result: Issue }> => {
  const res = await axios.post(baseUrl, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Update issue
export const updateIssue = async (issueId: string, body: UpdateIssueRequest): Promise<{ result: Issue }> => {
  const res = await axios.put(`${baseUrl}/${issueId}`, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Update issue status
export const updateIssueStatus = async (issueId: string, status: string): Promise<{ result: Issue }> => {
  const res = await axios.put(`${baseUrl}/${issueId}/status?status=${status}`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Set assignee for issue
export const setAssignee = async (issueId: string, assigneeId: string): Promise<{ result: Issue }> => {
  const res = await axios.put(`${baseUrl}/${issueId}/assignee/${assigneeId}`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Delete issue
export const deleteIssue = async (issueId: string): Promise<{ result: void }> => {
  const res = await axios.delete(`${baseUrl}/${issueId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Get all issues by assignee ID
export const getIssuesByAssigneeId = async (userId: string): Promise<{ result: Issue[] }> => {
  const res = await axios.get(`${baseUrl}/assignee/${userId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export default {
  getIssuesByProjectId,
  getIssueById,
  createIssue,
  updateIssue,
  updateIssueStatus,
  setAssignee,
  deleteIssue,
  getIssuesByAssigneeId,
}; 