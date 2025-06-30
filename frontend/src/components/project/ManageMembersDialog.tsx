import React from "react";
import type { Project } from "@/types/project";
import MemberManagement from "./MemberManagement";

interface ManageMembersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onAddMember: (email: string, role: string) => void;
  onRemoveMember: (userId: string) => void;
}

const ManageMembersDialog: React.FC<ManageMembersDialogProps> = ({
  isOpen,
  onOpenChange,
  project,
  onAddMember,
  onRemoveMember,
}) => {
  if (!project) return null;

  return (
    <MemberManagement
      project={project}
      onAddMember={onAddMember}
      onRemoveMember={onRemoveMember}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  );
};

export default ManageMembersDialog; 