import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/utils/toast";
import sprintService from "@/service/sprintService";
import type { Sprint } from "@/types/sprint";
import { Play, Square, Edit, Trash2, Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface SprintManagementProps {
  projectId: string;
  sprints: Sprint[];
  onSprintUpdate: () => void;
  canManageSprint: boolean;
}

const sprintSchema = z.object({
  name: z.string().min(1, "Tên sprint không được để trống"),
  goal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
    path: ["startDate"],
  }
);

const SprintManagement: React.FC<SprintManagementProps> = ({
  projectId,
  sprints,
  onSprintUpdate,
  canManageSprint
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: "",
      goal: "",
      startDate: "",
      endDate: "",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PLANNING":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Đang chạy";
      case "PLANNING":
        return "Đã lên kế hoạch";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Hủy";
      default:
        return status;
    }
  };

  const onCreateSprint = async (data: { name: string; goal: string; startDate: string; endDate: string }) => {
    setLoading(true);
    try {
      await sprintService.createSprint({
        name: data.name,
        goal: data.goal || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        projectId: projectId
      });
      toastSuccess("Tạo sprint thành công!");
      setIsCreateDialogOpen(false);
      reset();
      onSprintUpdate();
    } catch (error) {
      toastError("Tạo sprint thất bại!");
      console.error("Error creating sprint:", error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSprint = async (data: { name: string; goal: string; startDate: string; endDate: string }) => {
    if (!selectedSprint) return;
    setLoading(true);
    try {
      await sprintService.updateSprint(selectedSprint.id, {
        name: data.name,
        goal: data.goal || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      });
      toastSuccess("Cập nhật sprint thành công!");
      setIsEditDialogOpen(false);
      setSelectedSprint(null);
      reset();
      onSprintUpdate();
    } catch (error) {
      toastError("Cập nhật sprint thất bại!");
      console.error("Error updating sprint:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await sprintService.startSprint(sprintId);
      toastSuccess("Cập nhật trạng thái sprint thành công!");
      onSprintUpdate();
    } catch (error) {
      toastError("Bắt đầu sprint thất bại!");
      console.error("Error starting sprint:", error);
    }
  };

  const handleEndSprint = async (sprintId: string) => {
    try {
      await sprintService.endSprint(sprintId);
      toastSuccess("Cập nhật trạng thái sprint thành công!");
      onSprintUpdate();
    } catch (error) {
      toastError("Kết thúc sprint thất bại!");
      console.error("Error ending sprint:", error);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sprint này?')) return;
    try {
      await sprintService.deleteSprint(sprintId);
      toastSuccess("Xóa sprint thành công!");
      onSprintUpdate();
    } catch (error) {
      toastError("Xóa sprint thất bại!");
      console.error("Error deleting sprint:", error);
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setValue("name", sprint.name);
    setValue("goal", sprint.goal || "");
    setValue("startDate", sprint.startDate ? sprint.startDate.split('T')[0] : "");
    setValue("endDate", sprint.endDate ? sprint.endDate.split('T')[0] : "");
    setIsEditDialogOpen(true);
  };

  const activeSprint = sprints.find(s => s.status === "ACTIVE");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quản lý Sprint</h3>
        {canManageSprint && (
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tạo Sprint
          </Button>
        )}
      </div>

      {/* Active Sprint */}
      {activeSprint && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-green-800">Sprint đang chạy</span>
              <Badge className="bg-green-100 text-green-800">Đang chạy</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">{activeSprint.name}</h4>
              {activeSprint.goal && (
                <p className="text-sm text-muted-foreground">{activeSprint.goal}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {activeSprint.startDate && (
                  <span>Bắt đầu: {new Date(activeSprint.startDate).toLocaleDateString('vi-VN')}</span>
                )}
                {activeSprint.endDate && (
                  <span>Kết thúc: {new Date(activeSprint.endDate).toLocaleDateString('vi-VN')}</span>
                )}
              </div>
              {canManageSprint && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditSprint(activeSprint)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEndSprint(activeSprint.id)}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Kết thúc
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sprints */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sprints
          .filter(sprint => sprint.status !== "ACTIVE")
          .map((sprint) => (
            <Card key={sprint.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm">{sprint.name}</span>
                  <Badge className={`text-xs ${getStatusColor(sprint.status)}`}>
                    {getStatusLabel(sprint.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sprint.goal && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{sprint.goal}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {sprint.startDate && (
                      <span>Bắt đầu: {new Date(sprint.startDate).toLocaleDateString('vi-VN')}</span>
                    )}
                    {sprint.endDate && (
                      <span>Kết thúc: {new Date(sprint.endDate).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                  {canManageSprint && (
                    <div className="flex gap-1 mt-3">
                      {sprint.status === "PLANNING" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartSprint(sprint.id)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Bắt đầu
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditSprint(sprint)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteSprint(sprint.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
                {...register("name")}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
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
                {errors.startDate && <span className="text-xs text-red-500">{errors.startDate.message}</span>}
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Ngày kết thúc"
                  {...register("endDate")}
                />
                {errors.endDate && <span className="text-xs text-red-500">{errors.endDate.message}</span>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo Sprint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Sprint Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Sprint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onUpdateSprint)} className="space-y-4">
            <div>
              <Input
                placeholder="Tên sprint"
                {...register("name")}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
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
                {errors.startDate && <span className="text-xs text-red-500">{errors.startDate.message}</span>}
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Ngày kết thúc"
                  {...register("endDate")}
                />
                {errors.endDate && <span className="text-xs text-red-500">{errors.endDate.message}</span>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật Sprint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SprintManagement; 