import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Calendar, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { toastSuccess, toastError } from "@/utils/toast";
import sprintService from "@/service/sprintService";
import type { Sprint } from "@/types/sprint";

interface SprintManagementProps {
  sprint: Sprint;
  onSprintUpdated: () => void;
  onSprintDeleted: () => void;
  canManageSprint?: boolean;
}

interface SprintFormData {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
}

const SprintManagement: React.FC<SprintManagementProps> = ({
  sprint,
  onSprintUpdated,
  onSprintDeleted,
  canManageSprint = false
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SprintFormData>({
    defaultValues: {
      name: sprint.name,
      goal: sprint.goal || "",
      startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : "",
      endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : "",
    }
  });

  const handleEditSubmit = async (data: SprintFormData) => {
    try {
      setLoading(true);
      await sprintService.updateSprint(sprint.id, {
        name: data.name,
        goal: data.goal || undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      });
      toastSuccess("Cập nhật sprint thành công!");
      setIsEditDialogOpen(false);
      onSprintUpdated();
    } catch (error) {
      console.error("Error updating sprint:", error);
      toastError("Cập nhật sprint thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await sprintService.deleteSprint(sprint.id);
      toastSuccess("Xóa sprint thành công! Tất cả issues đã được chuyển về backlog.");
      setIsDeleteDialogOpen(false);
      onSprintDeleted();
    } catch (error) {
      console.error("Error deleting sprint:", error);
      toastError("Xóa sprint thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = () => {
    reset({
      name: sprint.name,
      goal: sprint.goal || "",
      startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : "",
      endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING": return "bg-blue-100 text-blue-800";
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-gray-100 text-gray-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PLANNING": return "Lập kế hoạch";
      case "ACTIVE": return "Đang hoạt động";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{sprint.name}</CardTitle>
                           <div className="flex items-center space-x-2">
                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sprint.status)}`}>
                   {getStatusText(sprint.status)}
                 </span>
                 {canManageSprint && (
                   <div className="flex items-center space-x-1">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={openEditDialog}
                       className="h-8 w-8 p-0"
                     >
                       <Edit className="h-4 w-4" />
                     </Button>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => setIsDeleteDialogOpen(true)}
                       className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 )}
               </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sprint.goal && (
            <div className="flex items-start space-x-2">
              <Target className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{sprint.goal}</p>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {sprint.startDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(sprint.startDate).toLocaleDateString('vi-VN')}
                  {sprint.endDate && ` - ${new Date(sprint.endDate).toLocaleDateString('vi-VN')}`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Sprint</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Tên Sprint *</Label>
              <Input
                id="name"
                {...register("name", { required: "Tên sprint là bắt buộc" })}
                placeholder="Nhập tên sprint"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="goal">Mục tiêu</Label>
              <Textarea
                id="goal"
                {...register("goal")}
                placeholder="Nhập mục tiêu sprint (tùy chọn)"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa Sprint</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa sprint <strong>"{sprint.name}"</strong> không?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Tất cả issues trong sprint này sẽ được chuyển về backlog.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading ? "Đang xóa..." : "Xóa Sprint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SprintManagement; 