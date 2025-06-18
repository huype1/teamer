import addReqToken from "@/utils/addReqToken";
import axios from "axios";
const baseUrl = "http://localhost:8080/api/auth";



const getMyInfo = async () => {
  const result = await axios.get(
    `${baseUrl}/me`,
    addReqToken(localStorage.getItem("token")),
  );
  return result.data;
};



export default { getMyInfo };
