import axios from "axios";
import addReqToken from "@/utils/addReqToken";

const baseUrl = "http://localhost:8080/api/avatars";

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

export const deleteAvatar = async () => {
  const res = await axios.delete(
    `${baseUrl}/delete`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data;
};

export default {
  uploadAvatar,
  deleteAvatar,
}; 