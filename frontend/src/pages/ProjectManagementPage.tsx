import React, { useState, useEffect } from "react";
import ProjectService from "@/service/projectService";
import type { Project, ProjectCreationRequest, ProjectUpdateRequest } from "@/types/project";
import {
  ProjectCard,
  ProjectHeader,
  ProjectSearch,
} from "@/components/project";
import ProjectDialog from "@/components/project/ProjectDialog";
import { toastSuccess, toastError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ProjectManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

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
      const response = await ProjectService.createProject(formData);
      toastSuccess("Tạo dự án thành công!");
      fetchProjects();
      return response; // Return response để ProjectDialog có thể sử dụng
    } catch (error) {
      toastError("Tạo dự án thất bại!");
      console.error("Error creating project:", error);
      throw error; // Re-throw để ProjectDialog có thể handle
    }
  };

  const handleEditProject = async (formData: ProjectUpdateRequest) => {
    if (!editingProject) return;
    
    try {
      await ProjectService.updateProject(editingProject.id, formData);
      toastSuccess("Cập nhật dự án thành công!");
      fetchProjects();
      setEditingProject(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      toastError("Cập nhật dự án thất bại!");
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await ProjectService.deleteProject(projectToDelete.id);
      toastSuccess("Xóa dự án thành công!");
      fetchProjects();
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      toastError("Xóa dự án thất bại!");
      console.error("Error deleting project:", error);
    }
  };

  const handleManageMembers = (project: Project) => {
    navigate(`/projects/${project.id}/members`);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <ProjectHeader>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo dự án
        </Button>
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
            onEdit={() => handleEditClick(project)}
            onDelete={() => handleDeleteClick(project)}
            onManageMembers={() => handleManageMembers(project)}
          />
        ))}
      </div>

      {/* Create Project Dialog */}
      <ProjectDialog
        mode="create"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
      />

      {/* Edit Project Dialog */}
      <ProjectDialog
        mode="edit"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={editingProject}
        onSubmit={handleEditProject}
      />

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa dự án</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dự án "{projectToDelete?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Xóa dự án
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagementPage; 