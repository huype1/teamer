import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IssuesTable, SprintIssuesCombinedTable } from "@/components/project";
import SprintManagement from "@/components/project/SprintManagement";
import sprintService from "@/service/sprintService";
import issueService from "@/service/issueService";
import projectService from "@/service/projectService";
import { toastError, toastSuccess } from "@/utils/toast";
import type { Sprint } from "@/types/sprint";
import type { CreateIssueRequest, Issue } from "@/types/issue";
import type { ProjectMember } from "@/types/project";
import type { Project } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { fetchUserInfo } from "@/store/authReducer";
import { Plus } from "lucide-react";
import { formatDateForAPI, formatEndDateForAPI } from "@/utils/dateUtils";
import { ProjectHeader, ProjectNavigation } from "@/components/project";
import ProjectService from "@/service/projectService";
import { isCurrentUserManager } from "@/utils/projectHelpers";
import { IssueForm, type IssueFormValues } from "@/components/project/IssueForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  handleAssigneeChange as handleAssigneeChangeHelper,
  handleStatusChange as handleStatusChangeHelper,
  handlePriorityChange as handlePriorityChangeHelper,
  handleIssueTypeChange as handleIssueTypeChangeHelper,
  handleSprintChange as handleSprintChangeHelper,
  mapIssue
} from "@/utils/issueHelpers";

const ProjectIssuesTablePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectUsers, setProjectUsers] = useState<{ id: string; name: string; email?: string }[]>([]);
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


  // fetchBacklogIssues
  const fetchBacklogIssues = useCallback(async () => {
    try {
      const response = await sprintService.getBacklogIssues(projectId!);
      const mappedIssues = (response.result || [])
        .map(mapIssue)
        .filter((issue): issue is Issue => issue !== null);
      setBacklogIssues(mappedIssues);
    } catch (error) {
      console.error("Error fetching backlog:", error);
      toastError("Không thể tải backlog!");
    }
  }, [projectId]);

  // fetchProjectMembers
  const fetchProjectMembers = useCallback(async () => {
    try {
      const [membersResponse, usersResponse] = await Promise.all([
        projectService.getProjectMembers(projectId!),
        projectService.getProjectUsers(projectId!)
      ]);
      
      const members = membersResponse.result || [];
      const users = usersResponse.result || [];
      setProjectUsers(users);
      
      // Merge members with user data
      const mergedMembers = members.map(member => ({
        ...member,
        user: users.find(user => user.id === member.userId)
      }));
      
      setProjectMembers(mergedMembers);
    } catch (error) {
      console.error("Error fetching project members:", error);
      toastError("Không thể tải danh sách thành viên!");
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        try {
          if (!user?.projectMembers) {
            // @ts-expect-error - Redux dispatch type issue
            dispatch(fetchUserInfo());
          }
          
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
  }, [projectId, user?.projectMembers, dispatch, fetchProject, fetchSprints, fetchBacklogIssues, fetchProjectMembers]);

  const getCurrentUserProjectMember = () => {
    if (!user || !projectId) return null;
    const member = user.projectMembers?.find(m => m.projectId === projectId) || null;
    // console.log('getCurrentUserProjectMember:', { 
    //   userId: user.id, 
    //   projectId, 
    //   projectIdType: typeof projectId,
    //   userProjectMembers: user.projectMembers?.map(pm => ({ 
    //     projectId: pm.projectId, 
    //     projectIdType: typeof pm.projectId,
    //     role: pm.role 
    //   })),
    //   foundMember: member 
    // });
    return member;
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
    await handleStatusChangeHelper(issueId, newStatus, () => {
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1);
    });
  };

  const handlePriorityChange = async (issueId: string, newPriority: string) => {
    await handlePriorityChangeHelper(issueId, newPriority, () => {
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1);
    });
  };

  const handleIssueTypeChange = async (issueId: string, newIssueType: string) => {
    await handleIssueTypeChangeHelper(issueId, newIssueType, () => {
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1);
    });
  };

  const handleAssigneeChange = async (issueId: string, assigneeId: string) => {
    await handleAssigneeChangeHelper(issueId, assigneeId, () => {
      fetchBacklogIssues();
      setSprintReloadKey(prev => prev + 1);
    });
  };

  const handleSprintChange = async (issueId: string, sprintId: string) => {
    await handleSprintChangeHelper(issueId, sprintId, () => {
      fetchBacklogIssues();
      fetchSprints();
      setSprintReloadKey(prev => prev + 1);
    });
  };



  const canManageIssue = () => {
    if (!user || !projectId) return false;
    const result = isCurrentUserManager(user, projectId!);
    // console.log('canManageIssue', { user, projectId, result });
    return result;
  };

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
    const isReporter = String(issue.reporter?.id) === String(user.id);
    const isAdmin = currentUserMember?.role === "ADMIN";
    const isPM = currentUserMember?.role === "PM";
    const result = isReporter || isAdmin || isPM;
    
    // console.log('canEditIssue check:', { 
    //   userId: user.id, 
    //   issueReporterId: issue.reporter?.id, 
    //   isReporter,
    //   currentUserMember, 
    //   isAdmin,
    //   isPM,
    //   result,
    //   issueTitle: issue.title 
    // });
    return result;
  };

  const canChangeStatus = (issue: Issue) => {
    if (!user) return false;
    const currentUserMember = getCurrentUserProjectMember();
    const result = issue.assignee?.id === user.id || issue.reporter?.id === user.id || currentUserMember?.role === "ADMIN" || currentUserMember?.role === "PM";
    // console.log('canChangeStatus', { user, issue, currentUserMember, result });
    return result;
  };

  const onCreateIssue = async (data: import("@/components/project/IssueForm").IssueFormValues) => {
    try {
      const requestBody: CreateIssueRequest = {
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

  const canCreateIssue = () => {
    if (!user || !projectId) return false;
    const currentUserMember = getCurrentUserProjectMember();
    return !!(currentUserMember && (currentUserMember.role === "ADMIN" || currentUserMember.role === "PM"));
  };

  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [deleteIssue, setDeleteIssue] = useState<Issue | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openEditIssueDialog = (issue: Issue) => {
    setEditIssue(issue);
    setIsEditDialogOpen(true);
  };

  const toIssueFormInitialValues = (issue: Issue): Partial<IssueFormValues> => ({
    title: issue.title,
    description: issue.description || "",
    priority: issue.priority as IssueFormValues["priority"],
    issueType: issue.issueType as IssueFormValues["issueType"],
    assigneeId: issue.assignee?.id || "none",
    sprintId: issue.sprintId || "backlog",
    storyPoints: issue.storyPoints,
    startDate: issue.startDate || "",
    dueDate: issue.dueDate || "",
    parentId: issue.parentId || "",
  });
  const openDeleteIssueDialog = (issue: Issue) => {
    setDeleteIssue(issue);
    setIsDeleteDialogOpen(true);
  };

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
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const visibleSprints = sprints.filter(sprint => 
    sprint.status !== "COMPLETED" && sprint.status !== "CANCELLED"
  );
  
  const activeSprint = visibleSprints.find(s => s.status === "ACTIVE");

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        title={`${project?.name || ""} - Backlog & Sprint`}
        showBackButton
      />

      <ProjectNavigation projectId={projectId!} activeTab="issues" />

      <div className="space-y-6">
        {(canManageSprint() || visibleSprints.length > 0) && (
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
            {visibleSprints.length > 0 && (
              <div className="space-y-4" style={{ maxWidth: '100%' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleSprints.map((sprint) => (
                    <SprintManagement
                      key={sprint.id}
                      sprint={sprint}
                      canManageSprint={canManageSprint()}
                      onSprintUpdated={() => {
                        fetchSprints();
                        setSprintReloadKey(prev => prev + 1);
                      }}
                      onSprintDeleted={() => {
                        fetchSprints();
                        fetchBacklogIssues();
                        setSprintReloadKey(prev => prev + 1);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {visibleSprints.length > 0 && (
              <div className="space-y-4" style={{ maxWidth: '100%' }}>
                <h3 className="text-lg font-semibold">Issues trong Sprint</h3>
                {visibleSprints.map((sprint) => (
                  <SprintIssuesCombinedTable
                    key={sprint.id}
                    sprint={sprint}
                    sprints={visibleSprints}
                    projectMembers={projectMembers}
                    canEditIssue={canEditIssue}
                    canChangeStatus={canChangeStatus}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    onIssueTypeChange={handleIssueTypeChange}
                    onAssigneeChange={handleAssigneeChange}
                    onSprintChange={handleSprintChange}
                    onStartSprint={onStartSprint}
                    onEndSprint={onEndSprint}
                    onCancelSprint={onCancelSprint}
                    activeSprintId={activeSprint?.id}
                    sprintReloadKey={sprintReloadKey}
                    canManageSprint={canManageSprint()}
                    onOpenCreateIssue={() => setIsCreateIssueDialogOpen(true)}
                    onEditIssue={openEditIssueDialog}
                    onDeleteIssue={openDeleteIssueDialog}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="w-full max-w-full">
          <Card>
            <CardHeader>
              <CardTitle>Backlog</CardTitle>
            </CardHeader>
            <CardContent>
              <IssuesTable
                issues={backlogIssues}
                allIssues={backlogIssues}
                projectMembers={projectMembers}
                sprints={visibleSprints}
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
            projectUsers={projectUsers}
            sprints={visibleSprints}
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
              projectUsers={projectUsers}
                          sprints={visibleSprints}
            initialValues={toIssueFormInitialValues(editIssue)}
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
