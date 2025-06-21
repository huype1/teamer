import React, {useEffect} from 'react';
import { Routes, Route } from "react-router-dom";
import {LoginForm} from "./pages/LoginForm";
import {RegisterForm} from "./pages/RegisterForm";
import {useDispatch, useSelector} from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {fetchUserInfo, logout} from "@/store/authReducer";
import TeamManagementPage from "@/pages/TeamManagementPage";
import LandingPage from "@/pages/LandingPage.tsx";
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import { isTokenExpired } from "@/utils/jwt";

const useAppDispatch: () => AppDispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function App() {
    const dispatch = useAppDispatch();
    const {isAuthenticated, user, token} = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && token && isTokenExpired(token)) {
            dispatch(logout());
        } else if (isAuthenticated) {
            dispatch(fetchUserInfo());
        }
    }, [dispatch, isAuthenticated, token]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/team" element={<TeamManagementPage />} />
          <Route path="/register" element={<RegisterForm />} />
      </Routes>
      {isAuthenticated ? (
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      ) : null}
    </div>
  );
}

export default App;