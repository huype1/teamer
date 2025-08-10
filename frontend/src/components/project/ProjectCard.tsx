import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Project } from "@/types/project";
import ProjectActions from "./ProjectActions";
import { getCurrentUserRole } from "@/utils/projectHelpers";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onManageMembers?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onManageMembers }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const canEdit = user  ? getCurrentUserRole(user, project.id, project.teamId) === "ADMIN" : undefined;
  const canDelete = user ? getCurrentUserRole(user, project.id, project.teamId) === "ADMIN": undefined;
  const canManageMembers = user ? getCurrentUserRole(user, project.id, project.teamId) === "ADMIN": undefined;
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow group cursor-pointer relative h-full overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <ProjectActions
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageMembers={onManageMembers}
          canEdit={canEdit}
          canDelete={canDelete}
          canManageMembers={canManageMembers}
        />
      </div>
      <Link to={`/projects/${project.id}`} className="block h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">
                  {project.key}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-md group-hover:text-primary transition-colors truncate">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-sm truncate">
                  {project.key} • {formatDate(project.createdAt)}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description || "Không có mô tả"}
          </p>
          
          
            <Badge variant={project.isPublic ? "default" : "secondary"}>
              {project.isPublic ? "Công khai" : "Riêng tư"}
            </Badge>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={project.creator.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(project.creator.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {project.creator.name}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
              <span>{formatDate(project.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProjectCard; 