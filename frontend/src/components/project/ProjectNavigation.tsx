import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ListTodo, 
  Kanban, 
  BarChart3, 
  Users 
} from "lucide-react";

interface ProjectNavigationProps {
  projectId: string;
}

const ProjectNavigation: React.FC<ProjectNavigationProps> = ({ projectId }) => {
  const location = useLocation();
  
  const navigationItems = [
    {
      href: `/projects/${projectId}`,
      label: "Tổng quan",
      icon: LayoutDashboard,
    },
    {
      href: `/projects/${projectId}/issues`,
      label: "Danh sách Issues",
      icon: ListTodo,
    },
    {
      href: `/projects/${projectId}/kanban`,
      label: "Kanban",
      icon: Kanban,
    },
    {
      href: `/projects/${projectId}/reports`,
      label: "Báo cáo",
      icon: BarChart3,
    },
    {
      href: `/projects/${projectId}/members`,
      label: "Thành viên",
      icon: Users,
    },
  ];

  return (
    <div className="border-b">
      <div className="flex items-center space-x-1 p-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              asChild
              className={cn(
                "flex items-center space-x-2",
                isActive && "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
              )}
            >
              <Link to={item.href}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectNavigation; 