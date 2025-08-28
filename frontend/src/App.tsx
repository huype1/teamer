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

import ProjectOverviewPage from "@/pages/ProjectOverviewPage";
import ProjectIssuesTablePage from "@/pages/ProjectIssuesTablePage";
import ProjectKanbanPage from "@/pages/ProjectKanbanPage";
import ProjectReportsPage from "@/pages/ProjectReportsPage";
import ProjectMembersPage from "@/pages/ProjectMembersPage";
import ProjectDocumentsPage from "@/pages/ProjectDocumentsPage";
import ProjectTimelinePage from "@/pages/ProjectTimelinePage";
import UserDetailPage from "@/pages/UserDetailPage";
import DashboardPage from "@/pages/DashboardPage";
import LandingPage from "@/pages/LandingPage.tsx";
import DocumentEditorPage from "@/pages/DocumentEditorPage";
import { isTokenExpired } from "@/utils/jwt";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Layout } from "@/components/layout";
import NotFoundPage from "./pages/NotFoundPage";
import TeamDetailPage from "@/pages/TeamDetailPage";
import { Toaster } from "sonner"
import IssueDetailPage from "@/pages/IssueDetailPage";
import SearchPage from "@/pages/SearchPage";
import { WebSocketProvider } from "@/components/WebSocketProvider";

const useAppDispatch: () => AppDispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token && isTokenExpired(token)) {
      dispatch(logout());
      return;
    }

    if (isAuthenticated && token && !isTokenExpired(token)) {
      dispatch(fetchUserInfo());
    }

    // Check for pending invitation token
    const pendingInvitationToken = localStorage.getItem("pendingInvitationToken");
    if (isAuthenticated && pendingInvitationToken) {
      window.location.href = "/invitation/accept_invitation";
      return;
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
      <WebSocketProvider>
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
          path='/search'
          element={
            <ProtectedRoute>
              <Layout>
                <SearchPage />
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
          path='/teams/:teamId'
          element={
            <ProtectedRoute>
              <Layout>
                <TeamDetailPage />
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
                <ProjectOverviewPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:projectId/issues'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectIssuesTablePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:projectId/kanban'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectKanbanPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:projectId/reports'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:projectId/timeline'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectTimelinePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:projectId/members'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectMembersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:projectId/documents'
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDocumentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Layout>
                <UserDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/issues/:issueId" element={<IssueDetailPage />} />
        <Route
          path="/documents/:documentId/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentEditorPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
        </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
