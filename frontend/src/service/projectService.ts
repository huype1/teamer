import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { ProjectCreationRequest, ProjectUpdateRequest } from "@/types/project";

const baseUrl = "http://localhost:8080/api/projects";

export const getProjects = async () => {
  const res = await axios.get(baseUrl, addReqToken(localStorage.getItem("token")));
  console.log(res)
  return res.data;
};

export const getProjectsByUserId = async (userId: string) => {
  const res = await axios.get(`${baseUrl}/user/${userId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getProjectById = async (id: string) => {
  const res = await axios.get(`${baseUrl}/${id}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const createProject = async (body: ProjectCreationRequest) => {
  const res = await axios.post(baseUrl, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const updateProject = async (id: string, body: ProjectUpdateRequest) => {
  const res = await axios.put(`${baseUrl}/${id}`, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const deleteProject = async (id: string) => {
  const res = await axios.delete(`${baseUrl}/${id}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Member management methods
export const inviteToProject = async (body: { email: string; projectId: string; role: string }) => {
  const res = await axios.post(`${baseUrl}/invite`, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getProjectMembers = async (projectId: string) => {
  const res = await axios.get(`${baseUrl}/${projectId}/members`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const removeProjectMember = async (projectId: string, userId: string) => {
  const res = await axios.delete(`${baseUrl}/${projectId}/members/${userId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const updateMemberRole = async (projectId: string, userId: string, newRole: string) => {
  const res = await axios.put(`${baseUrl}/${projectId}/members/${userId}/role?newRole=${newRole}`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const acceptProjectInvitation = async (token: string) => {
  const res = await axios.get(`${baseUrl}/accept_invitation?token=${token}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getProjectsByTeam = async (teamId: string) => {
  const res = await axios.get(`${baseUrl}/team/${teamId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getProjectUsers = async (projectId: string) => {
    const res = await axios.get(
        `${baseUrl}/${projectId}/users`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export const getProjectChat = async (projectId: string) => {
    const res = await axios.get(
        `${baseUrl}/${projectId}/chat`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export default { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  inviteToProject,
  getProjectMembers,
  removeProjectMember,
  updateMemberRole,
  acceptProjectInvitation,
  getProjectsByTeam,
  getProjectUsers,
  getProjectChat
}; 