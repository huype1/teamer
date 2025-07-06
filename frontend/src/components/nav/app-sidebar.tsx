import * as React from "react";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  User,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav/nav-main";
import { NavProjects } from "@/components/nav/nav-projects";
// import { NavUser } from "@/components/nav-user" // No longer used
import { TeamSwitcher } from "@/components/nav/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  // SidebarSeparator, // No longer used
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // This is sample data for navigation and projects
  const data = {
    navMain: [
      {
        title: "Bảng điều khiển",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: window.location.pathname === "/dashboard",
      },
      {
        title: "Nhóm",
        url: "/teams",
        icon: Users,
        isActive:
          window.location.pathname === "/teams" ||
          window.location.pathname === "/team",
      },
      {
        title: "Dự án",
        url: "/projects",
        icon: FolderOpen,
        isActive: window.location.pathname === "/projects",
      },
      {
        title: "Người dùng",
        url: "/users",
        icon: User,
        isActive: window.location.pathname === "/users",
      },
      {
        title: "Cài đặt",
        url: "/settings",
        icon: Settings2,
        isActive: window.location.pathname === "/settings",
      },
    ],
    projects: [

    ],
  };

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='mt-14'></SidebarHeader>
      <SidebarContent>
        <TeamSwitcher />

        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarTrigger />
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
