import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { formatDateForAPI, formatEndDateForAPI } from "@/utils/dateUtils";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import ProjectService from "@/service/projectService";
import { isCurrentUserManager } from "@/utils/projectHelpers";
import { IssueForm } from "@/components/project/IssueForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      goal: "",
      startDate: "",
      endDate: "",
    },
  });

  const [sprintReloadKey, setSprintReloadKey] = useState(0);

  // fetchProject
  const fetchProject = useCallback(async () => {
    try {
      const response = await ProjectService.getProjectById(projectId!);
      setProject(response.result);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }, [projectId]);

  // fetchSprints
  const fetchSprints = useCallback(async () => {
    try {
      const response = await sprintService.getSprintsByProject(projectId!);
      setSprints(response.result || []);
    } catch (error) {
      console.error("Error fetching sprints:", error);
      toastError("Không thể tải danh sách sprint!");
    }
  }, [projectId]);

  // mapIssue
  const mapIssue = useCallback((issue: Record<string, unknown>): Issue => {
    return {
      ...(issue as unknown as Issue),
      sprintId: issue.sprintId ? String(issue.sprintId) : undefined,
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
  }, []);

  // fetchBacklogIssues
  const fetchBacklogIssues = useCallback(async () => {
    try {
      const response = await sprintService.getBacklogIssues(projectId!);
      const mappedIssues = (response.result || []).map(mapIssue);
      setBacklogIssues(mappedIssues);
    } catch (error) {
      console.error("Error fetching backlog:", error);
      toastError("Không thể tải backlog!");
    }
  }, [projectId, mapIssue]);

  // fetchProjectMembers
  const fetchProjectMembers = useCallback(async () => {
    try {
      const response = await projectService.getProjectUsers(projectId!);
      const mappedMembers = (response.result || []).map(user => ({
        projectId: projectId!,
        userId: user.id,
        role: "MEMBER" as const,
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
  }, [projectId]);

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
  }, [projectId, fetchProject, fetchSprints, fetchBacklogIssues, fetchProjectMembers]);

  // Lấy thông tin user hiện tại trong project này
  const getCurrentUserProjectMember = () => {
    if (!user || !projectId) return null;
    return user.projectMembers?.find(m => m.projectId === projectId) || null;
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
    } catch {
      toastError("Hủy sprint thất bại!");
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await issueService.updateIssueStatus(issueId, newStatus);
      toastSuccess("Cập nhật trạng thái thành công!");
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1); // Trigger reload sprint issues
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
      setSprintReloadKey(prev => prev + 1); // Trigger reload sprint issues
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
      setSprintReloadKey(prev => prev + 1); // Trigger reload sprint issues
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
      setSprintReloadKey(prev => prev + 1); // Trigger reload sprint issues
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
    } catch {
      toastError("Cập nhật sprint thất bại!");
    }
  };



  // Phân quyền thay đổi sprint, assignee, due date
  const canManageIssue = () => {
    if (!user || !projectId) return false;
    const result = isCurrentUserManager(user, projectId!);
    // console.log('canManageIssue', { user, projectId, result });
    return result;
  };

  // Thêm hàm kiểm tra quyền quản lý sprint
  const canManageSprint = () => {
    if (!user || !projectId) return false;
    const currentUserMember = getCurrentUserProjectMember();
    const result = !!(currentUserMember && (currentUserMember.role === "ADMIN" || currentUserMember.role === "PM"));
    // console.log('canManageSprint result', { currentUserMember, result });
    return result;
  };

  const canEditIssue = (issue: Issue) => {
    if (!user) return false;
    const currentUserMember = getCurrentUserProjectMember();
    return issue.reporter?.id === user.id || currentUserMember?.role === "ADMIN" || currentUserMember?.role === "PM";
  };

  const canChangeStatus = (issue: Issue) => {
    if (!user) return false;
    const currentUserMember = getCurrentUserProjectMember();
    const result = issue.assignee?.id === user.id || issue.reporter?.id === user.id || currentUserMember?.role === "ADMIN" || currentUserMember?.role === "PM";
    // console.log('canChangeStatus', { user, issue, currentUserMember, result });
    return result;
  };

  // Tạo issue mới
  const onCreateIssue = async (data: import("@/components/project/IssueForm").IssueFormValues) => {
    try {
      const requestBody: Record<string, unknown> = {
        title: data.title,
        description: data.description || "",
        priority: data.priority,
        issueType: data.issueType,
        projectId: projectId!,
      };
      if (data.assigneeId && data.assigneeId !== "none") requestBody.assigneeId = data.assigneeId;
      if (data.sprintId && data.sprintId !== "backlog" && data.sprintId !== "none") requestBody.sprintId = data.sprintId;
      if (data.storyPoints !== undefined) requestBody.storyPoints = data.storyPoints;
      if (data.startDate) requestBody.startDate = data.startDate;
      if (data.dueDate) requestBody.dueDate = data.dueDate;
      if (data.parentId) requestBody.parentId = data.parentId;
      await issueService.createIssue(requestBody);
      toastSuccess("Tạo issue thành công!");
      setIsCreateIssueDialogOpen(false);
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1);
    } catch {
      toastError("Tạo issue thất bại!");
    }
  };

  // Phân quyền tạo issue - chỉ PM và ADMIN mới được tạo
  const canCreateIssue = () => {
    if (!user || !projectId) return false;
    const currentUserMember = getCurrentUserProjectMember();
    return !!(currentUserMember && (currentUserMember.role === "ADMIN" || currentUserMember.role === "PM"));
  };

  // State cho popup edit/delete
  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [deleteIssue, setDeleteIssue] = useState<Issue | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Mở popup edit
  const openEditIssueDialog = (issue: Issue) => {
    setEditIssue(issue);
    setIsEditDialogOpen(true);
  };
  // Mở popup xác nhận xoá
  const openDeleteIssueDialog = (issue: Issue) => {
    setDeleteIssue(issue);
    setIsDeleteDialogOpen(true);
  };

  // Xử lý cập nhật issue
  const onEditIssueSubmit = async (data: import("@/components/project/IssueForm").IssueFormValues) => {
    if (!editIssue) return;
    try {
      const requestBody: Record<string, unknown> = {
        title: data.title,
        description: data.description || "",
        priority: data.priority,
        issueType: data.issueType,
        projectId: projectId!,
      };
      if (data.assigneeId && data.assigneeId !== "none") requestBody.assigneeId = data.assigneeId;
      if (data.sprintId && data.sprintId !== "backlog" && data.sprintId !== "none") requestBody.sprintId = data.sprintId;
      if (data.storyPoints !== undefined) requestBody.storyPoints = data.storyPoints;
      if (data.startDate) requestBody.startDate = data.startDate;
      if (data.dueDate) requestBody.dueDate = data.dueDate;
      if (data.parentId) requestBody.parentId = data.parentId;
      await issueService.updateIssue(editIssue.id, requestBody);
      toastSuccess("Cập nhật issue thành công!");
      setIsEditDialogOpen(false);
      setEditIssue(null);
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1);
    } catch {
      toastError("Cập nhật issue thất bại!");
    }
  };

  // Xử lý xoá issue
  const onDeleteIssueConfirm = async () => {
    if (!deleteIssue) return;
    try {
      await issueService.deleteIssue(deleteIssue.id);
      toastSuccess("Xoá issue thành công!");
      setIsDeleteDialogOpen(false);
      setDeleteIssue(null);
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1);
    } catch {
      toastError("Xoá issue thất bại!");
    }
  };

  // Filter out EPIC and SUBTASK for IssuesTable
  const filteredBacklogIssues = backlogIssues.filter(issue => issue.issueType !== "EPIC" && issue.issueType !== "SUBTASK");

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
        {/* Sprint Section: chỉ render nếu có sprint hoặc có quyền quản lý */}
        {(canManageSprint() || sprints.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quản lý Sprint</h3>
              {canManageSprint() && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Sprint
                </Button>
              )}
            </div>
            {/* Sprint Issues Section */}
            {sprints.length > 0 && (
              <div className="space-y-4" style={{ maxWidth: '100%' }}>
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
                    onOpenCreateIssue={() => setIsCreateIssueDialogOpen(true)}
                    canCreateIssue={canCreateIssue()}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Backlog Section */}
        <div className="w-full max-w-full">
          <Card>
            <CardHeader>
              <CardTitle>Backlog</CardTitle>
            </CardHeader>
            <CardContent>
              <IssuesTable
                issues={filteredBacklogIssues}
                allIssues={backlogIssues}
                projectMembers={projectMembers}
                sprints={sprints}
                canEditIssue={canEditIssue}
                canChangeStatus={canChangeStatus}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onIssueTypeChange={handleIssueTypeChange}
                onAssigneeChange={canManageIssue() ? handleAssigneeChange : () => {}}
                onSprintChange={canManageIssue() ? handleSprintChange : () => {}}
                onOpenCreateIssue={() => setIsCreateIssueDialogOpen(true)}
                canCreateIssue={canCreateIssue()}
                onEditIssue={openEditIssueDialog}
                onDeleteIssue={openDeleteIssueDialog}
              />
            </CardContent>
          </Card>
        </div>
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
          <IssueForm
            onSubmit={onCreateIssue}
            loading={false}
            projectMembers={projectMembers}
            sprints={sprints}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog edit issue */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Issue</DialogTitle>
          </DialogHeader>
          {editIssue && (
            <IssueForm
              onSubmit={onEditIssueSubmit}
              loading={false}
              projectMembers={projectMembers}
              sprints={sprints}
              defaultValues={editIssue}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog xác nhận xoá issue */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá Issue</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xoá issue này không?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={onDeleteIssueConfirm}>Xoá</Button>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Huỷ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectIssuesTablePage;
