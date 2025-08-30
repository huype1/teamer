import axios from "axios";
import { config } from "@/config/env";
import type { GoogleCredentials, LoginRequest, RegisterRequest } from "@/types/auth";
import { processPendingInvitation } from "@/utils/invitation";

const baseUrl = `${config.getApiBaseUrl()}/auth`;

const register = async (body: RegisterRequest) => {
    const response = await axios.post(`${baseUrl}/register`, {provider: "EMAIL_PASSWORD", ...body});
    
    if (response.data.result?.token) {
        await processPendingInvitation();
    }
    
    return response.data;
}

const login = async (body: LoginRequest) => {
  const response = await axios.post(`${baseUrl}/login`, body);
  
  if (response.data.result?.token) {
      await processPendingInvitation();
  }
  
  return response.data;
};

const googleLogin = async (credentials: GoogleCredentials) => {
  const response = await axios.post(`${baseUrl}/login/google`, credentials);
  
  if (response.data.result?.token) {
      await processPendingInvitation();
  }
  
  return response.data;
};

const logout = async () => {
    const token = localStorage.getItem("token");
    
    try {
        const response = await axios.post(`${baseUrl}/logout`, {token});
        return response.data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn("Backend logout failed, but cleaning up frontend state:", errorMessage);
        return { success: true, message: "Frontend logout completed" };
    }
}

const refreshToken = async () => {
    const response = await axios.post(`${baseUrl}/refresh-token`, {token: localStorage.getItem("token")});
    return response.data;
}

export default { login, googleLogin, logout, register, refreshToken };
