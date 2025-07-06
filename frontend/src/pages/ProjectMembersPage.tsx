import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import { toastError } from "@/utils/toast";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

const ProjectMembersPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchProjectMembers();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
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

  const canManageMembers = () => {
    if (!user || !project) return false;
    return (
      project.creator.id === user.id ||
      project.members.some(m => m.user.id === user.id && (m.role === "ADMIN" || m.role === "PM"))
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
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

        {canManageMembers() && (
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Mời thành viên mới
              </Button>
              <Button className="w-full" variant="outline">
                Quản lý vai trò
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
              projectMembers.map((member) => (
                <div key={member.user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.user.avatarUrl} />
                      <AvatarFallback>
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-sm text-muted-foreground">{member.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(member.role)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                    {member.user.id === project.creator.id && (
                      <Badge variant="outline">Người tạo</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectMembersPage; 