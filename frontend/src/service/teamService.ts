import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { TeamCreationRequest, TeamUpdateRequest } from "@/types/team";

const baseUrl = "http://localhost:8080/api/teams";

export const getTeams = async (name: string) => {
  const res = await axios.get(`${baseUrl}?name=${name}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getTeamById = async (id: string) => {
  const res = await axios.get(`${baseUrl}/${id}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const createTeam = async (body: TeamCreationRequest) => {
  const res = await axios.post(baseUrl, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const updateTeam = async (id: string, body: TeamUpdateRequest) => {
  const res = await axios.put(`${baseUrl}/${id}`, body, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const deleteTeam = async (id: string) => {
  const res = await axios.delete(`${baseUrl}/${id}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getTeamMembers = async (teamId: string) => {
  const res = await axios.get(`${baseUrl}/${teamId}/members`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getTeamUsers = async (teamId: string) => {
  const res = await axios.get(`${baseUrl}/${teamId}/users`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const getTeamsWhereUserIsAdmin = async () => {
  const res = await axios.get(`${baseUrl}/admin`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const inviteMember = async (teamId: string, email: string, role: string) => {
  const res = await axios.post(`${baseUrl}/${teamId}/invite`, {
    email,
    role
  }, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const updateMemberRole = async (teamId: string, userId: string, role: string) => {
  const res = await axios.put(`${baseUrl}/${teamId}/members`, null, {
    ...addReqToken(localStorage.getItem("token")),
    params: { userId, role }
  });
  return res.data;
};

export const removeMember = async (teamId: string, userId: string) => {
  const res = await axios.delete(`${baseUrl}/${teamId}/members/${userId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export const addMemberToTeam = async (teamId: string, userId: string, role: string) => {
  const res = await axios.post(`${baseUrl}/${teamId}/members`, null, {
    ...addReqToken(localStorage.getItem("token")),
    params: { userId, role }
  });
  return res.data;
};

export default { 
  getTeams,
  getTeamById,
  createTeam, 
  updateTeam, 
  deleteTeam, 
  getTeamMembers,
  getTeamUsers,
  getTeamsWhereUserIsAdmin,
  inviteMember,
  updateMemberRole,
  removeMember,
  addMemberToTeam
};
