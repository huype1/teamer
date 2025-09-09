import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Calendar,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import issueService from "@/service/issueService";
import ProjectService from "@/service/projectService";
import commentService, { type Comment } from "@/service/commentService";
import type {CreateIssueRequest, Issue, UpdateIssueRequest} from "@/types/issue";
import type { ProjectMember } from "@/types/project";
import type { Sprint } from "@/types/sprint";
import { toastSuccess, toastError } from "@/utils/toast";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
import { Layout } from "@/components/layout";
import sprintService from "@/service/sprintService";
import type { User } from "@/types/user";
import { isCurrentUserManager, isCurrentUserNonViewer} from "@/utils/projectHelpers";
import {IssueForm} from "@/components/project/IssueForm";
import type { IssueFormValues } from "@/components/project/IssueForm";
import attachmentService, { type Attachment } from "@/service/attachmentService";
import { IssuesTable } from "@/components/project/IssuesTable";
// import { useWebSocket } from "@/hooks/useWebSocket";
import type { CommentMessage } from "@/service/websocketService";
import websocketService from "@/service/websocketService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AttachmentList } from "@/components/ui/attachment-list";
import MessageComposer from "@/components/ui/message-composer";
import { handleAssigneeChange as handleAssigneeChangeHelper, mapIssueAllTypes } from "@/utils/issueHelpers";

// Comment handled by MessageComposer

// Use helper function for mapping issues
const mapIssue = mapIssueAllTypes;

const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [rawIssueData, setRawIssueData] = useState<{ sprintId?: string; storyPoints?: number; dueDate?: string; projectName?: string; projectKey?: string; parentTitle?: string; parentKey?: string } | null>(null); // Store raw data for subtask creation
  const [project, setProject] = useState<{ id: string; name: string; members: ProjectMember[] } | null>(null);

  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subtasks, setSubtasks] = useState<Issue[]>([]);
  const [updating, setUpdating] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  console.log('subtasks', subtasks);

  // State for comment attachments
  const [commentAttachments, setCommentAttachments] = useState<Record<string, Attachment[]>>({});

  // State for create subtask dialog
  const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);

  // WebSocket integration
  // const { subscribeToComments, unsubscribeFromComments } = useWebSocket(issueId);

  // WebSocket comment handling
  useEffect(() => {
    if (issueId) {
      const handleCommentMessage = async (message: CommentMessage) => {
        if (message.type === 'CREATE') {
          const newComment: Comment = {
            id: message.commentId,
            content: message.content || '',
            createdAt: message.createdAt || new Date().toISOString(),
            updatedAt: message.updatedAt || new Date().toISOString(),
            user: {
              id: message.userId || '',
              name: message.userName || '',
              email: message.userEmail || '',
              avatarUrl: message.userAvatarUrl || '',
            },
          };
          setComments(prev => [...prev, newComment]);
        } else if (message.type === 'UPDATE') {
          setComments(prev => prev.map(comment => 
            comment.id === message.commentId 
              ? { ...comment, content: message.content || '', updatedAt: message.updatedAt || new Date().toISOString() }
              : comment
          ));
        } else if (message.type === 'DELETE') {
          setComments(prev => prev.filter(comment => comment.id !== message.commentId));
        }
      };
      
      websocketService.onConnect(() => {
        websocketService.subscribeToIssueComments(issueId, handleCommentMessage);
      });
      
      // Cleanup function
      return () => {
        websocketService.unsubscribeFromIssueComments(issueId);
      };
    }
  }, [issueId]); // Only depend on issueId

  // Handler for creating subtask
  const handleCreateSubtask = async (data: import("@/components/project/IssueForm").IssueFormValues) => {
    try {
      const requestBody: CreateIssueRequest = {
        title: data.title,
        description: data.description || "",
        priority: data.priority,
        issueType: "SUBTASK",
        projectId: issue?.projectId as string,
        parentId: issue?.id,
      };
      if (data.assigneeId && data.assigneeId !== "none") requestBody.assigneeId = data.assigneeId;
      if (data.sprintId && data.sprintId !== "backlog" && data.sprintId !== "none") requestBody.sprintId = data.sprintId;
      // Ensure subtask inherits parent's sprint if available
      if (!requestBody.sprintId && rawIssueData?.sprintId) {
        requestBody.sprintId = rawIssueData.sprintId as string;
      }
      if (data.storyPoints !== undefined) requestBody.storyPoints = data.storyPoints;
      if (data.startDate) requestBody.startDate = data.startDate;
      if (data.dueDate) requestBody.dueDate = data.dueDate;
      await issueService.createIssue(requestBody);
      toastSuccess("Tạo subtask thành công!");
      setIsCreateSubtaskOpen(false);
      fetchIssueData();
    } catch {
      toastError("Tạo subtask thất bại!");
    }
  };

  // Removed react-hook-form for comments (handled in MessageComposer)

  const fetchIssueData = useCallback(async () => {
    try {
      setLoading(true);
      const issueRes = await issueService.getIssueById(issueId!);
      setIssue(mapIssue(issueRes.result));
      setRawIssueData(issueRes.result as { sprintId?: string; storyPoints?: number; dueDate?: string; projectName?: string; projectKey?: string; parentTitle?: string; parentKey?: string });
      
      if (issueRes.result.projectId) {
        try {
          const [projectRes, usersRes, sprintsRes] = await Promise.all([
            ProjectService.getProjectById(issueRes.result.projectId),
            ProjectService.getProjectUsers(issueRes.result.projectId),
            sprintService.getSprintsByProject(issueRes.result.projectId)
          ]);
          setProject(projectRes.result);
          setProjectUsers(usersRes.result || []);
          setSprints(sprintsRes.result || []);
          const membersRes = await ProjectService.getProjectMembers(issueRes.result.projectId);
          console.log('Project members:', membersRes.result);
          setProjectMembers(membersRes.result || []);
        } catch (sprintError) {
          console.error("Lỗi khi lấy dữ liệu sprint:", sprintError);
          setSprints([]);
        }
      }
      
      const commentsRes = await commentService.getCommentsByIssueId(issueId!);
      setComments(commentsRes.result || []);
      
      if (issueRes.result.subtasks) {
        const mappedSubtasks = issueRes.result.subtasks.map(mapIssue);
        console.log('Raw subtasks from API:', issueRes.result.subtasks);
        console.log('Mapped subtasks:', mappedSubtasks);
        setSubtasks(mappedSubtasks);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu issue:", error);
      setError("Lỗi khi lấy dữ liệu issue");
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    if (issueId) {
      fetchIssueData();
    }
  }, [issueId, fetchIssueData]);

  const handleUpdateIssue = async (form: IssueFormValues) => {
    if (!issue) return;
    
    setUpdating(true);
    try {
      // Sanitize payload: map backlog/none/empty strings to undefined
      const payload: UpdateIssueRequest = {};
      if (typeof form.title === 'string' && form.title.trim() !== '') payload.title = form.title;
      if (typeof form.description === 'string') payload.description = form.description.trim() === '' ? undefined : form.description;
      if (form.priority) payload.priority = form.priority;
      if (form.issueType) payload.issueType = form.issueType;
      if (form.assigneeId && form.assigneeId !== 'none') payload.assigneeId = form.assigneeId;
      if (form.sprintId && form.sprintId !== 'backlog' && form.sprintId !== 'none') payload.sprintId = form.sprintId;
      if (typeof form.parentId === 'string' && form.parentId.trim() !== '') payload.parentId = form.parentId;
      if (typeof form.startDate === 'string' && form.startDate.trim() !== '') payload.startDate = form.startDate;
      if (typeof form.dueDate === 'string' && form.dueDate.trim() !== '') payload.dueDate = form.dueDate;
      if (typeof form.storyPoints === 'number') payload.storyPoints = form.storyPoints;

      await issueService.updateIssue(issue.id, payload);
      toastSuccess("Cập nhật issue thành công!");
      setEditDialogOpen(false);
      fetchIssueData(); // Refresh data
    } catch (error) {
      toastError("Cập nhật issue thất bại!");
      console.error("Lỗi khi cập nhật issue:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!issue || !user) return;
    
    try {
      await issueService.updateIssueStatus(issue.id, newStatus);
      setIssue(prev => prev ? { ...prev, status: newStatus as Issue['status'] } : null);
      toastSuccess("Cập nhật trạng thái thành công!");
    } catch (error) {
      toastError("Cập nhật trạng thái thất bại!");
      console.error("Lỗi khi cập nhật trạng thái issue:", error);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!issue || !user) return;
    
    try {
      await issueService.updateIssue(issue.id, { ...issue, priority: newPriority });
      setIssue(prev => prev ? { ...prev, priority: newPriority as Issue['priority'] } : null);
      toastSuccess("Cập nhật độ ưu tiên thành công!");
    } catch (error) {
      toastError("Cập nhật độ ưu tiên thất bại!");
      console.error("Lỗi khi cập nhật độ ưu tiên issue:", error);
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    if (!issue || !user) return;
    
    await handleAssigneeChangeHelper(issue.id, assigneeId, () => {
      const assignee = assigneeId === "unassigned" ? undefined : projectUsers.find(u => u.id === assigneeId);
      setIssue(prev => prev ? { 
        ...prev, 
        assignee: assignee ? {
          id: assignee.id,
          name: assignee.name,
          email: assignee.email
        } : undefined
      } : null);
    });
  };

  const handleDelete = async () => {
    if (!issue) return;
    
    try {
      await issueService.deleteIssue(issue.id);
      toastSuccess("Xóa issue thành công!");
      navigate(`/projects/${issue.projectId}/issues`);
    } catch (error) {
      toastError("Xóa issue thất bại!");
      console.error("Lỗi khi xóa issue:", error);
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-800";
      case "P1":
        return "bg-orange-100 text-orange-800";
      case "P2":
        return "bg-yellow-100 text-yellow-800";
      case "P3":
        return "bg-green-100 text-green-800";
      case "P4":
        return "bg-blue-100 text-blue-800";
      case "P5":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "TO_DO":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "TO_DO":
        return "Cần làm";
      case "IN_PROGRESS":
        return "Đang làm";
      case "IN_REVIEW":
        return "Đang review";
      case "DONE":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  const canEditIssue = () => {
    if (!user || !issue || !project) return false;
    const member = projectMembers.find(m => m.userId === user.id);
    return issue.reporter?.id === user.id || member?.role === "ADMIN" || member?.role === "PM";
  };

  const canChangeStatus = () => {
    if (!user || !issue || !project) return false;
    return (
      issue.assignee?.id === user.id ||
      issue.reporter?.id === user.id ||
      isCurrentUserManager(user, project.id)
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const fetchAttachmentsForComments = async (comments: Comment[]) => {
    const result: Record<string, Attachment[]> = {};
    for (const c of comments) {
      try {
        const res = await attachmentService.getByCommentId(c.id);
        result[c.id] = res;
      } catch {
        result[c.id] = [];
      }
    }
    setCommentAttachments(result);
  };

  useEffect(() => {
    if (comments.length > 0) {
      fetchAttachmentsForComments(comments);
    }
  }, [comments]);



  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) return <Layout><div className="text-red-500 p-4">{error}</div></Layout>;
  if (!issue) return <Layout><div className="p-4">Issue not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/projects/${issue.projectId}/issues`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{issue.title}</h1>
                <Badge variant="outline">{issue.key}</Badge>
                {canEditIssue() && issue.issueType !== "SUBTASK" && <Button size="sm" variant="outline" className="ml-2" onClick={() => setIsCreateSubtaskOpen(true)}>
                  <Zap className="w-4 h-4 mr-1" /> Tạo subtask
                </Button>}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Tạo ngày {new Date(issue.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {issue.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Hạn: {new Date(issue.dueDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {canEditIssue() && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </Button>
            )}
            {canEditIssue() && (
              <Button variant="destructive" size="sm" className="gap-2" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4" />
                Xóa
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                {issue.description ? (
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {issue.description}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Không có mô tả</p>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Chưa có comment nào</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 border rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.user.avatarUrl} />
                          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                                                 <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-2">
                               <span className="font-medium text-sm">{comment.user.name}</span>
                               <span className="text-xs text-muted-foreground">
                                 {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                               </span>
                             </div>
                             {user && comment.user.id === user.id && (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleDeleteComment(comment.id)}
                                 className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             )}
                           </div>
                           <div className="whitespace-pre-wrap text-sm">{comment.content}</div>
                           {/* Display attachments */}
                           <AttachmentList attachments={commentAttachments[comment.id] || []} />
                         </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Comment Form (reused component) */}
                {user && issue && isCurrentUserNonViewer(user, project.id) ? (
                  <div className="mt-4">
                    <MessageComposer
                      placeholder="Thêm comment..."
                      submitLabel="Gửi comment"
                      onSubmit={async ({ content, attachments }) => {
                        await commentService.createComment({
                          content,
                          issueId: issue.id,
                          userId: user.id,
                          attachments,
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                    Bạn không có quyền thêm comment
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subtasks */}
            {subtasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Subtasks ({subtasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <IssuesTable
                      issues={subtasks}
                      allIssues={subtasks}
                      projectMembers={projectMembers}
                      sprints={sprints}
                      onStatusChange={async (issueId, newStatus) => {
                        try {
                          await issueService.updateIssueStatus(issueId, newStatus);
                          toastSuccess("Cập nhật trạng thái subtask thành công!");
                          fetchIssueData(); // Refresh data
                        } catch (error) {
                          toastError("Cập nhật trạng thái subtask thất bại!");
                          console.error("Lỗi khi cập nhật trạng thái subtask:", error);
                        }
                      }}
                      onPriorityChange={async (issueId, newPriority) => {
                        try {
                          await issueService.updateIssue(issueId, { priority: newPriority });
                          toastSuccess("Cập nhật độ ưu tiên subtask thành công!");
                          fetchIssueData(); // Refresh data
                        } catch (error) {
                          toastError("Cập nhật độ ưu tiên subtask thất bại!");
                          console.error("Lỗi khi cập nhật độ ưu tiên subtask:", error);
                        }
                      }}
                      onIssueTypeChange={async (issueId, newIssueType) => {
                        try {
                          await issueService.updateIssue(issueId, { issueType: newIssueType });
                          toastSuccess("Cập nhật loại issue thành công!");
                          fetchIssueData(); // Refresh data
                        } catch (error) {
                          toastError("Cập nhật loại issue thất bại!");
                          console.error("Lỗi khi cập nhật loại issue:", error);
                        }
                      }}
                      onAssigneeChange={async (issueId, assigneeId) => {
                        await handleAssigneeChangeHelper(issueId, assigneeId, () => {
                          fetchIssueData(); // Refresh data
                        });
                      }}
                      canEditIssue={(subtask) => {
                        if (!user || !project) return false;
                        const member = projectMembers.find(m => m.userId === user.id);
                        return subtask.reporter?.id === user.id || member?.role === "ADMIN" || member?.role === "PM";
                      }}
                      canChangeStatus={(subtask) => {
                        if (!user || !project) return false;
                        return (
                          subtask.assignee?.id === user.id ||
                          subtask.reporter?.id === user.id ||
                          isCurrentUserManager(user, project.id)
                        );
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết Issue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Issue Type */}
                <div>
                  <Label className="text-sm font-medium">Loại Issue</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {issue.issueType || "N/A"}
                    </Badge>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  {canChangeStatus() ? (
                    <Select value={issue.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                                        <SelectItem value="TO_DO">Cần làm</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                <SelectItem value="IN_REVIEW">Đang review</SelectItem>
                <SelectItem value="DONE">Đã hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`mt-1 ${getStatusColor(issue.status)}`}>
                      {getStatusLabel(issue.status)}
                    </Badge>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-sm font-medium">Độ ưu tiên</Label>
                  {canEditIssue() ? (
                    <Select value={issue.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
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
                  ) : (
                    <Badge className={`mt-1 ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </Badge>
                  )}
                </div>

                {/* Project Info */}
                <div>
                  <Label className="text-sm font-medium">Dự án</Label>
                  <div className="mt-1">
                    <div className="text-sm font-medium">{rawIssueData?.projectName ?? "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{rawIssueData?.projectKey ?? "N/A"}</div>
                  </div>
                </div>

                {/* Sprint Info */}
                {issue.sprintId && (
                  <div>
                    <Label className="text-sm font-medium">Sprint</Label>
                    <div className="mt-1">
                      <div className="text-sm font-medium">
                        {sprints.find(s => s.id === issue.sprintId)?.name || "N/A"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Parent Issue */}
                {issue.parentId && (
                  <div>
                    <Label className="text-sm font-medium">Issue cha</Label>
                    <div className="mt-1">
                      <div className="text-sm font-medium">{rawIssueData?.parentTitle ?? "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {rawIssueData?.parentKey ?? issue.parentId}
                      </div>
                    </div>
                  </div>
                )}

                {/* Story Points */}
                <div>
                  <Label className="text-sm font-medium">Story Points</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{issue.storyPoints || "N/A"}</span>
                  </div>
                </div>

                {/* Start Date */}
                {issue.startDate && (
                  <div>
                    <Label className="text-sm font-medium">Ngày bắt đầu</Label>
                    <div className="mt-1">
                      <span className="text-sm">
                        {new Date(issue.startDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Due Date */}
                {issue.dueDate && (
                  <div>
                    <Label className="text-sm font-medium">Hạn hoàn thành</Label>
                    <div className="mt-1">
                      <span className="text-sm">
                        {new Date(issue.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Created At */}
                <div>
                  <Label className="text-sm font-medium">Ngày tạo</Label>
                  <div className="mt-1">
                    <span className="text-sm">
                      {new Date(issue.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Reporter */}
                <div>
                  <Label className="text-sm font-medium">Người tạo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{issue.reporter?.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{issue.reporter?.name || "N/A"}</div>
                      {issue.reporter?.email && (
                        <div className="text-xs text-muted-foreground">{issue.reporter.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Người được giao</Label>
                  {canEditIssue() ? (
                    <Select 
                      value={issue.assignee?.id || "unassigned"} 
                      onValueChange={handleAssigneeChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chưa phân công" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Chưa phân công</SelectItem>
                        {projectUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {issue.assignee ? (
                        <>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>{issue.assignee.name?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{issue.assignee.name || "N/A"}</div>
                            {issue.assignee.email && (
                              <div className="text-xs text-muted-foreground">{issue.assignee.email}</div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa phân công</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Issue</DialogTitle>
            </DialogHeader>
            <IssueForm
              initialValues={{
                title: issue.title,
                description: issue.description,
                priority: issue.priority,
                issueType: issue.issueType === "EPIC" ? "TASK" : (issue.issueType as "STORY" | "TASK" | "BUG" | "SUBTASK"),
                assigneeId: issue.assignee?.id,
                sprintId: issue.sprintId,
                storyPoints: issue.storyPoints,
                startDate: issue.startDate,
                dueDate: issue.dueDate,
                parentId: issue.parentId,
              }}
              onSubmit={handleUpdateIssue}
              loading={updating}
              projectMembers={projectMembers}
              projectUsers={projectUsers}
              sprints={sprints}
              isEdit={true}
              disableIssueType={issue.issueType === "SUBTASK"}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xóa Issue</DialogTitle>
            </DialogHeader>
            <p>Bạn có chắc chắn muốn xóa issue "{issue.title}"? Hành động này không thể hoàn tác.</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Xóa Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateSubtaskOpen} onOpenChange={setIsCreateSubtaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Subtask cho: {issue.title}</DialogTitle>
            </DialogHeader>
            <IssueForm
              onSubmit={handleCreateSubtask}
              loading={false}
              projectMembers={projectMembers}
              projectUsers={projectUsers}
              sprints={sprints}
              initialValues={{ parentId: issue.id }}
              isEdit={false}
              disableIssueType
              params={{
                isSubtask: true,
                parentIssue: {
                  sprintId: rawIssueData?.sprintId,
                  storyPoints: rawIssueData?.storyPoints || undefined,
                  dueDate: rawIssueData?.dueDate || undefined,
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default IssueDetailPage; 