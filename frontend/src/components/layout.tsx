import { useState } from "react";
import type { ReactNode } from "react";
import { TopNav } from "@/components/nav/top-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { logout } from "@/store/authReducer";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";
// import { WebSocketStatus } from "@/components/WebSocketStatus";

const useAppDispatch: () => AppDispatch = useDispatch;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleNotifications = () => {
    console.log("Notifications clicked");
  };

  const handleCreate = () => {
    console.log("Create clicked");
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        variant="full"
        onSearch={handleSearch}
        onSettings={handleSettings}
        onNotifications={handleNotifications}
        onCreate={handleCreate}
        onLogout={handleLogout}
      />
      <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="flex h-[calc(100vh-3.5rem)] w-full">
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 overflow-auto p-4">
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="mb-4"
                >
                  <PanelLeftOpen className="h-5 w-5" />
                </Button>
              )}
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      {/* <WebSocketStatus /> */}
    </div>
  );
} 