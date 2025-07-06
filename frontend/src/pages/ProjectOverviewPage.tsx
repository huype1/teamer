import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProjectService from "@/service/projectService";
import type { Project } from "@/types/project";
import { toastError } from "@/utils/toast";
import { ProjectHeader, ProjectNavigation } from "@/components/project";

const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
      toastError("Không thể tải thông tin dự án!");
    } finally {
      setLoading(false);
    }
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
        title={project?.name || ""}
        showBackButton
      />
      
      <ProjectNavigation projectId={projectId!} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Thông tin dự án</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Tên:</span> {project.name}</p>
            <p><span className="font-medium">Mô tả:</span> {project.description || "Không có mô tả"}</p>
            <p><span className="font-medium">Key:</span> {project.key}</p>
            <p><span className="font-medium">Ngày tạo:</span> {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Tổng thành viên:</span> {project.members?.length || 0}</p>
            <p><span className="font-medium">Key:</span> {project.key}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Hành động nhanh</h3>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to={`/projects/${projectId}/issues`}>
                Xem danh sách issues
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/projects/${projectId}/kanban`}>
                Xem Kanban
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/projects/${projectId}/members`}>
                Quản lý thành viên
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewPage; 