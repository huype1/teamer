import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { CreateSprintRequest, UpdateSprintRequest } from "@/types/sprint";

const baseUrl = "http://localhost:8080/api/sprints";

export const getSprintsByProject = async (projectId: string) => {
  try {
    const res = await axios.get(`${baseUrl}/project/${projectId}`, addReqToken(localStorage.getItem("token")));
    console.log("Sprints fetched:", res.data); // Debug log
    return res.data;
  } catch (error) {
    console.error("Error fetching sprints:", error);
    throw error; // Re-throw to handle in the calling function
  }
};

export const getIssuesBySprint = async (sprintId: string) => {
  const res = await axios.get(`${baseUrl}/${sprintId}/issues`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getBacklogIssues = async (projectId: string) => {
  const res = await axios.get(`${baseUrl}/project/${projectId}/issues/backlog`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getActiveSprintIssues = async (projectId: string) => {
  const res = await axios.get(`${baseUrl}/project/${projectId}/issues/active`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getUpcomingSprintIssues = async (projectId: string) => {
  const res = await axios.get(`${baseUrl}/project/${projectId}/issues/upcoming`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const createSprint = async (sprint: CreateSprintRequest) => {
  const res = await axios.post(baseUrl, sprint, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const updateSprint = async (sprintId: string, sprint: UpdateSprintRequest) => {
  const res = await axios.put(`${baseUrl}/${sprintId}`, sprint, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const deleteSprint = async (sprintId: string) => {
  const res = await axios.delete(`${baseUrl}/${sprintId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const startSprint = async (sprintId: string) => {
  const res = await axios.post(`${baseUrl}/${sprintId}/start`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const endSprint = async (sprintId: string) => {
  const res = await axios.post(`${baseUrl}/${sprintId}/end`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

const cancelSprint = async (sprintId: string) => {
  const res = await axios.post(`${baseUrl}/${sprintId}/cancel`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export default {
  getSprintsByProject,
  getIssuesBySprint,
  getBacklogIssues,
  getActiveSprintIssues,
  getUpcomingSprintIssues,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  endSprint,
  cancelSprint
};
