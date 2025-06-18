import AuthService from "@/service/authService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
};

// Convert login to an async thunk to properly handle async operation
export const login = createAsyncThunk(
  "auth/login",
  async (code: string | null, { rejectWithValue }) => {
    try {
      if (!code) {
        return rejectWithValue("No authorization code provided");
      }
      const response = await AuthService.login(code);
      return response.result; // Assuming your API returns { result: { token, user } }
    } catch (error: any) {
      console.error("Login error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    removeCurrUser: (state) => {
      localStorage.removeItem("token");
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    addCurrUser: (state, action) => {
      localStorage.setItem("token", action.payload.token);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
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
          state.loading = false;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { removeCurrUser, addCurrUser } = authSlice.actions;

export const logout = () => {
  return (dispatch) => {
    dispatch(removeCurrUser());
  };
};

export default authSlice.reducer;
