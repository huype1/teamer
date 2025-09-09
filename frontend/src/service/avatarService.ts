import axios from "axios";
import { config } from "@/config/env";
import addReqToken from "@/utils/addReqToken";

const baseUrl = `${config.getApiBaseUrl()}/avatars`;

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${baseUrl}/upload`,
    formData,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

export const uploadTeamAvatar = async (teamId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${baseUrl}/team/${teamId}/upload`,
    formData,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

export const uploadProjectAvatar = async (projectId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${baseUrl}/project/${projectId}/upload`,
    formData,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

export const deleteAvatar = async () => {
  const res = await axios.delete(
    `${baseUrl}/delete`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

export const deleteTeamAvatar = async (teamId: string) => {
  const res = await axios.delete(
    `${baseUrl}/team/${teamId}/delete`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

export const deleteProjectAvatar = async (projectId: string) => {
  const res = await axios.delete(
    `${baseUrl}/project/${projectId}/delete`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

export default {
  uploadAvatar,
  uploadTeamAvatar,
  uploadProjectAvatar,
  deleteAvatar,
  deleteTeamAvatar,
  deleteProjectAvatar,
}; 