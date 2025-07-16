import axios from "axios";

const baseUrl = "http://localhost:8080/api/attachments";

export const getByCommentId = async (commentId: string) => {
  const res = await axios.get(`${baseUrl}/comment/${commentId}`);
  return res.data;
};

export default {
  getByCommentId,
}; 