import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/project/KanbanBoard";
import issueService from "@/service/issueService";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import { toastError, toastSuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import type { Issue } from '@/types/issue';
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

const ProjectKanbanPage: React.FC = () => {
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

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchIssues();
      fetchProjectMembers();
    }
  }, [projectId]);

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

  const canCreateIssue = () => {
    if (!user) return false;
    const member = projectMembers.find(m => m.user.id === user.id);
    return member && member.role !== "VIEWER";
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
      <ProjectHeader 
        title={`${project?.name || ""} - Kanban Board`}
        showBackButton
      />
      
      <ProjectNavigation projectId={projectId!} />

      <KanbanBoard
        issues={issues}
        projectMembers={projectMembers}
        onOpenCreateIssue={() => setIsCreateDialogOpen(true)}
        canCreateIssue={canCreateIssue()}
        onStatusChange={handleStatusChange}
      />

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

export default ProjectKanbanPage; 