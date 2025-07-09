import React from "react";
import { MoreHorizontal, Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/types/project";

interface ProjectActionsProps {
  project?: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onManageMembers?: (project: Project) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  canEdit?: boolean;
  canDelete?: boolean;
  canManageMembers?: boolean;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  project,
  onEdit,
  onDelete,
  onManageMembers,
  variant = "outline",
  size = "icon",
  canEdit = true,
  canDelete = true,
  canManageMembers = true
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && project && canEdit && (
          <DropdownMenuItem onClick={() => onEdit(project)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa dự án
          </DropdownMenuItem>
        )}
        {onManageMembers && project && canManageMembers && (
          <DropdownMenuItem onClick={() => onManageMembers(project)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Quản lý thành viên
          </DropdownMenuItem>
        )}
        {onDelete && project && canDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(project.id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa dự án
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectActions; 