import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Paperclip
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import issueService from "@/service/issueService";
import ProjectService from "@/service/projectService";
import commentService, { type Comment } from "@/service/commentService";
import type { Issue, UpdateIssueRequest } from "@/types/issue";
import type { ProjectMember } from "@/types/project";
import type { Sprint } from "@/types/sprint";
import { toastSuccess, toastError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout";
import sprintService from "@/service/sprintService";
import type { User } from "@/types/user";
import { getCurrentUserRole, isCurrentUserManager } from "@/utils/projectHelpers";
import {IssueForm} from "@/components/project/IssueForm";
import attachmentService from "@/service/attachmentService";

const commentSchema = z.object({
  content: z.string().min(1, "Nội dung comment không được để trống"),
});

type CommentFormData = z.infer<typeof commentSchema>;

// Map API response to FE Issue type
const mapIssue = (issue: Record<string, unknown>): Issue => ({
  ...(issue as Issue),
  reporter: issue.reporterId
    ? {
        id: issue.reporterId as string,
        name: issue.reporterName as string,
        email: issue.reporterEmail as string,
      }
    : undefined,
  assignee: issue.assigneeId
    ? {
        id: issue.assigneeId as string,
        name: issue.assigneeName as string,
        email: issue.assigneeEmail as string,
      }
    : undefined,
});

const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [issue, setIssue] = useState<Issue | null>(null);
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

  // Thêm state cho file upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Thêm state lưu attachments cho từng comment
  const [commentAttachments, setCommentAttachments] = useState<Record<string, any[]>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (issueId) {
      fetchIssueData();
    }
  }, [issueId]);

  const fetchIssueData = async () => {
    try {
      setLoading(true);
      const issueRes = await issueService.getIssueById(issueId!);
      console.log("Issue response:", issueRes);
      setIssue(mapIssue(issueRes.result));
      
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
          setProjectMembers(membersRes.result || []);
        } catch (sprintError) {
          console.error("Lỗi khi lấy dữ liệu sprint:", sprintError);
          // Không set error chính, chỉ log và tiếp tục
          setSprints([]);
        }
      }
      
      // Fetch comments
      const commentsRes = await commentService.getCommentsByIssueId(issueId!);
      setComments(commentsRes.result || []);
      
      // Fetch subtasks if this issue has subtasks
      if (issueRes.result.subtasks && issueRes.result.subtasks.length > 0) {
        setSubtasks(issueRes.result.subtasks.map(mapIssue));
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu issue:", error);
      setError("Lỗi khi lấy dữ liệu issue");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssue = async (data: UpdateIssueRequest) => {
    if (!issue) return;
    
    setUpdating(true);
    try {
      await issueService.updateIssue(issue.id, data);
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
    
    try {
      await issueService.setAssignee(issue.id, assigneeId === "unassigned" ? undefined : assigneeId);
      const assignee = assigneeId === "unassigned" ? undefined : projectUsers.find(u => u.id === assigneeId);
      setIssue(prev => prev ? { 
        ...prev, 
        assignee: assignee ? {
          id: assignee.id,
          name: assignee.name,
          email: assignee.email
        } : undefined
      } : null);
      toastSuccess("Cập nhật người được giao thành công!");
    } catch (error) {
      toastError("Cập nhật người được giao thất bại!");
      console.error("Lỗi khi cập nhật người được giao issue:", error);
    }
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

  // Hàm upload file lên S3 và lấy metadata
  const uploadFilesToS3 = async (files: File[]) => {
    setUploading(true);
    const uploaded: any[] = [];
    for (const file of files) {
      // 1. Lấy presigned URL
      const presignedRes = await fetch('/api/attachments/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const { url, filePath } = await presignedRes.json();
      // 2. Upload file lên S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      // 3. Lưu metadata
      uploaded.push({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath,
      });
    }
    setUploading(false);
    return uploaded;
  };

  const onSubmitComment = async (data: CommentFormData) => {
    if (!issue || !user) return;
    let attachments = [];
    if (selectedFiles.length > 0) {
      attachments = await uploadFilesToS3(selectedFiles);
    }
    try {
      await commentService.createComment({
        content: data.content,
        issueId: issue.id,
        userId: user.id,
        attachments,
      });
      toastSuccess("Thêm comment thành công!");
      reset();
      setSelectedFiles([]);
      fetchIssueData();
    } catch (error) {
      toastError("Thêm comment thất bại!");
      console.error("Error creating comment:", error);
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
      isCurrentUserManager(user, project.id, project.teamId)
    );
  };

  const canComment = () => {
    if (!user || !issue || !project) return false;
    const role = getCurrentUserRole(user, issue.projectId!, project.teamId);
    return role && role !== "VIEWER";
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      toastSuccess("Xóa comment thành công!");
      fetchIssueData();
    } catch (error) {
      toastError("Xóa comment thất bại!");
      console.error("Error deleting comment:", error);
    }
  };

  // Hàm lấy attachments cho tất cả comment
  const fetchAttachmentsForComments = async (comments: Comment[]) => {
    const result: Record<string, any[]> = {};
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

  // Gọi khi fetch comment xong
  useEffect(() => {
    if (comments.length > 0) {
      fetchAttachmentsForComments(comments);
    }
  }, [comments]);

  // Component upload file đẹp cho comment
  function FileUploadInput({
    selectedFiles,
    setSelectedFiles,
    uploading
  }: {
    selectedFiles: File[];
    setSelectedFiles: (files: File[]) => void;
    uploading: boolean;
  }) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedFiles(Array.from(e.target.files || []));
    };

    const removeFile = (index: number) => {
      setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    return (
      <div className="mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Paperclip className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">Đính kèm file</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        {selectedFiles.length > 0 && (
          <ul className="mt-2 space-y-1">
            {selectedFiles.map((file, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm bg-muted rounded px-2 py-1">
                <span className="truncate max-w-xs">{file.name}</span>
                <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeFile(idx)}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {uploading && <div className="text-xs text-blue-500 mt-1">Đang upload file...</div>}
      </div>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                        </div>
                        {/* Hiển thị file đính kèm */}
                        {commentAttachments[comment.id] && commentAttachments[comment.id].length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-semibold mb-1">File đính kèm:</div>
                            <ul className="list-disc ml-4">
                              {commentAttachments[comment.id].map((file) => (
                                <li key={file.id}>
                                  <a href={`https://${bucketName}.s3.${region}.amazonaws.com/${file.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    {file.fileName}
                                  </a>
                                  <span className="ml-2 text-xs text-muted-foreground">({Math.round(file.fileSize/1024)} KB)</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Comment Form */}
                {canComment() ? (
                <form onSubmit={handleSubmit(onSubmitComment)} className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Thêm comment..."
                    {...register("content")}
                    rows={3}
                  />
                  <FileUploadInput
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    uploading={uploading}
                  />
                  {errors.content && (
                    <span className="text-xs text-red-500">{errors.content.message}</span>
                  )}
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Đang gửi..." : "Gửi comment"}
                  </Button>
                </form>
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
                  <div className="space-y-3">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{subtask.priority}</Badge>
                          <div>
                            <div className="font-medium text-sm">{subtask.title}</div>
                            <div className="text-xs text-muted-foreground">{subtask.key}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(subtask.status)}`}>
                            {getStatusLabel(subtask.status)}
                          </Badge>
                          {subtask.assignee && (
                            <div className="flex items-center gap-1">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback>{subtask.assignee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{subtask.assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
                        <SelectItem value="TO_DO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
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
                    <div className="text-sm font-medium">{issue.projectName || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{issue.projectKey || "N/A"}</div>
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
                      <div className="text-sm font-medium">{issue.parentTitle || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {issue.parentKey || issue.parentId}
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

                {/* Assignee */}
                <div>
                  <Label className="text-sm font-medium">Người được giao</Label>
                  {canEditIssue() ? (
                    <Select 
                      value={issue.assignee?.id || "unassigned"} 
                      onValueChange={handleAssigneeChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
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
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Issue Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Issue</DialogTitle>
            </DialogHeader>
            <IssueForm
              initialValues={issue}
              onSubmit={handleUpdateIssue}
              loading={updating}
              projectMembers={projectMembers}
              sprints={sprints}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
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
      </div>
    </Layout>
  );
};

export default IssueDetailPage; 