import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProjectService from "@/service/projectService";
import type { Project } from "@/types/project";
import { toastError } from "@/utils/toast";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { isCurrentUserManager } from "@/utils/projectHelpers";
import { toastSuccess } from "@/utils/toast";
import ChatModal from "@/components/project/ChatModal";
import { MessageSquare, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatId, setChatId] = useState<string>("");
  const [chatName, setChatName] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setFormData({ name: project.name, description: project.description || "" });
    }
  }, [project]);

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

  const handleOpenChat = async () => {
    if (!projectId) return;
    
    try {
      const chatResponse = await ProjectService.getProjectChat(projectId);
      setChatId(chatResponse.result.id);
      setChatName(chatResponse.result.name);
      setIsChatModalOpen(true);
    } catch (error) {
      console.error("Error fetching chat:", error);
      toastError("Không thể tải thông tin chat!");
    }
  };

  const handleUpdateProject = async () => {
    if (!project) return;
    try {
      await ProjectService.updateProject(project.id, {
        name: formData.name,
        description: formData.description,
      });
      toastSuccess("Cập nhật dự án thành công!");
      setIsEditDialogOpen(false);
      fetchProject();
    } catch (error) {
      console.error("Error updating project:", error);
      toastError("Cập nhật dự án thất bại!");
    }
  };
  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await ProjectService.deleteProject(project.id);
      toastSuccess("Xóa dự án thành công!");
      window.location.href = "/projects";
    } catch (error) {
      console.error("Error deleting project:", error);
      toastError("Xóa dự án thất bại!");
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
        title={project?.name || ""}
        showBackButton
      >
        {user && project && isCurrentUserManager(user, project.id) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              Chỉnh sửa dự án
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              Xóa dự án
            </Button>
          </div>
        )}
      </ProjectHeader>
      
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
              <Link to={`/projects/${projectId}/documents`}>
                <FileText className="w-4 h-4 mr-2" />
                Quản lý tài liệu
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/projects/${projectId}/members`}>
                Quản lý thành viên
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleOpenChat}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat dự án
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dự án</DialogTitle>
            <DialogDescription>Cập nhật thông tin dự án</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên dự án</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateProject}>
              Cập nhật dự án
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa dự án</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Xóa dự án
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Chat Modal */}
      {chatId && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          chatId={chatId}
          chatName={chatName}
        />
      )}
    </div>
  );
};

export default ProjectOverviewPage; 