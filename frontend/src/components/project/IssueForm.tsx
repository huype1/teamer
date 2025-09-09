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
  issueType: z.enum(["STORY", "TASK", "BUG", "SUBTASK"]),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
  storyPoints: z.string().optional(),
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

export type IssueFormValues = {
  title: string;
  description?: string;
  priority: "P0" | "P1" | "P2" | "P3" | "P4" | "P5";
  issueType: "STORY" | "TASK" | "BUG" | "SUBTASK";
  assigneeId?: string;
  sprintId?: string;
  storyPoints?: number;
  startDate?: string;
  dueDate?: string;
  parentId?: string;
};

interface IssueFormProps {
  initialValues?: Partial<IssueFormValues>;
  onSubmit: (data: IssueFormValues) => void | Promise<void>;
  loading?: boolean;
  projectMembers: ProjectMember[];
  projectUsers?: { id: string; name: string; email?: string }[];
  sprints?: Sprint[];
  isEdit?: boolean;
  parentOptions?: { id: string; title: string }[];
  disableIssueType?: boolean;
  params?: {
    isSubtask?: boolean;
    parentIssue?: {
      sprintId?: string;
      storyPoints?: number;
      dueDate?: string;
    };
  };
}

export const IssueForm: React.FC<IssueFormProps> = ({
  initialValues,
  onSubmit,
  loading,
  projectMembers,
  projectUsers,
  sprints,
  isEdit = false,
  parentOptions = [],
  disableIssueType = false,
  params,
}) => {
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      priority: initialValues?.priority || "P3",
      issueType: params?.isSubtask ? "SUBTASK" : (initialValues?.issueType || "TASK"),
      assigneeId: initialValues?.assigneeId || "none",
      sprintId: params?.isSubtask && params?.parentIssue?.sprintId 
        ? params.parentIssue.sprintId 
        : initialValues?.sprintId || "backlog",
      storyPoints: initialValues?.storyPoints ? String(initialValues.storyPoints) : "",
      startDate: initialValues?.startDate || "",
      dueDate: initialValues?.dueDate || "",
      parentId: initialValues?.parentId || "",
    },
  });

  // Auto-set sprint from parent issue for subtasks (and keep it in sync if parent changes)
  React.useEffect(() => {
    if (params?.isSubtask) {
      const parentSprint = params?.parentIssue?.sprintId;
      setValue("sprintId", parentSprint && parentSprint !== "backlog" ? parentSprint : "backlog");
    }
  }, [params?.isSubtask, params?.parentIssue?.sprintId, setValue]);

  // Auto-set issueType to SUBTASK for subtasks
  React.useEffect(() => {
    if (params?.isSubtask) {
      setValue("issueType", "SUBTASK");
    }
  }, [params?.isSubtask, setValue]);

  const handleFormSubmit = (data: z.infer<typeof issueSchema>) => {
    const processedData: IssueFormValues = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      issueType: data.issueType,
      assigneeId: data.assigneeId === "none" ? undefined : data.assigneeId,
      sprintId: data.sprintId === "backlog" ? undefined : data.sprintId,
      storyPoints: data.storyPoints && data.storyPoints.trim() !== "" 
        ? Number(data.storyPoints) 
        : undefined,
      startDate: data.startDate,
      dueDate: data.dueDate,
      parentId: data.parentId,
    };
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 overflow-y-auto max-h-[70vh]">
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
          disabled={loading || disableIssueType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Loại issue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STORY">Story</SelectItem>
            <SelectItem value="TASK">Task</SelectItem>
            <SelectItem value="BUG">Bug</SelectItem>
            {params?.isSubtask && <SelectItem value="SUBTASK">Subtask</SelectItem>}
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
            {(projectMembers || [])
              .map(member => {
                const resolvedUser = member.user || (projectUsers ? projectUsers.find(u => u.id === member.userId) : undefined);
                return { ...member, user: resolvedUser } as typeof member & { user?: { id: string; name: string } };
              })
              .filter(member => member.role !== "VIEWER" && member.user)
              .map(member => (
                <SelectItem key={member.user!.id} value={member.user!.id}>
                  {member.user!.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {sprints && (
        <div>
          <Select
            value={watch("sprintId")}
            onValueChange={v => setValue("sprintId", v)}
            disabled={loading || params?.isSubtask}
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
          {params?.isSubtask && (
            <span className="text-xs text-muted-foreground">Subtask sẽ kế thừa sprint từ issue cha.</span>
          )}
        </div>
      )}
      <div>
        <Input
          type="text"
          placeholder={`Story Points${params?.isSubtask && params?.parentIssue?.storyPoints ? ` (Max: ${params.parentIssue.storyPoints})` : ''}`}
          {...register("storyPoints")}
          disabled={loading}
        />
         {errors.storyPoints && <span className="text-xs text-red-500">{errors.storyPoints.message}</span>}
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
            placeholder={`Ngày kết thúc${params?.isSubtask && params?.parentIssue?.dueDate ? ` (Max: ${params.parentIssue.dueDate})` : ''}`}
            {...register("dueDate")}
            disabled={loading}
            max={params?.isSubtask && params?.parentIssue?.dueDate ? params.parentIssue.dueDate : undefined}
          />
        </div>
      </div>
      {params?.isSubtask && params?.parentIssue?.dueDate && (
        <span className="text-xs text-muted-foreground">
          Ngày kết thúc phải cùng hoặc sớm hơn {params.parentIssue.dueDate} của issue cha
        </span>
      )}
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