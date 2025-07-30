import AuthService from "@/service/authService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {GoogleCredentials, LoginRequest} from "@/types/auth.ts";
import UserService from "@/service/userService";
import type { User } from "@/types/user";
import notificationWebSocketService from "@/service/notificationWebSocketService";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
  loading: !!localStorage.getItem("token"),
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
};

export const login = createAsyncThunk(
  "auth/login",
  async (body: LoginRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await AuthService.login(body);
      // Fetch user info immediately after successful login
      await dispatch(fetchUserInfo());
      return response.result;
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credentials: GoogleCredentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await AuthService.googleLogin(credentials);
      // Fetch user info immediately after successful Google login
      await dispatch(fetchUserInfo());
      return response.result;
    } catch (error: unknown) {
      console.error("Google login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Google login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    try {
      await AuthService.logout();
      return true;
    } catch (error: unknown) {
      // Even if backend logout fails, we should still clean up frontend state
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn("Backend logout failed, but proceeding with frontend cleanup:", errorMessage);
      return true; // Don't reject - we want to clean up regardless
    }
  }
);

export const fetchUserInfo = createAsyncThunk(
  "auth/fetchUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getMyInfo();
      console.log("fetchUserInfo - Response from backend:", response);
      return response.result;
    } catch (error: unknown) {
      console.error("fetchUserInfo - Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch user info";
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload) {
          localStorage.setItem("token", action.payload.token);
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        if (action.payload) {
          localStorage.setItem("token", action.payload.token);
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
        state.loading = false;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        localStorage.removeItem("token");
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        
        // Disconnect notification WebSocket on logout
        notificationWebSocketService.disconnect();
        
        // Force navigation to login page
        window.location.href = "/login";
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Don't remove token or auth state on fetchUserInfo failure
      });
  },
});

export default authSlice.reducer;