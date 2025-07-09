import React, { useState, useEffect } from "react";
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
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [sprintIssues, setSprintIssues] = useState<Issue[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchSprints();
      fetchProjectMembers();
      fetchProjectUsers();
    }
  }, [projectId]);

  useEffect(() => {
    if (activeSprint) {
      fetchSprintIssues();
    }
  }, [activeSprint, projectId]);

  const fetchProject = async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await sprintService.getSprintsByProject(projectId!);
      const sprints = response.result || [];
      setSprints(sprints);
      
      // Chỉ tìm sprint đang ACTIVE cho Kanban
      const activeSprint = sprints.find(s => s.status === "ACTIVE");
      setActiveSprint(activeSprint || null);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const fetchSprintIssues = async () => {
    if (!activeSprint) return;
    try {
      const response = await sprintService.getIssuesBySprint(activeSprint.id);
      const sprintIssues = (response.result || []).map(mapIssue);
      // Lọc bỏ EPIC và SUBTASK khỏi danh sách chính
      const filteredIssues = sprintIssues.filter(issue => 
        issue.issueType !== "EPIC" && issue.issueType !== "SUBTASK"
      );
      setSprintIssues(filteredIssues);
    } catch (error) {
      console.error("Error fetching sprint issues:", error);
      setSprintIssues([]);
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

  const fetchProjectUsers = async () => {
    try {
      const response = await ProjectService.getProjectUsers(projectId!);
      setProjectUsers(response.result || []);
    } catch (error) {
      console.error("Error fetching project users:", error);
    }
  };

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
      isCurrentUserManager(user, projectId!, project?.teamId)
    );
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    const issue = sprintIssues.find(i => i.id === issueId);
    if (!issue || !user || !canMoveIssue(issue)) {
      toastError("Bạn không có quyền thay đổi trạng thái issue này!");
      return;
    }
    try {
      await issueService.updateIssueStatus(issueId, newStatus);
      setSprintIssues(prev => prev.map(issue => 
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
      const requestBody: { title: string; description: string; priority: string; issueType: string; projectId: string; assigneeId?: string; sprintId?: string } = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        issueType: data.issueType,
        projectId: projectId!,
      };
      if (data.assigneeId !== "none") {
        requestBody.assigneeId = data.assigneeId;
      }
      if (activeSprint) {
        requestBody.sprintId = activeSprint.id;
      }
      await issueService.createIssue(requestBody);
      toastSuccess("Tạo issue thành công!");
      setIsCreateDialogOpen(false);
      reset();
      if (activeSprint) {
        fetchSprintIssues();
      }
    } catch (error) {
      toastError("Tạo issue thất bại!");
      console.error("Error creating issue:", error);
    } finally {
      setCreating(false);
    }
  };

  const onCreateSubtask = async (data: { title: string; description: string; priority: string; assigneeId: string }) => {
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
      await issueService.createIssue(requestBody);
      toastSuccess("Tạo subtask thành công!");
      setIsCreateSubtaskDialogOpen(false);
      setSelectedParentIssue(null);
      reset();
      if (activeSprint) {
        fetchSprintIssues();
      }
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
        {/* Active Sprint Kanban - Chỉ hiển thị sprint đang ACTIVE */}
        {activeSprint ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Sprint: {activeSprint.name}
                  <Badge variant="default">Đang chạy</Badge>
                </CardTitle>
                {activeSprint.goal && (
                  <p className="text-sm text-muted-foreground">{activeSprint.goal}</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <KanbanBoard
                issues={sprintIssues}
                projectMembers={projectMembers}
                onStatusChange={handleStatusChange}
                canCreateIssue={canCreateIssue() || false}
                onCreateSubtask={handleCreateSubtask}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Không có sprint đang chạy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vui lòng bắt đầu một sprint để xem kanban board.</p>
            </CardContent>
          </Card>
        )}
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