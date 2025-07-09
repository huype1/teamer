import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectTabs, type ProjectTab, IssuesTable } from "@/components/project";
import issueService from "@/service/issueService";
import sprintService from "@/service/sprintService";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ProjectHeader } from "@/components/project";
import ProjectService from "@/service/projectService";
import type { Project, ProjectMember } from "@/types/project";
import type { Sprint } from "@/types/sprint";
import { toastError, toastSuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import type { Issue } from '@/types/issue';
import SprintManagement from "@/components/project/SprintManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from '@/types/user';

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
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [sprintIssues, setSprintIssues] = useState<Issue[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
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
      sprintId: "none",
      startDate: "",
      dueDate: "",
      storyPoints: undefined,
    },
  });
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchSprints();
      fetchProjectMembers();
      fetchProjectUsers();
    }
  }, [projectId]);

  useEffect(() => {
    if (currentSprint) {
      fetchSprintIssues();
    }
    fetchBacklogIssues();
  }, [currentSprint, projectId]);

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
      
      // Tìm sprint active hoặc planned gần nhất
      const activeSprint = sprints.find(s => s.status === "ACTIVE");
      const plannedSprint = sprints.find(s => s.status === "PLANNED");
      setCurrentSprint(activeSprint || plannedSprint || null);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const fetchSprintIssues = async () => {
    if (!currentSprint) return;
    try {
      const response = await sprintService.getIssuesBySprint(currentSprint.id);
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

  const fetchBacklogIssues = async () => {
    try {
      const response = await sprintService.getBacklogIssues(projectId!);
      const backlogIssues = (response.result || []).map(mapIssue);
      // Lọc bỏ EPIC và SUBTASK khỏi danh sách chính
      const filteredIssues = backlogIssues.filter(issue => 
        issue.issueType !== "EPIC" && issue.issueType !== "SUBTASK"
      );
      setBacklogIssues(filteredIssues);
    } catch (error) {
      console.error("Error fetching backlog issues:", error);
      setBacklogIssues([]);
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

  const handleTabChange = (key: string) => {
    if (key === 'overview') {
      navigate(`/projects/${projectId}`);
    }
    setActiveTab(key);
  };

  const canCreateIssue = () => {
    if (!user || !user.id) return false;
    const member = projectMembers.find(m => m.user.id === user.id);
    return member && member.role !== "VIEWER";
  };

  const canManageSprint = () => {
    if (!user || !user.id) return false;
    const member = projectMembers.find(m => m.user.id === user.id);
    return member && (member.role === "PM" || member.role === "ADMIN");
  };

  const canEditIssue = (issue: Issue): boolean => {
    if (!user || !user.id) return false;
    return (
      issue.reporter?.id === user.id ||
      project?.members.some(m => m.user.id === user.id && m.role === "PM") ||
      project?.members.some(m => m.user.id === user.id && m.role === "ADMIN")
    ) ?? false;
  };

  const canMoveIssue = (issue: Issue): boolean => {
    if (!user || !user.id) return false;
    const member = projectMembers.find(m => m.user.id === user.id);
    return (
      issue.assignee?.id === user.id ||
      issue.reporter?.id === user.id ||
      member?.role === "PM" ||
      member?.role === "ADMIN"
    );
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    const issue = [...sprintIssues, ...backlogIssues].find(i => i.id === issueId);
    if (!issue || !user || !canMoveIssue(issue)) {
      toastError("Bạn không có quyền thay đổi trạng thái issue này!");
      return;
    }
    try {
      await issueService.updateIssueStatus(issueId, newStatus);
      setSprintIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus as Issue["status"] } : issue
      ));
      setBacklogIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus as Issue["status"] } : issue
      ));
      toastSuccess("Cập nhật trạng thái thành công!");
    } catch (error) {
      toastError("Cập nhật trạng thái thất bại!");
      console.error("Error updating issue status:", error);
    }
  };

  const handlePriorityChange = async (issueId: string, newPriority: string) => {
    const issue = [...sprintIssues, ...backlogIssues].find(i => i.id === issueId);
    if (!issue || !user || !canEditIssue(issue)) {
      toastError("Chỉ người tạo, PM hoặc admin mới được thay đổi độ ưu tiên!");
      return;
    }
    try {
      await issueService.updateIssue(issueId, { ...issue, priority: newPriority });
      setSprintIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, priority: newPriority as Issue["priority"] } : issue
      ));
      setBacklogIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, priority: newPriority as Issue["priority"] } : issue
      ));
      toastSuccess("Cập nhật độ ưu tiên thành công!");
    } catch (error) {
      toastError("Cập nhật độ ưu tiên thất bại!");
      console.error("Error updating issue priority:", error);
    }
  };

  const handleIssueTypeChange = async (issueId: string, newIssueType: string) => {
    const issue = [...sprintIssues, ...backlogIssues].find(i => i.id === issueId);
    if (!issue || !user || !canEditIssue(issue)) {
      toastError("Chỉ người tạo, PM hoặc admin mới được thay đổi loại issue!");
      return;
    }
    try {
      await issueService.updateIssue(issueId, { ...issue, issueType: newIssueType });
      setSprintIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, issueType: newIssueType as Issue["issueType"] } : issue
      ));
      setBacklogIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, issueType: newIssueType as Issue["issueType"] } : issue
      ));
      toastSuccess("Cập nhật loại issue thành công!");
    } catch (error) {
      toastError("Cập nhật loại issue thất bại!");
      console.error("Error updating issue type:", error);
    }
  };

  const handleAssigneeChange = async (issueId: string, assigneeId: string) => {
    const issue = [...sprintIssues, ...backlogIssues].find(i => i.id === issueId);
    if (!issue || !user || !canMoveIssue(issue)) {
      toastError("Bạn không có quyền thay đổi người được giao issue này!");
      return;
    }
    try {
      await issueService.setAssignee(issueId, assigneeId === "none" ? null : assigneeId);
      const newAssignee = assigneeId === "none" ? null : projectUsers.find(u => u.id === assigneeId);
      setSprintIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, assignee: newAssignee ? { id: newAssignee.id, name: newAssignee.name, email: newAssignee.email } : undefined } : issue
      ));
      setBacklogIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, assignee: newAssignee ? { id: newAssignee.id, name: newAssignee.name, email: newAssignee.email } : undefined } : issue
      ));
      toastSuccess("Cập nhật người được giao thành công!");
    } catch (error) {
      toastError("Cập nhật người được giao thất bại!");
      console.error("Error updating assignee:", error);
    }
  };

  const handleSprintChange = async (issueId: string, sprintId: string) => {
    const issue = [...sprintIssues, ...backlogIssues].find(i => i.id === issueId);
    if (!issue || !user || !canEditIssue(issue)) {
      toastError("Chỉ người tạo, PM hoặc admin mới được thay đổi sprint!");
      return;
    }
    try {
      // TODO: Implement API to update issue sprint
      // await issueService.updateIssueSprint(issueId, sprintId === "backlog" ? null : sprintId);
      toastSuccess("Cập nhật sprint thành công!");
      // Refresh issues
      fetchSprintIssues();
      fetchBacklogIssues();
    } catch (error) {
      toastError("Cập nhật sprint thất bại!");
      console.error("Error updating sprint:", error);
    }
  };

  const onCreateIssue = async (data: { 
    title: string; 
    description: string; 
    priority: string; 
    issueType: string; 
    assigneeId: string; 
    sprintId: string;
    startDate?: string;
    dueDate?: string;
    storyPoints?: number;
  }) => {
    setCreating(true);
    try {
      const requestBody: { 
        title: string; 
        description: string; 
        priority: string; 
        issueType: string; 
        projectId: string; 
        assigneeId?: string; 
        sprintId?: string;
        startDate?: string;
        dueDate?: string;
        storyPoints?: number;
      } = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        issueType: data.issueType,
        projectId: projectId!,
      };
      if (data.assigneeId !== "none") {
        requestBody.assigneeId = data.assigneeId;
      }
      if (data.sprintId !== "none") {
        requestBody.sprintId = data.sprintId;
      }
      if (data.startDate) {
        requestBody.startDate = data.startDate;
      }
      if (data.dueDate) {
        requestBody.dueDate = data.dueDate;
      }
      if (data.storyPoints) {
        requestBody.storyPoints = data.storyPoints;
      }
      await issueService.createIssue(requestBody);
      toastSuccess("Tạo issue thành công!");
      setIsCreateDialogOpen(false);
      reset();
      fetchBacklogIssues();
      if (currentSprint) {
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
      fetchBacklogIssues();
      if (currentSprint) {
        fetchSprintIssues();
      }
    } catch (error) {
      toastError("Tạo subtask thất bại!");
      console.error("Error creating subtask:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa issue này?')) return;
    try {
      await issueService.deleteIssue(issueId);
      setSprintIssues(prev => prev.filter(issue => issue.id !== issueId));
      setBacklogIssues(prev => prev.filter(issue => issue.id !== issueId));
      toastSuccess('Xóa issue thành công!');
    } catch {
      toastError('Xóa issue thất bại!');
    }
  };

  const handleCreateSubtask = (issue: Issue) => {
    setSelectedParentIssue(issue);
    setIsCreateSubtaskDialogOpen(true);
  };

  const tabs: ProjectTab[] = [
    { key: "overview", label: "Tổng quan" },
    { key: "list", label: "Danh sách" },
    { key: "kanban", label: "Kanban" },
    { key: "reports", label: "Báo cáo" },
    { key: "members", label: "Thành viên" },
    { key: "settings", label: "Cài đặt" },
  ];

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
      {/* Header */}
      <ProjectHeader 
        title={project?.name || ""}
        showBackButton
      />

      <div className="border-b">
        <ProjectTabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange}>
          
          {activeTab === "list" && (
            <div className="space-y-6">
              {/* Sprint Management - Chỉ hiển thị cho PM/Admin */}
              {canManageSprint() && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quản lý Sprint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SprintManagement
                      projectId={projectId!}
                      sprints={sprints}
                      onSprintUpdate={fetchSprints}
                      canManageSprint={canManageSprint()}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Current Sprint Info */}
              {currentSprint && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        Sprint: {currentSprint.name}
                        <Badge variant={currentSprint.status === "ACTIVE" ? "default" : "secondary"}>
                          {currentSprint.status === "ACTIVE" ? "Đang chạy" : "Đã lên kế hoạch"}
                        </Badge>
                      </CardTitle>
                      {currentSprint.goal && (
                        <p className="text-sm text-muted-foreground">{currentSprint.goal}</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <IssuesTable
                      issues={sprintIssues}
                      projectMembers={projectMembers}
                      sprints={sprints}
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      onIssueTypeChange={handleIssueTypeChange}
                      onAssigneeChange={handleAssigneeChange}
                      onSprintChange={handleSprintChange}
                      canEditIssue={canEditIssue}
                      canChangeStatus={canMoveIssue}
                      onDeleteIssue={handleDeleteIssue}
                      onOpenCreateIssue={() => setIsCreateDialogOpen(true)}
                      canCreateIssue={canCreateIssue()}
                      onCreateSubtask={handleCreateSubtask}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Backlog */}
              <Card>
                <CardHeader>
                  <CardTitle>Backlog</CardTitle>
                </CardHeader>
                <CardContent>
                  <IssuesTable
                    issues={backlogIssues}
                    projectMembers={projectMembers}
                    sprints={sprints}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    onIssueTypeChange={handleIssueTypeChange}
                    onAssigneeChange={handleAssigneeChange}
                    onSprintChange={handleSprintChange}
                    canEditIssue={canEditIssue}
                    canChangeStatus={canMoveIssue}
                    onDeleteIssue={handleDeleteIssue}
                    onOpenCreateIssue={() => setIsCreateDialogOpen(true)}
                    canCreateIssue={canCreateIssue()}
                    onCreateSubtask={handleCreateSubtask}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "kanban" && (
            <div className="space-y-6">
              {/* Active Sprint Kanban - Chỉ hiển thị sprint đang ACTIVE */}
              {currentSprint && currentSprint.status === "ACTIVE" ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        Sprint: {currentSprint.name}
                        <Badge variant="default">Đang chạy</Badge>
                      </CardTitle>
                      {currentSprint.goal && (
                        <p className="text-sm text-muted-foreground">{currentSprint.goal}</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <IssuesTable
                      issues={sprintIssues}
                      projectMembers={projectMembers}
                      sprints={sprints}
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      onIssueTypeChange={handleIssueTypeChange}
                      onAssigneeChange={handleAssigneeChange}
                      onSprintChange={handleSprintChange}
                      canEditIssue={canEditIssue}
                      canChangeStatus={canMoveIssue}
                      onDeleteIssue={handleDeleteIssue}
                      onOpenCreateIssue={() => setIsCreateDialogOpen(true)}
                      canCreateIssue={canCreateIssue()}
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

      {/* Create Issue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Issue mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateIssue)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <Input
                  placeholder="Tiêu đề"
                  {...register("title", { required: true })}
                />
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <Textarea
                  placeholder="Mô tả"
                  {...register("description")}
                  rows={4}
                />
              </div>
              
              {/* Priority */}
              <div>
                <Select
                  value={watch("priority")}
                  onValueChange={v => setValue("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 - Khẩn cấp</SelectItem>
                    <SelectItem value="P1">P1 - Cao</SelectItem>
                    <SelectItem value="P2">P2 - Trung bình cao</SelectItem>
                    <SelectItem value="P3">P3 - Trung bình</SelectItem>
                    <SelectItem value="P4">P4 - Thấp</SelectItem>
                    <SelectItem value="P5">P5 - Rất thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Issue Type */}
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
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sprint */}
              <div>
                <Select
                  value={watch("sprintId")}
                  onValueChange={v => setValue("sprintId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Backlog</SelectItem>
                    {sprints
                      .filter(s => s.status === "PLANNED" || s.status === "ACTIVE")
                      .map(sprint => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name} ({sprint.status === "ACTIVE" ? "Đang chạy" : "Đã lên kế hoạch"})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Assignee */}
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
              
              {/* Start Date */}
              <div>
                <Input
                  type="date"
                  placeholder="Ngày bắt đầu"
                  {...register("startDate")}
                />
              </div>
              
              {/* Due Date */}
              <div>
                <Input
                  type="date"
                  placeholder="Ngày hết hạn"
                  {...register("dueDate")}
                />
              </div>
              
              {/* Story Points */}
              <div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Story Points"
                  {...register("storyPoints", { valueAsNumber: true })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>Tạo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

export default ProjectIssuesPage; 