import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { LoginForm } from "./pages/LoginForm";
import { RegisterForm } from "./pages/RegisterForm";
import InvitationAcceptPage from "./pages/InvitationAcceptPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { fetchUserInfo, logout } from "@/store/authReducer";
import TeamManagementPage from "@/pages/TeamManagementPage";
import ProjectManagementPage from "@/pages/ProjectManagementPage";
import ProjectDetail from "@/pages/ProjectDetail";
import UserManagementPage from "@/pages/UserManagementPage";
import DashboardPage from "@/pages/DashboardPage";
import LandingPage from "@/pages/LandingPage.tsx";
import { isTokenExpired } from "@/utils/jwt";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Layout } from "@/components/layout";
import NotFoundPage from "./pages/NotFoundPage";

const useAppDispatch: () => AppDispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check for token expiration immediately
    if (isAuthenticated && token && isTokenExpired(token)) {
      dispatch(logout());
      return;
    }

    // If authenticated and token is valid, fetch user info
    if (isAuthenticated && token && !isTokenExpired(token)) {
      dispatch(fetchUserInfo());
    }

    const interval = setInterval(() => {
      if (isAuthenticated && token && isTokenExpired(token)) {
        dispatch(logout());
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated, token]);

  return (
    <ThemeProvider>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='/register' element={<RegisterForm />} />
        <Route
          path='/invitation/accept_invitation'
          element={<InvitationAcceptPage />}
        />

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/teams'
          element={
            <ProtectedRoute>
              <Layout>
                <TeamManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:projectId'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/users'
          element={
            <ProtectedRoute>
              <Layout>
                <UserManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
