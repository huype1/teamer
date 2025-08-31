import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { Issue } from "@/types/issue";

const baseUrl = "http://localhost:8080/api/search";

export const searchIssues = async (keyword: string): Promise<Issue[]> => {
  const res = await axios.get(
    `${baseUrl}/issues?keyword=${encodeURIComponent(keyword)}`,
    addReqToken(localStorage.getItem("token"))
  );
  return res.data.result;
};

export default {
  searchIssues,
};
