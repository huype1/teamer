import AuthService from "@/service/authService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {GoogleCredentials, LoginRequest} from "@/types/auth.ts";
import UserService from "@/service/userService";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
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
    } catch (error: any) {
      console.error("Login error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
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
    } catch (error: any) {
      console.error("Google login error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Google login failed"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export const fetchUserInfo = createAsyncThunk(
  "auth/fetchUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getMyInfo();
      return response.result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user info"
      );
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