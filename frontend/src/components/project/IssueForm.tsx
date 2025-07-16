import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProjectMember } from "@/types/project";
import type { Sprint } from "@/types/sprint";

const issueSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  priority: z.enum(["P0", "P1", "P2", "P3", "P4", "P5"]),
  issueType: z.enum(["STORY", "TASK", "BUG"]),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
  storyPoints: z.preprocess(
    (val) => val === "" || val === undefined || Number.isNaN(val) ? undefined : Number(val),
    z.number().optional()
  ),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  parentId: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.dueDate) {
      return new Date(data.startDate) <= new Date(data.dueDate);
    }
    return true;
  },
  {
    message: "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
    path: ["startDate"],
  }
);

export type IssueFormValues = z.infer<typeof issueSchema>;

interface IssueFormProps {
  initialValues?: Partial<IssueFormValues>;
  onSubmit: (data: IssueFormValues) => void | Promise<void>;
  loading?: boolean;
  projectMembers: ProjectMember[];
  sprints?: Sprint[];
  isEdit?: boolean;
  parentOptions?: { id: string; title: string }[];
}

export const IssueForm: React.FC<IssueFormProps> = ({
  initialValues,
  onSubmit,
  loading,
  projectMembers,
  sprints,
  isEdit = false,
  parentOptions = [],
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      priority: initialValues?.priority || "P3",
      issueType: initialValues?.issueType || "TASK",
      assigneeId: initialValues?.assigneeId || "none",
      sprintId: initialValues?.sprintId || "backlog",
      storyPoints: initialValues?.storyPoints,
      startDate: initialValues?.startDate || "",
      dueDate: initialValues?.dueDate || "",
      parentId: initialValues?.parentId || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[70vh]">
      <div>
        <Input
          placeholder="Tiêu đề"
          {...register("title")}
          disabled={loading}
        />
        {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
      </div>
     
      {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
      <div>
        <Select
          value={watch("priority")}
          onValueChange={v => setValue("priority", v as IssueFormValues["priority"])}
          disabled={loading}
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
          value={watch("issueType")}
          onValueChange={v => setValue("issueType", v as IssueFormValues["issueType"])}
          disabled={loading || isEdit}
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
          value={watch("assigneeId")}
          onValueChange={v => setValue("assigneeId", v)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Người được giao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không chọn</SelectItem>
            {projectMembers?.map(member => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.user?.name || 'Unknown User'}
              </SelectItem>
            )) || []}
          </SelectContent>
        </Select>
      </div>
      {sprints && (
        <div>
          <Select
            value={watch("sprintId")}
            onValueChange={v => setValue("sprintId", v)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Input
          type="number"
          placeholder="Story Points"
          {...register("storyPoints", { valueAsNumber: true })}
          disabled={loading}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="date"
            placeholder="Ngày bắt đầu"
            {...register("startDate")}
            disabled={loading}
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            placeholder="Ngày kết thúc"
            {...register("dueDate")}
            disabled={loading}
          />
        </div>
      </div>
      {parentOptions && parentOptions.length > 0 && (
        <div>
          <Select
            value={watch("parentId")}
            onValueChange={v => setValue("parentId", v)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Issue cha (nếu là subtask)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Không chọn</SelectItem>
              {parentOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>{opt.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
       <div>
        <Textarea
          placeholder="Mô tả"
          {...register("description")}
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {isEdit ? "Cập nhật" : "Tạo"}
      </Button>
    </form>
  );
}; 