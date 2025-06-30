import React, { useState, useEffect } from "react";
import ProjectService from "@/service/projectService";
import type { Project, ProjectCreationRequest } from "@/types/project";
import {
  ProjectCard,
  ProjectHeader,
  ProjectSearch,
  CreateProjectDialog,
} from "@/components/project";

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
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData: ProjectCreationRequest) => {
    try {
      await ProjectService.createProject(formData);
      fetchProjects();
    } catch (error) {
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
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