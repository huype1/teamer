import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import { ProjectHeader, ProjectActions, MemberManagement, ProjectTabs, type ProjectTab } from "@/components/project";
import { toastSuccess, toastError } from "@/utils/toast";

import issueService from "@/service/issueService";
import type { Issue } from "@/types/issue";

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchIssues();
      fetchProjectMembers();
    }
  }, [projectId]);

  useEffect(() => {
    // Sync with URL params
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'issues', 'members', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
      setFormData({
        name: response.result.name,
        description: response.result.description,
      });
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await issueService.getIssuesByProjectId(projectId!);
      setIssues(response.result);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await ProjectService.getProjectMembers(projectId!);
      setProjectMembers(response.result || []);
    } catch (error) {
      console.error("Error fetching project members:", error);
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
      await fetchProject();
    } catch (error) {
      toastError("Cập nhật dự án thất bại!");
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await ProjectService.deleteProject(project.id);
      toastSuccess("Xóa dự án thành công!");
      // Redirect to projects page
      window.location.href = "/projects";
    } catch (error) {
      toastError("Xóa dự án thất bại!");
      console.error("Error deleting project:", error);
    }
  };

  const handleAddMember = async (email: string, role: string) => {
    if (!project) return;
    try {
      await ProjectService.inviteToProject({
        email,
        projectId: project.id,
        role,
      });
      setIsMemberDialogOpen(false);
      await fetchProject();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!project) return;
    try {
      await ProjectService.removeProjectMember(project.id, userId);
      await fetchProject();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };



  const handleTabChange = (key: string) => {
    if (key === 'list') {
      navigate(`/projects/${projectId}/issues`);
    }
    setActiveTab(key);
  };

  const getIssueStats = () => {
    const total = issues.length;
    const done = issues.filter(issue => issue.status === "DONE").length;
    const notDone = total - done;
    return { total, done, notDone };
  };

  const tabs: ProjectTab[] = [
    { key: "overview", label: "Tổng quan" },
    { key: "list", label: "Danh sách Issues" },
    { key: "kanban", label: "Kanban Board" },
    { key: "reports", label: "Báo cáo" },
    { key: "members", label: "Thành viên" },
    { key: "settings", label: "Cài đặt" },
  ];

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
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const issueStats = getIssueStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <ProjectHeader 
        title={project?.name || ""}
        showBackButton
      >
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/projects/${projectId}/issues`}>Xem Issues</Link>
          </Button>
          <ProjectActions
            project={project}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onManageMembers={() => setIsMemberDialogOpen(true)}
            variant="outline"
            size="default"
          />
        </div>
      </ProjectHeader>

      {/* Navigation Tabs */}
      <ProjectTabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange}>
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin dự án</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Tên dự án</h3>
                    <p className="text-muted-foreground">{project.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Mô tả</h3>
                    <p className="text-muted-foreground">{project.description || "Không có mô tả"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ngày tạo</h3>
                    <p className="text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Trạng thái</h3>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issue Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{issueStats.total}</div>
                    <div className="text-sm text-muted-foreground">Tổng cộng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{issueStats.done}</div>
                    <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{issueStats.notDone}</div>
                    <div className="text-sm text-muted-foreground">Chưa hoàn thành</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/projects/${projectId}/issues`}>Xem tất cả issues</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Members */}
            <Card>
              <CardHeader>
                <CardTitle>Thành viên dự án</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectMembers.slice(0, 5).map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.user.avatarUrl} />
                          <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                  {projectMembers.length > 5 && (
                    <div className="text-center pt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/projects/${projectId}?tab=members`}>Xem tất cả ({projectMembers.length})</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "list" && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Danh sách Issues</h3>
              <p className="text-muted-foreground mb-4">Chuyển đến trang quản lý issues</p>
              <Button asChild>
                <Link to={`/projects/${projectId}/issues`}>Xem Issues</Link>
              </Button>
            </div>
          </div>
        )}

        {activeTab === "kanban" && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Kanban Board</h3>
              <p className="text-muted-foreground mb-4">Chuyển đến Kanban board</p>
              <Button asChild>
                <Link to={`/projects/${projectId}/kanban`}>Xem Kanban</Link>
              </Button>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Báo cáo</h3>
              <p className="text-muted-foreground mb-4">Chuyển đến trang báo cáo</p>
              <Button asChild>
                <Link to={`/projects/${projectId}/reports`}>Xem Báo cáo</Link>
              </Button>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thành viên dự án</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectMembers.map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.user.avatarUrl} />
                          <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Cài đặt dự án</h3>
              <p className="text-muted-foreground">Tính năng đang được phát triển</p>
            </div>
          </div>
        )}
      </ProjectTabs>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Management Dialog */}
      {project && (
        <MemberManagement
          project={project}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          isOpen={isMemberDialogOpen}
          onOpenChange={setIsMemberDialogOpen}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
