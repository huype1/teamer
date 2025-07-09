import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { IssuesTable, SprintIssuesCombinedTable } from "@/components/project";
import sprintService from "@/service/sprintService";
import issueService from "@/service/issueService";
import projectService from "@/service/projectService";
import { toastError, toastSuccess } from "@/utils/toast";
import type { Sprint } from "@/types/sprint";
import type { Issue } from "@/types/issue";
import type { ProjectMember } from "@/types/project";
import type { Project } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Plus, Target } from "lucide-react";
import { formatDateForAPI, formatEndDateForAPI } from "@/utils/dateUtils";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import ProjectService from "@/service/projectService";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { isCurrentUserManager } from "@/utils/projectHelpers";

const ProjectIssuesTablePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Thêm state cho modal tạo issue
  const [isCreateIssueDialogOpen, setIsCreateIssueDialogOpen] = useState(false);
  const { register: issueRegister, handleSubmit: handleIssueSubmit, reset: resetIssueForm, setValue: setIssueValue, watch: watchIssue } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "P3",
      issueType: "TASK",
      assigneeId: "none",
    },
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      goal: "",
      startDate: "",
      endDate: "",
    },
  });

  const [sprintReloadKey, setSprintReloadKey] = useState(0);

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        try {
          await Promise.all([
            fetchProject(),
            fetchSprints(),
            fetchBacklogIssues(),
            fetchProjectMembers()
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
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

  const fetchSprints = async () => {
    try {
      const response = await sprintService.getSprintsByProject(projectId!);
      setSprints(response.result || []);
    } catch (error) {
      console.error("Error fetching sprints:", error);
      toastError("Không thể tải danh sách sprint!");
    }
  };

  const mapIssue = (issue: Record<string, unknown>): Issue => {
    return {
      ...(issue as Issue),
      reporter: issue.reporterId ? {
        id: String(issue.reporterId),
        name: String(issue.reporterName),
        email: String(issue.reporterEmail),
      } : undefined,
      assignee: issue.assigneeId ? {
        id: String(issue.assigneeId),
        name: String(issue.assigneeName),
        email: String(issue.assigneeEmail),
      } : undefined,
    };
  };

  const fetchBacklogIssues = async () => {
    try {
      const response = await sprintService.getBacklogIssues(projectId!);
      const mappedIssues = (response.result || []).map(mapIssue);
      setBacklogIssues(mappedIssues);
    } catch (error) {
      console.error("Error fetching backlog:", error);
      toastError("Không thể tải backlog!");
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await projectService.getProjectUsers(projectId!);
      // Map UserResponse to ProjectMember structure for compatibility
      const mappedMembers = (response.result || []).map(user => ({
        projectId: projectId!,
        userId: user.id,
        role: "MEMBER" as const, // Default role since we don't have role info from users endpoint
        joinedAt: new Date().toISOString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          provider: user.provider,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      }));
      setProjectMembers(mappedMembers);
    } catch (error) {
      console.error("Error fetching project users:", error);
      toastError("Không thể tải danh sách thành viên!");
    }
  };

  const onCreateSprint = async (data: { name: string; goal: string; startDate: string; endDate: string }) => {
    try {
      await sprintService.createSprint({
        name: data.name,
        goal: data.goal || undefined,
        startDate: data.startDate ? formatDateForAPI(data.startDate) : undefined,
        endDate: data.endDate ? formatEndDateForAPI(data.endDate) : undefined,
        projectId: projectId!,
      });
      toastSuccess("Tạo sprint thành công!");
      setIsCreateDialogOpen(false);
      reset();
      fetchSprints();
    } catch (error) {
      console.error("Error creating sprint:", error);
      toastError("Tạo sprint thất bại!");
    }
  };

  const onStartSprint = async (sprintId: string) => {
    try {
      await sprintService.startSprint(sprintId);
      toastSuccess("Bắt đầu sprint thành công!");
      fetchSprints();
    } catch (error) {
      console.error("Error starting sprint:", error);
      toastError("Bắt đầu sprint thất bại!");
    }
  };

  const onEndSprint = async (sprintId: string) => {
    try {
      await sprintService.endSprint(sprintId);
      toastSuccess("Kết thúc sprint thành công!");
      fetchSprints();
    } catch (error) {
      console.error("Error ending sprint:", error);
      toastError("Kết thúc sprint thất bại!");
    }
  };

  const onCancelSprint = async (sprintId: string) => {
    try {
      await sprintService.cancelSprint(sprintId);
      toastSuccess("Hủy sprint thành công!");
      fetchSprints();
    } catch (error) {
      toastError("Hủy sprint thất bại!");
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await issueService.updateIssueStatus(issueId, newStatus);
      toastSuccess("Cập nhật trạng thái thành công!");
      fetchBacklogIssues();
    } catch (error) {
      console.error("Error updating status:", error);
      toastError("Cập nhật trạng thái thất bại!");
    }
  };

  const handlePriorityChange = async (issueId: string, newPriority: string) => {
    try {
      await issueService.updateIssue(issueId, { priority: newPriority });
      toastSuccess("Cập nhật độ ưu tiên thành công!");
      fetchBacklogIssues();
    } catch (error) {
      console.error("Error updating priority:", error);
      toastError("Cập nhật độ ưu tiên thất bại!");
    }
  };

  const handleIssueTypeChange = async (issueId: string, newIssueType: string) => {
    try {
      await issueService.updateIssue(issueId, { issueType: newIssueType });
      toastSuccess("Cập nhật loại issue thành công!");
      fetchBacklogIssues();
    } catch (error) {
      console.error("Error updating issue type:", error);
      toastError("Cập nhật loại issue thất bại!");
    }
  };

  const handleAssigneeChange = async (issueId: string, assigneeId: string) => {
    try {
      if (assigneeId === "unassigned") {
        await issueService.updateIssue(issueId, { assigneeId: null });
      } else {
        await issueService.setAssignee(issueId, assigneeId);
      }
      toastSuccess("Cập nhật người phụ trách thành công!");
      fetchBacklogIssues();
    } catch (error) {
      console.error("Error updating assignee:", error);
      toastError("Cập nhật người phụ trách thất bại!");
    }
  };

  const handleSprintChange = async (issueId: string, sprintId: string) => {
    try {
      if (sprintId === "backlog") {
        await issueService.updateIssue(issueId, { sprintId: null });
      } else {
        await issueService.updateIssue(issueId, { sprintId });
      }
      toastSuccess("Cập nhật sprint thành công!");
      fetchBacklogIssues();
      fetchSprints();
      setSprintReloadKey(prev => prev + 1); // Trigger reload sprint issues
    } catch (error) {
      toastError("Cập nhật sprint thất bại!");
    }
  };

  // Phân quyền tạo issue
  const canCreateIssue = () => {
    if (!user || !projectId) return false;
    const member = projectMembers.find(m => m.userId === user.id);
    return member && (member.role === "ADMIN" || member.role === "PM");
  };

  // Phân quyền thay đổi sprint, assignee, due date
  const canManageIssue = () => {
    if (!user || !projectId) return false;
    const result = isCurrentUserManager(user, projectId!, project?.teamId);
    console.log('canManageIssue', { user, projectId, teamId: project?.teamId, result });
    return result;
  };

  // Thêm hàm kiểm tra quyền quản lý sprint
  const canManageSprint = () => {
    if (!user || !projectId) return false;
    const member = projectMembers.find(m => m.userId === user.id);
    return member && (member.role === "ADMIN" || member.role === "PM");
  };

  const canEditIssue = (issue: Issue) => {
    if (!user) return false;
    const member = projectMembers.find(m => m.userId === user.id);
    return issue.reporter?.id === user.id || member?.role === "ADMIN" || member?.role === "PM";
  };

  const canChangeStatus = (issue: Issue) => {
    if (!user) return false;
    const member = projectMembers.find(m => m.userId === user.id);
    const result = issue.reporter?.id === user.id || member?.role === "ADMIN" || member?.role === "PM";
    console.log('canChangeStatus', { user, issue, member, result });
    return result;
  };

  // Tạo issue mới
  const onCreateIssue = async (data: { title: string; description: string; priority: string; issueType: string; assigneeId: string }) => {
    try {
      const requestBody: { title: string; description: string; priority: string; issueType: string; projectId: string; assigneeId?: string; } = {
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
      setIsCreateIssueDialogOpen(false);
      resetIssueForm();
      fetchBacklogIssues();
    } catch (error) {
      toastError("Tạo issue thất bại!");
    }
  };

  // Thêm biến kiểm tra quyền tạo assignee khi tạo issue
  const canAssignWhenCreate = () => {
    if (!user || !projectId) return false;
    const member = projectMembers.find(m => m.userId === user.id);
    return member && (member.role === "ADMIN" || member.role === "PM");
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      </div>
    );
  }

  // Sắp xếp sprint: ACTIVE đầu tiên, sau đó PLANNING, COMPLETED, CANCELLED
  const sortedSprints = [...sprints].sort((a, b) => {
    const statusOrder = { ACTIVE: 0, PLANNING: 1, COMPLETED: 2, CANCELLED: 3 };
    return (statusOrder[a.status as keyof typeof statusOrder] || 4) - (statusOrder[b.status as keyof typeof statusOrder] || 4);
  });
  const activeSprint = sprints.find(s => s.status === "ACTIVE");

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        title={`${project?.name || ""} - Backlog & Sprint`}
        showBackButton
      />

      <ProjectNavigation projectId={projectId!} activeTab="issues" />

      <div className="space-y-6">
      {/* Sprint Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quản lý Sprint</h3>
            {/* {canManageSprint() && ( */}
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Sprint
              </Button>
            {/* )} */}
        </div>
                    </div>

        {/* Sprint Issues Section */}
        {sprints.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Issues trong Sprint</h3>
            {sortedSprints.map((sprint) => (
              <SprintIssuesCombinedTable
                key={sprint.id}
                sprint={sprint}
                projectMembers={projectMembers}
                canEditIssue={canEditIssue}
                canChangeStatus={canChangeStatus}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onIssueTypeChange={handleIssueTypeChange}
                onAssigneeChange={handleAssigneeChange}
                onStartSprint={onStartSprint}
                onEndSprint={onEndSprint}
                onCancelSprint={onCancelSprint}
                activeSprintId={activeSprint?.id}
                sprintReloadKey={sprintReloadKey}
                canManageSprint={canManageSprint()}
              />
            ))}
          </div>
        )}

        {/* Backlog Section (moved to bottom) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Backlog Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
        {backlogIssues.length > 0 ? (
          <IssuesTable
              issues={backlogIssues}
                projectMembers={projectMembers}
                sprints={sprints}
                canEditIssue={canEditIssue}
                canChangeStatus={canChangeStatus}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onIssueTypeChange={handleIssueTypeChange}
                onAssigneeChange={canManageIssue() ? handleAssigneeChange : () => {}}
                onSprintChange={canManageIssue() ? handleSprintChange : () => {}}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Không có issue nào trong backlog.
              </p>
            )}
            {/* Nút tạo issue mới */}
            {/* {canCreateIssue() && ( */}
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => setIsCreateIssueDialogOpen(true)}>
                  + Tạo Issue mới
                </Button>
              </div>
            {/* )} */}
          </CardContent>
        </Card>
      </div>

      {/* Create Sprint Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Sprint mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSprint)} className="space-y-4">
            <div>
              <Input 
                placeholder="Tên sprint" 
                {...register("name", { required: true })} 
              />
            </div>
            <div>
              <Textarea 
                placeholder="Mục tiêu sprint (tùy chọn)" 
                {...register("goal")} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  type="date" 
                  placeholder="Ngày bắt đầu" 
                  {...register("startDate")} 
                />
              </div>
              <div>
                <Input 
                  type="date" 
                  placeholder="Ngày kết thúc" 
                  {...register("endDate")} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Tạo Sprint</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Issue Dialog */}
      <Dialog open={isCreateIssueDialogOpen} onOpenChange={setIsCreateIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Issue mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIssueSubmit(onCreateIssue)} className="space-y-4">
            <div>
              <Input
                placeholder="Tiêu đề"
                {...issueRegister("title", { required: true })}
              />
            </div>
            <div>
              <Textarea
                placeholder="Mô tả"
                {...issueRegister("description")}
              />
            </div>
            <div>
              <Select
                value={watchIssue("priority")}
                onValueChange={v => setIssueValue("priority", v)}
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
                value={watchIssue("issueType")}
                onValueChange={v => setIssueValue("issueType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Loại issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STORY">Story</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={watchIssue("assigneeId")}
                onValueChange={v => setIssueValue("assigneeId", v)}
                disabled={!canAssignWhenCreate()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Người được giao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {projectMembers.map(member => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Tạo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectIssuesTablePage;
