import React, { useState, useEffect } from "react";
import ProjectService from "@/service/projectService";
import type { Project, ProjectCreationRequest } from "@/types/project";
import {
  ProjectCard,
  ProjectHeader,
  ProjectSearch,
  CreateProjectDialog,
} from "@/components/project";
import { toastSuccess, toastError } from "@/utils/toast";

const ProjectManagementPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await ProjectService.getProjects();
      setProjects(response.result || []);
    } catch (error) {
      toastError("Tải danh sách dự án thất bại!");
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData: ProjectCreationRequest) => {
    try {
      await ProjectService.createProject(formData);
      toastSuccess("Tạo dự án thành công!");
      fetchProjects();
    } catch (error) {
      toastError("Tạo dự án thất bại!");
      console.error("Error creating project:", error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <ProjectHeader>
        <CreateProjectDialog onSubmit={handleCreateProject} />
      </ProjectHeader>

      {/* Search and Filters */}
      <ProjectSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectManagementPage; 