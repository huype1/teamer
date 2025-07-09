import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Issue, UpdateIssueRequest } from "@/types/issue";
import type { Sprint } from "@/types/sprint";
import type { User } from "@/types/user";

const editIssueSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  priority: z.string().min(1, "Độ ưu tiên không được để trống"),
  issueType: z.string().min(1, "Loại issue không được để trống"),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  storyPoints: z.number().min(0).max(100).optional(),
});

type EditIssueFormData = z.infer<typeof editIssueSchema>;

interface EditIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: Issue | null;
  sprints: Sprint[];
  projectUsers: User[];
  onSubmit: (data: UpdateIssueRequest) => Promise<void>;
  loading?: boolean;
}

const EditIssueDialog: React.FC<EditIssueDialogProps> = ({
  open,
  onOpenChange,
  issue,
  sprints,
  projectUsers,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditIssueFormData>({
    resolver: zodResolver(editIssueSchema),
    defaultValues: {
      title: issue?.title || "",
      description: issue?.description || "",
      priority: issue?.priority || "P3",
      issueType: issue?.issueType || "TASK",
      assigneeId: issue?.assignee?.id || "none",
      sprintId: issue?.sprintId || "none",
      startDate: issue?.startDate ? issue.startDate.split('T')[0] : "",
      dueDate: issue?.dueDate ? issue.dueDate.split('T')[0] : "",
      storyPoints: issue?.storyPoints || undefined,
    },
  });

  React.useEffect(() => {
    if (issue) {
      reset({
        title: issue.title,
        description: issue.description || "",
        priority: issue.priority,
        issueType: issue.issueType,
        assigneeId: issue.assignee?.id || "none",
        sprintId: issue.sprintId || "none",
        startDate: issue.startDate ? issue.startDate.split('T')[0] : "",
        dueDate: issue.dueDate ? issue.dueDate.split('T')[0] : "",
        storyPoints: issue.storyPoints || undefined,
      });
    }
  }, [issue, reset]);

  const handleFormSubmit = async (data: EditIssueFormData) => {
    const updateData: UpdateIssueRequest = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      issueType: data.issueType,
      assigneeId: data.assigneeId === "none" ? undefined : data.assigneeId,
      sprintId: data.sprintId === "none" ? undefined : data.sprintId,
      startDate: data.startDate || undefined,
      dueDate: data.dueDate || undefined,
      storyPoints: data.storyPoints,
    };
    
    await onSubmit(updateData);
  };

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Issue: {issue.key}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Nhập tiêu đề issue"
              />
              {errors.title && (
                <span className="text-xs text-red-500">{errors.title.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Nhập mô tả issue"
                rows={4}
              />
              {errors.description && (
                <span className="text-xs text-red-500">{errors.description.message}</span>
              )}
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Độ ưu tiên *</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ ưu tiên" />
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
              {errors.priority && (
                <span className="text-xs text-red-500">{errors.priority.message}</span>
              )}
            </div>

            {/* Issue Type */}
            <div>
              <Label htmlFor="issueType">Loại issue *</Label>
              <Select
                value={watch("issueType")}
                onValueChange={(value) => setValue("issueType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EPIC">Epic</SelectItem>
                  <SelectItem value="STORY">Story</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="SUBTASK">Subtask</SelectItem>
                </SelectContent>
              </Select>
              {errors.issueType && (
                <span className="text-xs text-red-500">{errors.issueType.message}</span>
              )}
            </div>

            {/* Assignee */}
            <div>
              <Label htmlFor="assignee">Người được giao</Label>
              <Select
                value={watch("assigneeId")}
                onValueChange={(value) => setValue("assigneeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người được giao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {projectUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sprint */}
            <div>
              <Label htmlFor="sprint">Sprint</Label>
              <Select
                value={watch("sprintId")}
                onValueChange={(value) => setValue("sprintId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Backlog</SelectItem>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate">Ngày hết hạn</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
              />
            </div>

            {/* Story Points */}
            <div>
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                max="100"
                {...register("storyPoints", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditIssueDialog; 