import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  BarChart3,
  Users,
  FileText
} from "lucide-react";

interface ProjectNavigationProps {
  projectId: string;
  activeTab?: string;
}

const navigationItems = [
  {
    key: "overview",
    href: (id: string) => `/projects/${id}`,
    label: "Tổng quan",
    icon: LayoutDashboard,
    match: (pathname: string, id: string) => pathname === `/projects/${id}`
  },
  {
    key: "issues",
    href: (id: string) => `/projects/${id}/issues`,
    label: "Danh sách Issues",
    icon: ListTodo,
    match: (pathname: string, id: string) => pathname === `/projects/${id}/issues`
  },
  {
    key: "kanban",
    href: (id: string) => `/projects/${id}/kanban`,
    label: "Kanban",
    icon: Kanban,
    match: (pathname: string, id: string) => pathname === `/projects/${id}/kanban`
  },
  {
    key: "documents",
    href: (id: string) => `/projects/${id}/documents`,
    label: "Tài liệu",
    icon: FileText,
    match: (pathname: string, id: string) => pathname === `/projects/${id}/documents`
  },
  {
    key: "reports",
    href: (id: string) => `/projects/${id}/reports`,
    label: "Báo cáo",
    icon: BarChart3,
    match: (pathname: string, id: string) => pathname === `/projects/${id}/reports`
  },
  {
    key: "members",
    href: (id: string) => `/projects/${id}/members`,
    label: "Thành viên",
    icon: Users,
    match: (pathname: string, id: string) => pathname === `/projects/${id}/members`
  },
];

const ProjectNavigation: React.FC<ProjectNavigationProps> = ({ projectId, activeTab: propActiveTab }) => {
  const location = useLocation();
  // Xác định tab active dựa vào prop hoặc pathname
  const activeTab = propActiveTab || 
    navigationItems.find(item => item.match(location.pathname, projectId))?.key || "overview";

  return (
    <div className="border-b bg-background">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${navigationItems.length}, 1fr)` }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.key} value={item.key} asChild>
                <Link to={item.href(projectId)} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProjectNavigation; 