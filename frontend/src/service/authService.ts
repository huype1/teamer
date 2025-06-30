import axios from "axios";
import type {GoogleCredentials, LoginRequest, RegisterRequest} from "@/types/auth.ts";
import { processPendingInvitation } from "@/utils/invitation";

const baseUrl = "http://localhost:8080/api/auth";

const register = async (body: RegisterRequest) => {
    const response = await axios.post(`${baseUrl}/register`, {provider: "EMAIL_PASSWORD", ...body});
    console.log(response);
    
    // Process any pending invitation after successful registration
    if (response.data.result?.token) {
        await processPendingInvitation();
    }
    
    return response.data;
}

const login = async (body: LoginRequest) => {
  const response = await axios.post(`${baseUrl}/login`, body);
  console.log(response);
  
  // Process any pending invitation after successful login
  if (response.data.result?.token) {
      await processPendingInvitation();
  }
  
  return response.data;
};

const googleLogin = async (credentials: GoogleCredentials) => {
  const response = await axios.post(`${baseUrl}/login/google`, credentials);
  
  // Process any pending invitation after successful Google login
  if (response.data.result?.token) {
      await processPendingInvitation();
  }
  
  return response.data;
};

const logout = async () => {
    const token = localStorage.getItem("token");
    
    // Always try to call the backend logout endpoint
    try {
        const response = await axios.post(`${baseUrl}/logout`, {token});
        console.log(response.data);
        return response.data;
    } catch (error: unknown) {
        // If logout fails (e.g., 401 due to expired token), 
        // we still want to clean up the frontend state
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn("Backend logout failed, but cleaning up frontend state:", errorMessage);
        // Don't throw the error - we want to continue with frontend cleanup
        return { success: true, message: "Frontend logout completed" };
    }
}

const refreshToken = async () => {
    const response = await axios.post(`${baseUrl}/refresh-token`, {token: localStorage.getItem("token")});
    console.log(response.data)
    return response.data;
}

export default { login, googleLogin, logout, register, refreshToken };
