import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import { toastError, toastSuccess } from "@/utils/toast";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { User } from '@/types/user';
import { canInviteMembers } from "@/utils/projectHelpers";
import MemberManagement from "@/components/project/MemberManagement";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const ProjectMembersPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchProjectMembers();
      fetchProjectUsers();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      console.log("project", response.result);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
      toastError("Không thể tải thông tin dự án!");
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await ProjectService.getProjectMembers(projectId!);
      setProjectMembers(response.result || []);
    } catch (error) {
      console.error("Error fetching project members:", error);
      toastError("Không thể tải danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectUsers = async () => {
    try {
      const response = await ProjectService.getProjectUsers(projectId!);
      setProjectUsers(response.result || []);
    } catch (error) {
      console.error("Error fetching project users:", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "PM":
        return "bg-blue-100 text-blue-800";
      case "MEMBER":
        return "bg-green-100 text-green-800";
      case "VIEWER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "PM":
        return "Quản lý dự án";
      case "MEMBER":
        return "Thành viên";
      case "VIEWER":
        return "Người xem";
      default:
        return role;
    }
  };

  const handleAddMember = async (email: string, role: string) => {
    try {
      await ProjectService.inviteToProject({
        email,
        projectId: projectId!,
        role,
      });
      toastSuccess("Đã gửi lời mời thành công!");
      setIsMemberManagementOpen(false);
    } catch (error) {
      toastError("Gửi lời mời thất bại!");
      console.error("Error inviting member:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await ProjectService.removeProjectMember(projectId!, userId);
      toastSuccess("Đã xóa thành viên thành công!");
      fetchProjectMembers();
    } catch (error) {
      toastError("Xóa thành viên thất bại!");
      console.error("Error removing member:", error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await ProjectService.updateMemberRole(projectId!, userId, newRole);
      toastSuccess("Cập nhật quyền thành công!");
      fetchProjectMembers();
    } catch (error) {
      toastError("Cập nhật quyền thất bại!");
      console.error("Error updating member role:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Button asChild className="mt-4">
            <Link to="/projects">Quay lại danh sách dự án</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        title={`${project?.name || ""} - Thành viên`}
        showBackButton
      />
      
      <ProjectNavigation projectId={projectId!} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin dự án</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Tên dự án:</span> {project.name}</p>
            <p><span className="font-medium">Người tạo:</span> {project.creator.name}</p>
            <p><span className="font-medium">Tổng thành viên:</span> {projectMembers.length}</p>
            <p><span className="font-medium">Ngày tạo:</span> {new Date(project.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê vai trò</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Quản trị viên:</span>
              <Badge variant="secondary">
                {projectMembers.filter(m => m.role === "ADMIN").length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Quản lý dự án:</span>
              <Badge variant="secondary">
                {projectMembers.filter(m => m.role === "PM").length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Thành viên:</span>
              <Badge variant="secondary">
                {projectMembers.filter(m => m.role === "MEMBER").length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Người xem:</span>
              <Badge variant="secondary">
                {projectMembers.filter(m => m.role === "VIEWER").length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {canInviteMembers(user, projectId!) && (
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setIsMemberManagementOpen(true)}
              >
                Quản lý thành viên
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thành viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có thành viên nào trong dự án
              </div>
            ) : (
              projectMembers.map((member) => {
                const user = projectUsers.find(u => u.id === member.userId);
                return (
                  <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback>
                          {user?.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                      {member.userId === project.creator.id && (
                        <Badge variant="outline">Người tạo</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

        <MemberManagement
          project={project}
          projectMembers={projectMembers}
          projectUsers={projectUsers}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onUpdateRole={handleUpdateRole}
          isOpen={isMemberManagementOpen}
          onOpenChange={setIsMemberManagementOpen}
        />
    </div>
  );
};

export default ProjectMembersPage; 