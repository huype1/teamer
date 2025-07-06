import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectTabs, type ProjectTab, IssuesTable } from "@/components/project";
import issueService from "@/service/issueService";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ProjectHeader } from "@/components/project";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import { toastError, toastSuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import type { Issue } from '@/types/issue';
import KanbanBoard from "@/components/project/KanbanBoard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mapIssue = (issue: unknown): Issue => {
  const i = issue as Record<string, unknown>;
  return {
    ...i,
    issueType: (i.issueType as string) || "TASK",
    reporter: i.reporterId
      ? {
          id: i.reporterId as string,
          name: i.reporterName as string,
          email: i.reporterEmail as string,
        }
      : null,
    assignee: i.assigneeId
      ? {
          id: i.assigneeId as string,
          name: i.assigneeName as string,
          email: i.assigneeEmail as string,
        }
      : null,
  } as Issue;
};

const ProjectIssuesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "P3",
      issueType: "TASK",
      assigneeId: "none",
    },
  });
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
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
    if (tab && ['list', 'kanban', 'reports'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await issueService.getIssuesByProjectId(projectId!);
      console.log(response)
      setIssues(response.result.map(mapIssue));
    } catch {
      toastError("Không thể tải danh sách issue!");
      setIssues([]);
    } finally {
      setLoading(false);
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

  const handleTabChange = (key: string) => {
    if (key === 'overview') {
      navigate(`/projects/${projectId}`);
    }
    setActiveTab(key);
  };

  const canCreateIssue = () => {
    if (!user) return false;
    const member = projectMembers.find(m => m.user.id === user.id);
    return member && member.role !== "VIEWER";
  };

  const canEditIssue = (issue: Issue): boolean => {
    if (!user) return false;
    return (
      issue.reporter?.id === user.id ||
      project?.members.some(m => m.user.id === user.id && m.role === "PM") ||
      project?.members.some(m => m.user.id === user.id && m.role === "ADMIN")
    ) ?? false;
  };

  const canMoveIssue = (issue: Issue): boolean => {
    if (!user) return false;
    const member = projectMembers.find(m => m.user.id === user.id);
    return (
      issue.assignee?.id === user.id ||
      issue.reporter?.id === user.id ||
      member?.role === "PM" ||
      member?.role === "ADMIN"
    );
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || !user || !canMoveIssue(issue)) {
      toastError("Bạn không có quyền thay đổi trạng thái issue này!");
      return;
    }
    try {
      await issueService.updateIssueStatus(issueId, newStatus);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus as Issue["status"] } : issue
      ));
      toastSuccess("Cập nhật trạng thái thành công!");
    } catch (error) {
      toastError("Cập nhật trạng thái thất bại!");
      console.error("Error updating issue status:", error);
    }
  };

  const handlePriorityChange = async (issueId: string, newPriority: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || !user || !canEditIssue(issue)) {
      toastError("Chỉ người tạo, PM hoặc admin mới được thay đổi độ ưu tiên!");
      return;
    }
    try {
      await issueService.updateIssue(issueId, { ...issue, priority: newPriority });
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, priority: newPriority as Issue["priority"] } : issue
      ));
      toastSuccess("Cập nhật độ ưu tiên thành công!");
    } catch (error) {
      toastError("Cập nhật độ ưu tiên thất bại!");
      console.error("Error updating issue priority:", error);
    }
  };

  const handleIssueTypeChange = async (issueId: string, newIssueType: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || !user || !canEditIssue(issue)) {
      toastError("Chỉ người tạo, PM hoặc admin mới được thay đổi loại issue!");
      return;
    }
    try {
      await issueService.updateIssue(issueId, { ...issue, issueType: newIssueType });
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, issueType: newIssueType as Issue["issueType"] } : issue
      ));
      toastSuccess("Cập nhật loại issue thành công!");
    } catch (error) {
      toastError("Cập nhật loại issue thất bại!");
      console.error("Error updating issue type:", error);
    }
  };

  const handleAssigneeChange = async (issueId: string, assigneeId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || !user || !canEditIssue(issue)) {
      toastError("Chỉ người tạo, PM hoặc admin mới được thay đổi assignee!");
      return;
    }
    try {
      if (assigneeId === "none" || assigneeId === "unassigned") {
        // For now, we'll just update the UI state since backend doesn't support unassigning
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? { ...issue, assignee: undefined } : issue
        ));
        toastSuccess("Cập nhật người được giao thành công!");
      } else {
        await issueService.setAssignee(issueId, assigneeId);
        const assignee = projectMembers.find(member => member.user.id === assigneeId)?.user;
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? { ...issue, assignee } : issue
        ));
        toastSuccess("Cập nhật người được giao thành công!");
      }
    } catch (error) {
      toastError("Cập nhật người được giao thất bại!");
      console.error("Error updating issue assignee:", error);
    }
  };

  const onCreateIssue = async (data: { title: string; description: string; priority: string; issueType: string; assigneeId: string }) => {
    setCreating(true);
    try {
      const requestBody: { title: string; description: string; priority: string; issueType: string; projectId: string; assigneeId?: string } = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        issueType: data.issueType,
        projectId: projectId!,
      };
      if (data.assigneeId !== "none") {
        requestBody.assigneeId = data.assigneeId;
      }
      await issueService.createIssue(requestBody);
      toastSuccess("Tạo issue thành công!");
      setIsCreateDialogOpen(false);
      reset();
      fetchIssues();
    } catch (error) {
      toastError("Tạo issue thất bại!");
      console.error("Error creating issue:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa issue này?')) return;
    try {
      await issueService.deleteIssue(issueId);
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      toastSuccess('Xóa issue thành công!');
    } catch {
      toastError('Xóa issue thất bại!');
    }
  };

  const tabs: ProjectTab[] = [
    { key: "overview", label: "Tổng quan" },
    { key: "list", label: "Danh sách" },
    { key: "kanban", label: "Kanban" },
    { key: "reports", label: "Báo cáo" },
    { key: "members", label: "Thành viên" },
    { key: "settings", label: "Cài đặt" },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
      {/* Header */}
      <ProjectHeader 
        title={project?.name || ""}
        showBackButton
      >
        
      </ProjectHeader>

      <div className="border-b">
        <ProjectTabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange}>
          
          {activeTab === "list" && (
            <IssuesTable
              issues={issues}
              projectMembers={projectMembers}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onIssueTypeChange={handleIssueTypeChange}
              onAssigneeChange={handleAssigneeChange}
              canEditIssue={canEditIssue}
              canChangeStatus={canMoveIssue}
              onDeleteIssue={handleDeleteIssue}
              onOpenCreateIssue={() => setIsCreateDialogOpen(true)}
              canCreateIssue={canCreateIssue()}
            />
          )}

          {activeTab === "kanban" && (
            <KanbanBoard
              issues={issues}
              projectMembers={projectMembers}
              onOpenCreateIssue={() => setIsCreateDialogOpen(true)}
              canCreateIssue={canCreateIssue()}
            />
          )}

          {activeTab === "reports" && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Báo cáo</h3>
                <p className="text-muted-foreground">Tính năng đang được phát triển</p>
              </div>
            </div>
          )}
        </ProjectTabs>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Issue mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateIssue)} className="space-y-4">
            <div>
              <Input
                placeholder="Tiêu đề"
                {...register("title", { required: true })}
              />
            </div>
            <div>
              <Textarea
                placeholder="Mô tả"
                {...register("description")}
              />
            </div>
            <div>
              <Select
                value={watch("priority")}
                onValueChange={v => setValue("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P0">P0</SelectItem>
                  <SelectItem value="P1">P1</SelectItem>
                  <SelectItem value="P2">P2</SelectItem>
                  <SelectItem value="P3">P3</SelectItem>
                  <SelectItem value="P4">P4</SelectItem>
                  <SelectItem value="P5">P5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={watch("issueType")}
                onValueChange={v => setValue("issueType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Loại issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EPIC">Epic</SelectItem>
                  <SelectItem value="STORY">Story</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="SUBTASK">Subtask</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={watch("assigneeId")}
                onValueChange={v => setValue("assigneeId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Người được giao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {projectMembers.map(m => (
                    <SelectItem key={m.user.id} value={m.user.id}>{m.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>Tạo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectIssuesPage; 