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
  Clock
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import issueService from "@/service/issueService";
import ProjectService from "@/service/projectService";
import commentService, { type Comment } from "@/service/commentService";
import type { Issue } from "@/types/issue";
import type { ProjectMember } from "@/types/project";
import { toastSuccess, toastError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout";

const commentSchema = z.object({
  content: z.string().min(1, "Nội dung comment không được để trống"),
});

type CommentFormData = z.infer<typeof commentSchema>;

const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [project, setProject] = useState<{ id: string; name: string; members: ProjectMember[] } | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

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
    console.log(issue)
  }, [issueId]);

  const fetchIssueData = async () => {
    try {
      setLoading(true);
      const issueRes = await issueService.getIssueById(issueId!);
      console.log(issueRes)
      setIssue(mapIssue(issueRes.result));
      
      if (issueRes.result.projectId) {
        const [projectRes, membersRes] = await Promise.all([
          ProjectService.getProjectById(issueRes.result.projectId),
          ProjectService.getProjectMembers(issueRes.result.projectId)
        ]);
        setProject(projectRes.result);
        setProjectMembers(membersRes.result || []);
      }
      
      // Fetch comments
      const commentsRes = await commentService.getCommentsByIssueId(issueId!);
      setComments(commentsRes.result || []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu issue:", error);
      setError("Lỗi khi lấy dữ liệu issue");
    } finally {
      setLoading(false);
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
      await issueService.setAssignee(issue.id, assigneeId);
      const assignee = projectMembers.find(member => member.user.id === assigneeId)?.user;
      setIssue(prev => prev ? { ...prev, assignee } : null);
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

  const onSubmitComment = async (data: CommentFormData) => {
    if (!issue || !user) return;
    
    try {
      await commentService.createComment({
        content: data.content,
        issueId: issue.id,
        userId: user.id,
      });
      toastSuccess("Thêm comment thành công!");
      reset();
      // Refresh comments
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
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "IN_REVIEW":
        return "In Review";
      case "DONE":
        return "Done";
      default:
        return status;
    }
  };

  const canEditIssue = () => {
    if (!user || !issue) return false;
    return (
      issue.reporter?.id === user.id ||
      project?.members.some((m: ProjectMember) => m.user.id === user.id && m.role === "PM") ||
      project?.members.some((m: ProjectMember) => m.user.id === user.id && m.role === "ADMIN")
    );
  };

  const canChangeStatus = () => {
    if (!user || !issue) return false;
    return issue.assignee?.id === user.id;
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

  // Map API response to FE Issue type
  const mapIssue = (issue: any): Issue => ({
    ...issue,
    reporter: issue.reporterId
      ? {
          id: issue.reporterId,
          name: issue.reporterName,
          email: issue.reporterEmail,
        }
      : undefined,
    assignee: issue.assigneeId
      ? {
          id: issue.assigneeId,
          name: issue.assigneeName,
          email: issue.assigneeEmail,
        }
      : undefined,
  });

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
              <Button variant="outline" size="sm" className="gap-2">
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
                <p className="text-muted-foreground">
                  {issue.description || "Không có mô tả"}
                </p>
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
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Comment Form */}
                <form onSubmit={handleSubmit(onSubmitComment)} className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Thêm comment..."
                    {...register("content")}
                    rows={3}
                  />
                  {errors.content && (
                    <span className="text-xs text-red-500">{errors.content.message}</span>
                  )}
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Đang gửi..." : "Gửi comment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết Issue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {/* Reporter */}
                <div>
                  <Label className="text-sm font-medium">Người tạo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={issue.reporter?.avatarUrl} />
                      <AvatarFallback>{issue.reporter?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{issue.reporter?.name || "N/A"}</span>
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
                        {projectMembers.map((member) => (
                          <SelectItem key={member.user.id} value={member.user.id}>
                            {member.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {issue.assignee ? (
                        <>
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={issue.assignee.avatarUrl} />
                            <AvatarFallback>{issue.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{issue.assignee.name}</span>
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