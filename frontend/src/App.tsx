import "./App.css";
import { LoginForm } from "@/components/login-form.tsx";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RedirectPage from "./pages/RedirectPage";
import TeamManagementPage from "./pages/TeamManagementPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/team" element={<TeamManagementPage />} />
        <Route path="/oauth2/idpresponse" element={<RedirectPage />} />
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
