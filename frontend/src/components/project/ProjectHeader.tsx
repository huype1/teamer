import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectCreationRequest } from "@/types/project";

interface ProjectHeaderProps {
  title?: string;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title = "Projects",
  showBackButton = false,
  children
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {showBackButton ? "Project details and management" : "Manage your projects and collaborate with your team"}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </div>
  );
};

export default ProjectHeader; 