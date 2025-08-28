import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/project/KanbanBoard";
import issueService from "@/service/issueService";
import sprintService from "@/service/sprintService";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import type { Sprint } from "@/types/sprint";
import { toastError, toastSuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import type { Issue } from '@/types/issue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from '@/types/user';
import { getCurrentUserRole, isCurrentUserManager } from "@/utils/projectHelpers";

const mapIssue = (issue: unknown): Issue => {
  const i = issue as Record<string, unknown>;
  return {
    ...i,
    issueType: (i.issueType as string) || "TASK",
    sprintId: i.sprintId ? String(i.sprintId) : undefined,
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
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedScope, setSelectedScope] = useState<string>("BACKLOG");
  const [kanbanIssues, setKanbanIssues] = useState<Issue[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isCreateSubtaskDialogOpen, setIsCreateSubtaskDialogOpen] = useState(false);
  const [selectedParentIssue, setSelectedParentIssue] = useState<Issue | null>(null);
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

  const fetchProject = useCallback(async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }, [projectId]);

  const fetchSprints = useCallback(async () => {
    try {
      const response = await sprintService.getSprintsByProject(projectId!);
      const sprints = response.result || [];
      setSprints(sprints);
      const active = sprints.find(s => s.status === "ACTIVE");
      setSelectedScope(active ? active.id : "BACKLOG");
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  }, [projectId]);

  const fetchProjectMembers = useCallback(async () => {
    try {
      const response = await ProjectService.getProjectMembers(projectId!);
      setProjectMembers(response.result || []);
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  }, [projectId]);

  const fetchProjectUsers = useCallback(async () => {
    try {
      const response = await ProjectService.getProjectUsers(projectId!);
      setProjectUsers(response.result || []);
    } catch (error) {
      console.error("Error fetching project users:", error);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchSprints();
      fetchProjectMembers();
      fetchProjectUsers();
    }
  }, [projectId, fetchProject, fetchSprints, fetchProjectMembers, fetchProjectUsers]);

  const fetchKanbanIssues = useCallback(async () => {
    if (!projectId) return;
    try {
      let response;
      if (selectedScope === "BACKLOG") {
        response = await sprintService.getBacklogIssues(projectId!);
      } else {
        response = await sprintService.getIssuesBySprint(selectedScope);
      }
      const rawIssues = (response.result || []).map(mapIssue);
      const filteredIssues = rawIssues.filter(issue => issue.issueType !== "EPIC" && issue.issueType !== "SUBTASK");
      setKanbanIssues(filteredIssues);
    } catch (error) {
      console.error("Error fetching kanban issues:", error);
      setKanbanIssues([]);
    }
  }, [projectId, selectedScope]);

  useEffect(() => {
    fetchKanbanIssues();
  }, [fetchKanbanIssues]);

  

  const canCreateIssue = () => {
    if (!user || !projectId) return false;
    const role = getCurrentUserRole(user, projectId!, project?.teamId);
    return role && role !== "VIEWER";
  };

  const canMoveIssue = (issue: Issue): boolean => {
    if (!user || !projectId) return false;
    return (
      issue.assignee?.id === user.id ||
      issue.reporter?.id === user.id ||
      isCurrentUserManager(user, projectId!)
    );
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    const issue = kanbanIssues.find(i => i.id === issueId);
    if (!issue || !user || !canMoveIssue(issue)) {
      toastError("Bạn không có quyền thay đổi trạng thái issue này!");
      return;
    }
    try {
      setKanbanIssues(prev => prev.map(issue =>
        issue.id === issueId ? { ...issue, status: newStatus as Issue["status"] } : issue
      ));
      await issueService.updateIssueStatus(issueId, newStatus);
      toastSuccess("Cập nhật trạng thái thành công!");
    } catch (error) {
      toastError("Cập nhật trạng thái thất bại!");
      console.error("Error updating issue status:", error);
    }
  };


  const onCreateSubtask = async (data: { title: string; description: string; priority: string; assigneeId: string; sprintId?: string }) => {
    if (!selectedParentIssue) return;
    setCreating(true);
    try {
      const requestBody: {
        title: string;
        description: string;
        priority: string;
        issueType: "SUBTASK";
        projectId: string;
        parentId: string;
        assigneeId?: string;
        sprintId?: string;
      } = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        issueType: "SUBTASK",
        projectId: projectId!,
        parentId: selectedParentIssue.id,
      };
      if (data.assigneeId !== "none") {
        requestBody.assigneeId = data.assigneeId;
      }
      // Inherit sprint from parent issue if available
      if (selectedParentIssue.sprintId) {
        requestBody.sprintId = selectedParentIssue.sprintId;
      }
      await issueService.createIssue(requestBody);
      toastSuccess("Tạo subtask thành công!");
      setIsCreateSubtaskDialogOpen(false);
      setSelectedParentIssue(null);
      reset();
      fetchKanbanIssues();
    } catch (error) {
      toastError("Tạo subtask thất bại!");
      console.error("Error creating subtask:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSubtask = (issue: Issue) => {
    setSelectedParentIssue(issue);
    setIsCreateSubtaskDialogOpen(true);
  };

  if (!project) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

      <ProjectNavigation projectId={projectId!} activeTab="kanban" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                {selectedScope === "BACKLOG" ? (
                  <>Backlog</>
                ) : (
                  <>
                    Sprint: {sprints.find(s => s.id === selectedScope)?.name || ""}
                    {(() => {
                      const s = sprints.find(s => s.id === selectedScope);
                      if (!s) return null;
                      const text = s.status === "ACTIVE"
                        ? "Đang chạy"
                        : s.status === "COMPLETED"
                        ? "Đã kết thúc"
                        : s.status === "PLANNING"
                        ? "Đang lập kế hoạch"
                        : s.status === "CANCELLED"
                        ? "Đã hủy"
                        : s.status;
                      return <Badge variant="default">{text}</Badge>;
                    })()}
                  </>
                )}
              </CardTitle>
              <div className="w-64">
                <Select value={selectedScope} onValueChange={setSelectedScope}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sprint hoặc backlog" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    {sprints.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              issues={kanbanIssues}
              projectMembers={projectMembers}
              onStatusChange={handleStatusChange}
              canCreateIssue={canCreateIssue() || false}
              onCreateSubtask={handleCreateSubtask}
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Subtask Dialog */}
      <Dialog open={isCreateSubtaskDialogOpen} onOpenChange={setIsCreateSubtaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Subtask cho: {selectedParentIssue?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubtask)} className="space-y-4">
            <div>
              <Input
                placeholder="Tiêu đề subtask"
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
                value={watch("assigneeId")}
                onValueChange={v => setValue("assigneeId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Người được giao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {projectUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>Tạo Subtask</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectKanbanPage; 