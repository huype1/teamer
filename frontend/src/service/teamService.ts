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

export const getTeamsWhereUserIsAdmin = async () => {
  const res = await axios.get(`${baseUrl}/admin`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

export default { 
  getTeams,
  getTeamById,
  createTeam, 
  updateTeam, 
  deleteTeam, 
  getTeamMembers,
  getTeamsWhereUserIsAdmin
};
