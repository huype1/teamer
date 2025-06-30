import * as React from "react"
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  User,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav/nav-main"
import { NavProjects } from "@/components/nav/nav-projects"
// import { NavUser } from "@/components/nav-user" // No longer used
import { TeamSwitcher } from "@/components/nav/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  // SidebarSeparator, // No longer used
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // This is sample data for navigation and projects
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: window.location.pathname === "/dashboard",
      },
      {
        title: "Teams",
        url: "/teams",
        icon: Users,
        isActive: window.location.pathname === "/teams" || window.location.pathname === "/team",
      },
      {
        title: "Projects",
        url: "/projects",
        icon: FolderOpen,
        isActive: window.location.pathname === "/projects",
      },
      {
        title: "Users",
        url: "/users",
        icon: User,
        isActive: window.location.pathname === "/users",
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        isActive: window.location.pathname === "/settings",
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        url: "/projects/1",
        icon: FolderOpen,
      },
      {
        name: "Mobile App",
        url: "/projects/2",
        icon: FolderOpen,
      },
      {
        name: "Website Redesign",
        url: "/projects/3",
        icon: FolderOpen,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader className="mt-14">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarTrigger />
      <SidebarFooter>
        {/* User info and actions moved to TopNav for better visibility and UX. */}
        {/* <NavUser /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
