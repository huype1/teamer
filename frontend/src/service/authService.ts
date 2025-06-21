import axios from "axios";
import type {GoogleCredentials, LoginRequest, RegisterRequest} from "@/types/auth.ts";
const baseUrl = "http://localhost:8080/api/auth";

const register = async (body: RegisterRequest) => {
    const response = await axios.post(`${baseUrl}/register`, {provider: "EMAIL_PASSWORD", ...body});
    console.log(response)
    return response.data;
}

const login = async (body: LoginRequest) => {
  const response = await axios.post(`${baseUrl}/login`, body);
  console.log(response)
  return response.data;
};

const googleLogin = async (credentials: GoogleCredentials) => {
  const response = await axios.post(`${baseUrl}/login/google`, credentials);
  return response.data;
};

const logout = async () => {
    const response = await axios.post(`${baseUrl}/logout`, {token: localStorage.getItem("token")});
    console.log(response.data)
    return response.data;
}

const refreshToken = async () => {
    const response = await axios.post(`${baseUrl}/refresh-token`, {token: localStorage.getItem("token")});
    console.log(response.data)
    return response.data;
}

export default { login, googleLogin, logout, register, refreshToken };
